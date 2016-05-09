package jobs

import (
	"fmt"
	"strings"
	"time"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/common/logger"
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

	data struct {
		DataInputs  dataInputs   `json:"dataInputs"`
		DataOutput  []dataOutput `json:"dataOutput"`
		AlgorithmId string       `json:"serviceId"`
	}

	dataInputs struct {
		Command        input `json:"cmd"`
		InputFiles     input `json:"inFiles"`
		OutputFilename input `json:"outGeoJson"`
	}

	dataOutput struct {
		MimeType string `json:"mimeType"`
		Type     string `json:"type"`
	}

	input struct {
		Type    string `json:"type"`
		Content string `json:"content"`
	}
)

func Execute(client client, job beachfront.Job) (jobId string, err error) {
	logger := logger.New()

	job.CreatedOn = time.Now()
	job.ResultFilename = generateOutputFilename()

	message := newExecutionMessage(job.AlgorithmID, job.ResultFilename, job.ImageIDs)

	jobId, err = client.Post(message)
	if err != nil {
		logger.Error("%s: %s", err, job)
		return
	}

	logger.Info("<%s> Started", jobId)
	job.ID = jobId
	job.Status = piazza.StatusRunning
	cache[jobId] = &job

	go dispatch(client, &job)

	return
}

func Initialize() {
	cache = make(map[string]*beachfront.Job)
}

func List() []beachfront.Job {
	jobs := make([]beachfront.Job, 0)
	for _, job := range cache {
		jobs = append(jobs, *job)
	}
	return jobs
}

func PollingMaxAttempts(value int) {
	pollingMaximumAttempts = value
}

func Reset() {
	cache = nil
	pollingInterval = defaultPollingInterval
	pollingMaximumAttempts = defaultPollingMaximumAttempts
}

func SetPollingInterval(value time.Duration) {
	pollingInterval = value
}

//
// Internals
//

func dispatch(client piazza.JobRetriever, job *beachfront.Job) {
	logger := logger.New()

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
		logger.Debug("<%s> Poll #%d (%s)", status.JobID, attempt, status.Status)
		switch {
		case status.Status == piazza.StatusSuccess:
			job.Status = status.Status
			job.ResultID = status.Result.DataID
			return
		case status.Status == piazza.StatusError:
			err = ErrExecution{status.Message}
		case attempt >= pollingMaximumAttempts:
			err = ErrTooManyAttempts{Count: pollingMaximumAttempts}
		}
	}

	job.Status = piazza.StatusError
	logger.Error("<%s> Polling failed: %s", job.ID, err)
}

func generateOutputFilename() string {
	return fmt.Sprintf("Beachfront_%s.geojson", time.Now().UTC().Format("20060102.150405.99999"))
}

func newExecutionMessage(algorithmId, outputFilename string, imageIds []string) piazza.Message {
	filenames := make([]string, 0)
	for _, id := range imageIds {
		filenames = append(filenames, id+".TIF")
	}
	command := fmt.Sprintf("shoreline --image %s --projection geo-scaled --threshold 0.5 --tolerance 0 %s", strings.Join(filenames, ","), outputFilename)

	return piazza.Message{
		"execute-service",
		data{
			dataInputs{
				input{"urlparameter", command},
				input{"urlparameter", strings.Join(imageIds, ",")},
				input{"urlparameter", outputFilename},
			},
			[]dataOutput{{"application/json", "text"}},
			algorithmId,
		},
	}
}

//
// Errors
//

type (
	ErrExecution struct {
		Message string
	}
	ErrTooManyAttempts struct {
		Count int
	}
)

func (e ErrTooManyAttempts) Error() string {
	return fmt.Sprintf("ErrTooManyAttempts: (max=%d)", e.Count)
}

func (e ErrExecution) Error() string {
	return fmt.Sprintf("ErrExecution: %s", e.Message)
}
