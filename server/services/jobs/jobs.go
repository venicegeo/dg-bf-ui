package jobs

import (
	"fmt"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/utils"
	"time"
)

const (
	defaultPollingInterval        = 15 * time.Second
	defaultPollingMaximumAttempts = 60
)

var (
	cache                  map[string]*beachfront.Job
	pollingInterval        = defaultPollingInterval
	pollingMaximumAttempts = defaultPollingMaximumAttempts
)

type (
	client interface {
		piazza.JobRetriever
		piazza.JobSubmitter
	}
)

func Initialize() {
	cache = make(map[string]*beachfront.Job)
}

func Reset() {
	cache = nil
	pollingInterval = defaultPollingInterval
	pollingMaximumAttempts = defaultPollingMaximumAttempts
}

func SetPollingInterval(value time.Duration) {
	pollingInterval = value
}

func PollingMaxAttempts(value int) {
	pollingMaximumAttempts = value
}

func List() []beachfront.Job {
	jobs := make([]beachfront.Job, 0)
	for _, job := range cache {
		jobs = append(jobs, *job)
	}
	return jobs
}

func Execute(client client, job beachfront.Job) (jobId string, err error) {
	logger := utils.ContextLogger{"Execute"}

	job.CreatedOn = time.Now()
	job.ResultFilename = generateOutputFilename()

	message := newExecutionMessage(job.AlgorithmID, job.ImageFilenames(), job.ResultFilename, job.ImageIDs())

	jobId, err = client.Post(message)
	if err != nil {
		logger.Error("%s: %s", err, job)
		return
	}

	logger.Info("[job:%s] started", jobId)
	job.ID = jobId
	job.Status = piazza.StatusRunning
	cache[jobId] = &job
	go dispatch(client, &job)

	return
}

//
// Internals
//

func dispatch(client piazza.JobRetriever, job *beachfront.Job) {
	logger := utils.ContextLogger{"dispatch"}

	var status *piazza.Status
	var err error

	attempt := 0
	for err == nil {
		attempt += 1
		time.Sleep(pollingInterval)
		status, err = client.GetStatus(job.ID)
		if err != nil {
			break
		}
		logger.Debug("[job:%s] poll #%d (%s)", status.JobID, attempt, status.Status)
		switch {
		case status.Status == piazza.StatusSuccess:
			job.Status = status.Status
			job.ResultID = status.Result.DataID
			return
		case attempt >= pollingMaximumAttempts:
			err = TooManyAttemptsError{Count: pollingMaximumAttempts}
		}
	}

	job.Status = piazza.StatusError
	logger.Error("[job:%s] polling failed: %s", job.ID, err)
}

func generateOutputFilename() string {
	return fmt.Sprintf("Beachfront_%s.geojson", time.Now().UTC().Format("20060102.150405.99999"))
}

func newExecutionMessage(algorithmId, inputFilenames, outputFilename, imageIds string) piazza.Message {
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
			DataInputs  inputs   `json:"dataInputs"`
			DataOutput  []output `json:"dataOutput"`
			AlgorithmId string   `json:"serviceId"`
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

//
// Errors
//

type TooManyAttemptsError struct {
	Count int
}

func (e TooManyAttemptsError) Error() string {
	return fmt.Sprintf("TooManyAttemptsError: (max=%d)", e.Count)
}
