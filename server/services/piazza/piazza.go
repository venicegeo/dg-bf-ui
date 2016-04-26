package piazza

import (
    "bytes"
    "encoding/json"
    "fmt"
    "github.com/venicegeo/bf-ui/server/domain"
    "github.com/venicegeo/bf-ui/server/utils"
    "io"
    "io/ioutil"
    "mime/multipart"
    "net/http"
    "regexp"
    "time"
)

const (
    AlgorithmSearchPollingInterval        = 500 * time.Millisecond // TODO -- verify that this is a sane poll frequency
    AlgorithmSearchPollingMaximumAttempts = 10
    AlgorithmSearchCacheTTL               = 1 * time.Minute
    JobStatusPollingInterval              = 15 * time.Second // TODO -- verify that this is a sane poll frequency
    JobStatusPollingMaximumAttempts       = 60
    FileEndpoint                          = "http://localhost:3000/file" //"http://pz-gateway.stage.geointservices.io/file"
    JobEndpoint                           = "http://localhost:3000/job"  //"http://pz-gateway.stage.geointservices.io/job"
    TestingUserName                       = "test-username"
)

var (
    // Caches
    // FIXME -- probably not thread-safe
    algorithmCache = make(map[string]*beachfront.Algorithm)
    jobCache       = make(map[string]*beachfront.Job)
)

func FetchAlgorithms() (algorithms []beachfront.Algorithm, err error) {
    logger := utils.ContextLogger{"SearchForAlgorithms"}
    initiation, err := sendMessage(JobEndpoint, buildSearchMessage())
    logger.Info("[job:%s] started", initiation.JobID)
    completion, err := await(JobEndpoint, buildGetMessage(initiation.JobID), AlgorithmSearchPollingInterval, AlgorithmSearchPollingMaximumAttempts)
    algorithms = extractAlgorithms(completion)
    return
}

func FetchGeoJSON(resultId string) ([]byte, error) {
    logger := utils.ContextLogger{"FetchGeoJSON"}

    // FIXME -- there has to be a way to streamline this whole process

    // Fetch metadata
    logger.Info("[result:%s] Fetching metadata", resultId)
    rawMetadata, err := retrieveFileContents(resultId)
    if err != nil {
        return nil, FileRetrievalError{"Failed to fetch metadata"}
    }

    // Parse the metadata
    logger.Debug("[result:%s] Exracting metadata: %s", resultId, rawMetadata)
    var metadata struct {
        OutFiles map[string]string
    }
    err = json.Unmarshal(rawMetadata, &metadata)
    if err != nil {
        return nil, FileRetrievalError{"Could not parse metadata"}
    }

    // Follow the trail to the GeoJSON
    pattern, _ := regexp.Compile("^Beachfront_(.*)\\.geojson$")
    for filename, dataId := range metadata.OutFiles {
        if pattern.MatchString(filename) {
            logger.Debug("[result:%s] Fetching `%s` (%s)", resultId, dataId, filename)
            return retrieveFileContents(dataId)
        }
    }
    logger.Error("[file:]", resultId)
    return nil, FileRetrievalError{"Could not find GeoJSON file in metadata"}
}

func GetCachedAlgorithms() []beachfront.Algorithm {
    algorithms := make([]beachfront.Algorithm, 0)
    for _, algorithm := range algorithmCache {
        algorithms = append(algorithms, *algorithm)
    }
    return algorithms
}

func GetCachedBeachfrontJobs() []beachfront.Job {
    jobs := make([]beachfront.Job, 0)
    for _, job := range jobCache {
        jobs = append(jobs, *job)
    }
    return jobs
}

func WorkerForAlgorithmCache() {
    defer WorkerForAlgorithmCache()
    logger := utils.ContextLogger{"WorkerForAlgorithmCache"}
    logger.Info("Updating cache")
    cache := make(map[string]*beachfront.Algorithm, 0)
    if algorithms, err := FetchAlgorithms(); err == nil {
        for _, algorithm := range algorithms {
            cache[algorithm.ID] = &algorithm
        }
        algorithmCache = cache
    }
    logger.Info("Next update in %d minute(s)", AlgorithmSearchCacheTTL/time.Minute)
    time.Sleep(AlgorithmSearchCacheTTL)
}

func SubmitJob(job beachfront.Job) (err error) {
    logger := utils.ContextLogger{"SubmitJob"}
    message := buildSubmitMessage(job.AlgorithmID, job.ImageFilenames(), job.ResultFilename, job.ImageIDs())
    if response, err := sendMessage(JobEndpoint, message); err != nil {
        logger.Error("%s: %s", err, job)
    } else {
        job.ID = response.JobID
        job.Status = Submitted
        logger.Info("[job:%s] started", job.ID)
        go dispatchJobSubmissionFollowup(&job)
    }
    return
}

//
// Internals
//

