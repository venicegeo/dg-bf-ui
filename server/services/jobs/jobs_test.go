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

	client := _submitter{ReturnID: "test-id"}
	job := newJob()
	id, err := Execute(&client, job)
	assert.Nil(t, err)
	assert.Equal(t, "test-id", id)
}

func TestExecute_SubmitsProperlyFormattedMessage(t *testing.T) {
	setup()
	defer teardown()

	client := _submitter{ReturnID: "test-id"}
	job := newJob()
	Execute(&client, job)

	serialized, _ := json.Marshal(client.Message)

	pattern := regexp.MustCompile(`Beachfront_[^"]+\.geojson`)
	assert.JSONEq(t, PZ_EXECUTION_MESSAGE, pattern.ReplaceAllString(string(serialized), "test-output-filename.geojson"))
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

type _submitter struct {
	piazza.JobSubmitter
	ReturnID    string
	ReturnError error
	Message     piazza.Message
}

func (s *_submitter) Post(message piazza.Message) (string, error) {
	s.Message = message
	if s.ReturnError != nil {
		return "", s.ReturnError
	}
	return s.ReturnID, nil
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
