package jobs

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"testing"
	"time"
)

func TestNewExecutionMessage_FormatsMessageProperly(t *testing.T) {
	message := newExecutionMessage("test-algorithm-id", "TEST-IMG-1.TIF,TEST-IMG-2.TIF", "test-output-filename.geojson", "test-image-id1,test-image-id2")
	serialized, _ := json.Marshal(message)
	assert.JSONEq(t, string(serialized), PZ_EXECUTION_MESSAGE)
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
	piazza.Initialize("http://m")
	Initialize()
}

func teardown() {
	piazza.Reset()
	Reset()
}

func newMockJob() *beachfront.Job {
	return &beachfront.Job{
		CreatedOn:     time.Now(),
		AlgorithmID:   "test-algorithm-id",
		AlgorithmName: "test-algorithm-name",
		Name:          "test-name",
		//Images: []beachfront.Image{}
		ResultFilename: "test-output-filename.geojson",
		ResultID:       "test-resultid",
		Status:         "test-status",
	}
}

func populateCache() {
	cache["test"] = newMockJob()
}

//
// Fixtures
//

const (
	PZ_EXECUTION_MESSAGE = `{
		"data": {
			"dataInputs": {
				"cmd": {
					"content": "shoreline --image TEST-IMG-1.TIF,TEST-IMG-2.TIF --projection geo-scaled --threshold 0.5 --tolerance 0 test-output-filename.geojson",
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
