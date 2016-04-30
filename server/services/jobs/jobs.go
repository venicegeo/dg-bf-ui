package jobs

import (
	"fmt"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"time"
)

const (
	pollingInterval        = 15 * time.Second
	pollingMaximumAttempts = 60
)

var (
	cache = make(map[string]*beachfront.Job)
)

type (
	TooManyAttemptsError struct {
		Count int
	}
)

func executionMessage(algorithmId, inputFilenames, outputFilename, imageIds string) piazza.Message {
	type (
		output struct {
			MimeType string `json:"mimeType"`
			Type     string `json:"type"`
		}
		value struct {
			Type    string `json:"type"`
			Content string `json:"content"`
		}
		inputs struct {
			Command        value `json:"cmd"`
			InputFiles     value `json:"inFiles"`
			OutputFilename value `json:"outGeoJson"`
		}
		data struct {
			DataInputs  inputs `json:"dataInputs"`
			DataOutput  []output `json:"dataOutput"`
			AlgorithmId string `json:"serviceId"`
		}
	)

	command := fmt.Sprintf("shoreline --image %s --projection geo-scaled --threshold 0.5 --tolerance 0 %s", inputFilenames, outputFilename)

	return piazza.Message{
		"execute-service",
		data{
			inputs{
				value{"urlparameter", command},
				value{"urlparameter", imageIds},
				value{"urlparameter", outputFilename},
			},
			[]output{{"application/json", "text"}},
			algorithmId,
		},
	}
}

//func GetCachedBeachfrontJobs() []beachfront.Job {
//	jobs := make([]beachfront.Job, 0)
//	for _, job := range jobCache {
//		jobs = append(jobs, *job)
//	}
//	return jobs
//}
//
//func FetchGeoJSON(resultId string) ([]byte, error) {
//	logger := utils.ContextLogger{"FetchGeoJSON"}
//
//	// FIXME -- there has to be a way to streamline this whole process
//
//	// Fetch metadata
//	logger.Info("[result:%s] Fetching metadata", resultId)
//	rawMetadata, err := retrieveFileContents(resultId)
//	if err != nil {
//		return nil, FileRetrievalError{"Failed to fetch metadata"}
//	}
//
//	// Parse the metadata
//	logger.Debug("[result:%s] Exracting metadata: %s", resultId, rawMetadata)
//	var metadata struct {
//		OutFiles map[string]string
//	}
//	err = json.Unmarshal(rawMetadata, &metadata)
//	if err != nil {
//		return nil, FileRetrievalError{"Could not parse metadata"}
//	}
//
//	// Follow the trail to the GeoJSON
//	pattern, _ := regexp.Compile("^Beachfront_(.*)\\.geojson$")
//	for filename, dataId := range metadata.OutFiles {
//		if pattern.MatchString(filename) {
//			logger.Debug("[result:%s] Fetching `%s` (%s)", resultId, dataId, filename)
//			return retrieveFileContents(dataId)
//		}
//	}
//	logger.Error("[file:]", resultId)
//	return nil, FileRetrievalError{"Could not find GeoJSON file in metadata"}
//}
//
//func GetResult(resultId string) []byte {
//
//}
//
//func Execute(job beachfront.Job) (id string, err error) {
//	job.CreatedOn = time.Now()
//	job.ResultFilename = generateJobResultFilename()
//	logger := utils.ContextLogger{"SubmitJob"}
//	message := buildSubmitMessage(job.AlgorithmID, job.ImageFilenames(), job.ResultFilename, job.ImageIDs())
//	if response, err := sendMessage(JobEndpoint, message); err != nil {
//		logger.Error("%s: %s", err, job)
//	} else {
//		job.ID = response.JobID
//		job.Status = Submitted
//		logger.Info("[job:%s] started", job.ID)
//		go dispatchJobSubmissionFollowup(&job)
//	}
//	return
//
//}
//
//func List() ([]beachfront.Job, error) {
//
//}
//
//func retrieveFileContents(dataId string) ([]byte, error) {
//	contentType, body := serialize(buildFileRetrievalMessage(dataId))
//	response, err := http.Post(FileEndpoint, contentType, body)
//	if err != nil {
//		return nil, err
//	}
//	if response.StatusCode != http.StatusOK {
//		return nil, FileRetrievalError{response.Status}
//	}
//	return ioutil.ReadAll(response.Body)
//}
//
//func dispatchJobSubmissionFollowup(job *beachfront.Job) {
//	jobCache[job.ID] = job
//	message := buildGetMessage(job.ID)
//	response, err := await(JobEndpoint, message, JobStatusPollingInterval, JobStatusPollingMaximumAttempts)
//	if err == nil {
//		job.Status = response.Status
//		job.ResultID = response.Result.DataID
//	} else {
//		job.Status = Error
//	}
//}
//
//func await(endpoint string, message Message, interval time.Duration, maximumAttempts int) (response JobResponse, err error) {
//	logger := utils.ContextLogger{"await"}
//	attempt := 0
//	for err == nil {
//		attempt++
//		time.Sleep(interval)
//		response, err = sendMessage(endpoint, message)
//		logger.Debug("[job:%s] poll #%d (%s)", response.JobID, attempt, response.Status)
//		switch {
//		case response.Status == Success:
//			return
//		case attempt == maximumAttempts:
//			err = TooManyAttemptsError{Count: maximumAttempts}
//		}
//	}
//	logger.Error("[job:%s] polling failed: %s", response.JobID, err)
//	return
//}
//
//func generateJobResultFilename() string {
//	return fmt.Sprintf("Beachfront_%s.geojson", time.Now().UTC().Format("20060102.150405.99999"))
//}
//
//func (e TooManyAttemptsError) Error() string {
//	return fmt.Sprintf("TooManyAttemptsError: (max=%d)", e.Count)
//}