func await(endpoint string, message Message, interval time.Duration, maximumAttempts int) (response JobResponse, err error) {
    logger := utils.ContextLogger{"await"}
    attempt := 0
    for err == nil {
        attempt++
        time.Sleep(interval)
        response, err = sendMessage(endpoint, message)
        logger.Debug("[job:%s] poll #%d (%s)", response.JobID, attempt, response.Status)
        switch {
        case response.Status == Success:
            return
        case attempt == maximumAttempts:
            err = TooManyAttemptsError{Count: maximumAttempts}
        }
    }
    logger.Error("[job:%s] polling failed: %s", response.JobID, err)
    return
}

func buildGetMessage(id string) Message {
    return Message{
        UserName: TestingUserName,
        JobType: JobType{
            JobID: id,
            Type:  "get",
        },
    }
}

func buildFileRetrievalMessage(dataId string) Message {
    return Message{
        UserName: TestingUserName,
        DataID:   dataId,
    }
}

func buildSearchMessage() Message {
    return Message{
        UserName: TestingUserName,
        JobType: JobType{
            Data: SearchParameters{
                Field:   "name",
                Pattern: "BF_Algo",
                // TODO -- some way to exclude `resourceMetadata.availability` `OUTOFSERVICE` from here?  Wasteful to fetch junk data only to discard
            },
            Type: "search-service",
        },
    }
}

func buildSubmitMessage(algorithmId, inputFilenames, outputFilename, imageIds string) Message {
    return Message{
        UserName: TestingUserName,
        JobType: JobType{
            Data: map[string]interface{}{ // TODO -- refine this abstraction
                "dataInputs": map[string]ExecutionInputs{
                    "": ExecutionInputs{
                        Content: "cmd=shoreline" +
                            " --image " + inputFilenames +
                            " --projection geo-scaled" +
                            " --threshold 0.5" +
                            " --tolerance 0" +
                            " " + outputFilename +
                            "&inFiles=" + imageIds +
                            "&outGeoJson=" + outputFilename,
                        Type: "text",
                    },
                },
                "serviceId": algorithmId,
            },
            Type: "execute-service",
        },
    }
}

func dispatchJobSubmissionFollowup(job *beachfront.Job) {
    jobCache[job.ID] = job
    message := buildGetMessage(job.ID)
    response, err := await(JobEndpoint, message, JobStatusPollingInterval, JobStatusPollingMaximumAttempts)
    if err == nil {
        job.Status = response.Status
        job.ResultID = response.Result.DataID
    } else {
        job.Status = Error
    }
}

func extractAlgorithms(response JobResponse) []beachfront.Algorithm {
    logger := utils.ContextLogger{"extractAlgorithms"}
    var records []RawAlgorithm
    json.Unmarshal([]byte(response.Result.Text), &records)
    logger.Debug("[job:%s] received %d algorithms: %s", response.JobID, len(records), response.Result.Text)
    algorithms := make([]beachfront.Algorithm, 0)
    for _, record := range records {
        if record.IsAvailable() {
            algorithm := beachfront.Algorithm{
                ID:          record.ID,
                Name:        record.ResourceMetadata.Name,
                Description: record.ResourceMetadata.Description}

            // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
            // HACK -- overriding because it doesn't look like the current algos actually _list_ inputs
            algorithm.Inputs = []beachfront.AlgorithmInput{{"--image", "Images", beachfront.AlgorithmTypeImage}}
            // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
            // HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

            algorithms = append(algorithms, algorithm)
        }
    }
    return algorithms
}

func retrieveFileContents(dataId string) ([]byte, error) {
    contentType, body := serialize(buildFileRetrievalMessage(dataId))
    response, err := http.Post(FileEndpoint, contentType, body)
    if err != nil {
        return nil, err
    }
    if response.StatusCode != http.StatusOK {
        return nil, FileRetrievalError{response.Status}
    }
    return ioutil.ReadAll(response.Body)
}

func sendMessage(url string, message Message) (response JobResponse, err error) {
    contentType, body := serialize(message)
    var (
        httpResponse     *http.Response
        httpResponseBody []byte
    )
    if httpResponse, err = http.Post(url, contentType, body); err != nil {
        return
    }
    if httpResponseBody, err = ioutil.ReadAll(httpResponse.Body); err != nil {
        return
    }
    if err = json.Unmarshal(httpResponseBody, &response); err != nil {
        return
    }
    if response.Status == Error || response.Type == "error" {
        err = StatusError{response.Message}
    }
    return
}

func serialize(payload interface{}) (string, io.Reader) {
    buffer := &bytes.Buffer{}
    writer := multipart.NewWriter(buffer)
    serialized, _ := json.Marshal(payload)
    writer.WriteField("body", string(serialized))
    writer.Close()
    contentType := writer.FormDataContentType()
    return contentType, buffer
}

//
// Errors
//

type FileRetrievalError struct {
    Message string
}

func (e FileRetrievalError) Error() string {
    return fmt.Sprintf("FileRetrievalError: %s", e.Message)
}

type StatusError struct {
    Message string
}

func (e StatusError) Error() string {
    return fmt.Sprintf("StatusError: %s", e.Message)
}

type TooManyAttemptsError struct {
    Count int
}

func (e TooManyAttemptsError) Error() string {
    return fmt.Sprintf("TooManyAttemptsError: (max=%d)", e.Count)
}
