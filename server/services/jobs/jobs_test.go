package jobs

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"net/http"
	"regexp"
	"testing"
	"time"
)

func TestExecute(t *testing.T) {
	setup()
	defer teardown()

	client := spy{}
	id, err := Execute(client, newJob())
	assert.Nil(t, err)
	assert.Equal(t, "test-id", id)
}

func TestExecute_SubmitsProperlyFormattedMessage(t *testing.T) {
	setup()
	defer teardown()

	client := spy{
		post: func(message piazza.Message) (string, error) {
			serialized, _ := json.Marshal(message)
			pattern := regexp.MustCompile(`Beachfront_[^"]+\.geojson`)
			assert.JSONEq(t, PZ_EXECUTION_MESSAGE, pattern.ReplaceAllString(string(serialized), "test-output-filename.geojson"))

			return "test-id", nil
		}}

	Execute(client, newJob())
}

func TestExecute_AddsNewJobsToCache(t *testing.T) {
	setup()
	defer teardown()

	client := spy{}

	Execute(client, newJob())

	assert.Len(t, cache, 1)
	assert.Equal(t, cache["test-id"].Status, piazza.StatusRunning)
}

func TestExecute_DoesNotAddFailedSubmissionToCache(t *testing.T) {
	setup()
	defer teardown()

	client := spy{
		post: func(piazza.Message) (string, error) {
			return "", piazza.HttpError{
				&http.Response{StatusCode: http.StatusServiceUnavailable}}
		}}

	Execute(client, newJob())

	assert.Len(t, cache, 0)
}

func TestExecute_GracefullyHandlesErrors(t *testing.T) {
	setup()
	defer teardown()

	SetPollingInterval(0)
	PollingMaxAttempts(2)

	timesCalled := 0

	client := spy{
		post: func(piazza.Message) (string, error) {
			timesCalled += 1
			return "", piazza.HttpError{
				&http.Response{StatusCode: http.StatusServiceUnavailable}}
		}}

	Execute(client, newJob())

	time.Sleep(5 * time.Millisecond)
	assert.Equal(t, 1, timesCalled)
}

func TestExecute_Dispatches(t *testing.T) {
	setup()
	defer teardown()

	SetPollingInterval(0)
	PollingMaxAttempts(0)

	statusRequested := expectedIn(10 * time.Millisecond)

	client := spy{
		get: func(id string) (*piazza.Status, error) {
			statusRequested <- true
			return &piazza.Status{
				JobID:  "test-id",
				Type:   "status",
				Status: piazza.StatusSuccess,
				Result: struct{ DataID string }{"test-result-id"},
			}, nil
		}}

	Execute(client, newJob())

	assert.True(t, <-statusRequested)
}

func TestDispatch_HaltsAfterMaxAttemptsReached(t *testing.T) {
	setup()
	defer teardown()

	SetPollingInterval(0)
	PollingMaxAttempts(2)

	timesCalled := 0

	client := spy{
		get: func(id string) (*piazza.Status, error) {
			timesCalled += 1
			return &piazza.Status{
				JobID:  "test-zombie",
				Type:   "status",
				Status: piazza.StatusRunning,
			}, nil
		}}

	job := newJob()
	job.ID = "test-zombie"
	dispatch(client, &job)

	time.Sleep(5 * time.Millisecond)
	assert.Equal(t, 2, timesCalled)
}

func TestDispatch_HaltsOnError(t *testing.T) {
	setup()
	defer teardown()

	SetPollingInterval(0)
	PollingMaxAttempts(2)

	timesCalled := 0

	client := spy{
		get: func(id string) (*piazza.Status, error) {
			timesCalled += 1
			return nil, piazza.JobError{"Forced error"}
		}}

	job := newJob()
	job.ID = "test-throws-pz-error"
	dispatch(client, &job)

	time.Sleep(5 * time.Millisecond)
	assert.Equal(t, 1, timesCalled)
}

func TestDispatch_GracefullyHandlesErrors(t *testing.T) {
	setup()
	defer teardown()

	SetPollingInterval(0)
	PollingMaxAttempts(2)

	timesCalled := 0

	client := spy{
		get: func(id string) (*piazza.Status, error) {
			timesCalled += 1
			return nil, piazza.HttpError{
				&http.Response{StatusCode: http.StatusServiceUnavailable}}
		}}

	job := newJob()
	job.ID = "test-throws-http-error"
	dispatch(client, &job)

	time.Sleep(5 * time.Millisecond)
	assert.Equal(t, 1, timesCalled)
}

func TestList(t *testing.T) {
	setup()
	defer teardown()

	jobs := List()
	assert.Len(t, jobs, 0)
}

func TestList_ReturnsCachedJobs(t *testing.T) {
	setup()
	defer teardown()

	populateCache()
	jobs := List()
	assert.Len(t, jobs, 1)
}

//
// Helpers
//

func expectedIn(duration time.Duration) chan bool {
	happened := make(chan bool)
	go func() {
		time.Sleep(duration)
		happened <- false
	}()
	return happened
}

func newJob() beachfront.Job {
	return beachfront.Job{
		CreatedOn:     time.Now(),
		AlgorithmID:   "test-algorithm-id",
		AlgorithmName: "test-algorithm-name",
		Name:          "test-name",
		Images:        []beachfront.Image{{"test-image-id1", "TEST-IMAGE-1.TIF"}, {"test-image-id2", "TEST-IMAGE-2.TIF"}},
	}
}

func populateCache() {
	job := newJob()
	cache["test"] = &job
}

func setup() {
	Initialize()
}

func teardown() {
	Reset()
}

//
// Mocks
//

type spy struct {
	piazza.JobSubmitter
	piazza.JobRetriever
	post func(piazza.Message) (string, error)
	get  func(string) (*piazza.Status, error)
}

func (s spy) Post(message piazza.Message) (string, error) {
	if s.post != nil {
		return s.post(message)
	}
	return "test-id", nil
}

func (s spy) GetStatus(id string) (*piazza.Status, error) {
	if s.get != nil {
		return s.get(id)
	}
	return &piazza.Status{
		JobID:  "test-id",
		Type:   "status",
		Status: piazza.StatusSuccess,
		Result: struct{ DataID string }{"test-result-id"},
	}, nil
}

//
// Fixtures
//

const (
	PZ_EXECUTION_MESSAGE = `{
		"data": {
			"dataInputs": {
				"cmd": {
					"content": "shoreline --image TEST-IMAGE-1.TIF,TEST-IMAGE-2.TIF --projection geo-scaled --threshold 0.5 --tolerance 0 test-output-filename.geojson",
					"type": "urlparameter"
				},
				"inFiles": {
					"content": "test-image-id1,test-image-id2",
					"type": "urlparameter"
				},
				"outGeoJson": {
					"content": "test-output-filename.geojson",
					"type": "urlparameter"
				}
			},
			"dataOutput": [
				{
					"mimeType": "application/json",
					"type": "text"
				}
			],
			"serviceId": "test-algorithm-id"
		},
		"type": "execute-service"
	}`
)
