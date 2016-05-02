package jobs

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
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

	client := spy{post: func(message piazza.Message) (string, error) {
		serialized, _ := json.Marshal(message)
		pattern := regexp.MustCompile(`Beachfront_[^"]+\.geojson`)
		assert.JSONEq(t, PZ_EXECUTION_MESSAGE, pattern.ReplaceAllString(string(serialized), "test-output-filename.geojson"))

		return "test-id", nil
	}}

	Execute(client, newJob())
}

func TestExecute_Dispatches(t *testing.T) {
	setup()
	defer teardown()

	// FIXME -- make this concrete
	pollingInterval = 1 * time.Nanosecond
	pollingMaximumAttempts = 1

	statusRequested := expectedIn(10 * time.Millisecond)

	client := spy{get: func(id string) (*piazza.Status, error) {
		statusRequested <-true
		return &piazza.Status{
			Type: "status",
			Status: piazza.StatusSuccess,
			Result: struct{ DataID string }{"test-result-id"},
		}, nil
	}}

	Execute(client, newJob())

	assert.True(t, <-statusRequested)
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
		happened <-false
	}()
	return happened
}

func setup() {
	Initialize()
}

func teardown() {
	Reset()
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

//
// Mocks
//

type spy struct {
	piazza.JobSubmitter
	piazza.JobRetriever
	post func(piazza.Message) (string, error)
	get func(string) (*piazza.Status, error)
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
		Type: "status",
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
