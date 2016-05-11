package piazza

import (
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/stretchr/testify/assert"
)

func TestInstantiate(t *testing.T) {
	client := NewClient("http://test-gateway")
	assert.Equal(t, "http://test-gateway", client.Gateway())
}

func TestInstantiate_NormalizesGateway(t *testing.T) {
	client := NewClient("http://test-gateway/////")
	assert.Equal(t, "http://test-gateway", client.Gateway())
}

func TestGetFile(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/file/test-id",
		httpmock.NewStringResponder(200, PZ_FILE_RESPONSE))

	client := NewClient("http://m")
	_, err := client.GetFile("test-id")

	assert.NoError(t, err)
}

func TestGetFile_HandlesHttpErrorsGracefully(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/file/test-id",
		httpmock.NewStringResponder(500, PZ_FILE_ERROR_RESPONSE))

	client := NewClient("http://m")
	contents, err := client.GetFile("test-id")

	assert.Nil(t, contents)
	assert.Error(t, err)
}

func TestGetFile_DoesNotModifyPayload(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/file/test-id",
		httpmock.NewStringResponder(200, PZ_FILE_RESPONSE))

	client := NewClient("http://m")
	contents, _ := client.GetFile("test-id")

	assert.Equal(t, []byte(PZ_FILE_RESPONSE), contents)
}

func TestGetServices(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/service",
		httpmock.NewStringResponder(200, PZ_SERVICE_RESPONSE))

	client := NewClient("http://m")
	services, err := client.GetServices(SearchParameters{"test-pattern"})

	assert.NoError(t, err)
	assert.Len(t, services, 2)
}

func TestGetServices_DeserializesMetadata(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/service",
		httpmock.NewStringResponder(200, PZ_SERVICE_RESPONSE))

	client := NewClient("http://m")
	services, _ := client.GetServices(SearchParameters{"test-pattern"})

	assert.Equal(t, "test-id-1", services[0].ID)
	assert.Equal(t, "test-name", services[0].ResourceMetadata.Name)
	assert.Equal(t, "test-description", services[0].ResourceMetadata.Description)
	assert.Equal(t, "test-availability", services[0].ResourceMetadata.Availability)
}

func TestGetServices_SpecifiesCriteria(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/service",
		func(req *http.Request) (*http.Response, error) {
			assert.Equal(t, "test-pattern", req.URL.Query().Get("keyword"))
			return httpmock.NewStringResponse(200, PZ_SERVICE_RESPONSE), nil
		})

	client := NewClient("http://m")
	client.GetServices(SearchParameters{"test-pattern"})
}

func TestGetServices_HandlesHttpErrorsGracefully(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/service",
		httpmock.NewStringResponder(500, PZ_FILE_ERROR_RESPONSE))

	client := NewClient("http://m")
	services, err := client.GetServices(SearchParameters{"test-pattern"})

	assert.Nil(t, services)
	assert.Error(t, err)
}

func TestGetStatus(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(200, PZ_JOB_RUNNING_RESPONSE))

	client := NewClient("http://m")
	status, err := client.GetStatus("test-id")

	assert.Nil(t, err)
	assert.NotNil(t, status)
}

func TestGetStatus_JobRunning(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(200, PZ_JOB_RUNNING_RESPONSE))

	client := NewClient("http://m")
	status, _ := client.GetStatus("test-id")

	assert.Equal(t, "test-id", status.JobID)
	assert.Equal(t, StatusRunning, status.Status)
	assert.Empty(t, status.Result.DataID)
	assert.Empty(t, status.Message)
}

func TestGetStatus_JobSucceeded(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(200, PZ_JOB_SUCCESS_RESPONSE))

	client := NewClient("http://m")
	status, _ := client.GetStatus("test-id")

	assert.Equal(t, "test-id", status.JobID)
	assert.Equal(t, StatusSuccess, status.Status)
	assert.Equal(t, "test-data-id", status.Result.DataID)
	assert.Empty(t, status.Message)
}

func TestGetStatus_JobFailed(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(200, PZ_JOB_ERROR_RESPONSE))

	client := NewClient("http://m")
	status, _ := client.GetStatus("test-id")

	assert.Equal(t, "test-id", status.JobID)
	assert.Equal(t, StatusError, status.Status)
	assert.Empty(t, status.Message)
	assert.Empty(t, status.Result.DataID)
}

func TestGetStatus_JobNotFound(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(500, PZ_JOB_NOT_FOUND_RESPONSE))

	client := NewClient("http://m")
	status, err := client.GetStatus("test-id")

	assert.Nil(t, status)
	assert.Error(t, err)
}

func TestGetStatus_HandlesHttpErrorsGracefully(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("GET", "http://m/job/test-id",
		httpmock.NewStringResponder(500, PZ_JOB_ERROR_RESPONSE))

	client := NewClient("http://m")
	status, err := client.GetStatus("test-id")

	assert.Nil(t, status)
	assert.Error(t, err)
}

func TestPost(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("POST", "http://m/v2/job",
		httpmock.NewStringResponder(200, PZ_JOB_CREATED_RESPONSE))

	client := NewClient("http://m")
	id, err := client.Post(Message{Type: "test-type", Data: "test-data"})

	assert.Equal(t, "test-id", id)
	assert.Nil(t, err)
}

func TestPost_ProperlySerializesMessage(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("POST", "http://m/v2/job",
		func(req *http.Request) (*http.Response, error) {
			body, _ := ioutil.ReadAll(req.Body)
			assert.Equal(t, "application/json", req.Header.Get("content-type"))
			assert.Equal(t, `{"type":"test-type","data":"test-data"}`, string(body))
			return httpmock.NewStringResponse(200, PZ_JOB_CREATED_RESPONSE), nil
		})

	client := NewClient("http://m")
	client.Post(Message{Type: "test-type", Data: "test-data"})
}

func TestPost_HandlesHttpErrorsGracefully(t *testing.T) {
	httpmock.Activate()
	defer httpmock.DeactivateAndReset()

	httpmock.RegisterResponder("POST", "http://m/v2/job",
		httpmock.NewStringResponder(500, PZ_CREATE_JOB_ERROR_RESPONSE))

	client := NewClient("http://m")
	id, err := client.Post(Message{Type: "test-type", Data: "test-data"})

	assert.Empty(t, id)
	assert.Error(t, err)
}

//
// Fixtures
//

const (
	PZ_FILE_RESPONSE = `{"foo":"bar"}`

	PZ_FILE_ERROR_RESPONSE = `{
		"timestamp": 1461978715800,
		"status": 500,
		"error": "Internal Server Error",
		"exception": "java.lang.Exception",
		"message": "Error downloading file for Data test-id by user UNAUTHENTICATED: 500 Internal Server Error",
		"path": "/file/test-id"
	}`

	PZ_JOB_CREATED_RESPONSE = `{
		"type": "job",
		"jobId": "test-id"
	}`

	PZ_JOB_RUNNING_RESPONSE = `
		{
		  "type": "status",
		  "jobId": "test-id",
		  "status": "Running",
		  "jobType": "execute-service",
		  "submittedBy": "UNAUTHENTICATED",
		  "progress": {}
		}`

	PZ_JOB_SUCCESS_RESPONSE = `{
		"type": "status",
		"jobId": "test-id",
		"result": {
			"type": "data",
			"dataId": "test-data-id"
		},
		"status": "Success",
		"jobType": "execute-service",
		"submittedBy": "UNAUTHENTICATED",
		"progress": {}
	}`

	PZ_JOB_ERROR_RESPONSE = `{
		"type": "status",
		"jobId": "test-id",
		"result": {
			"type": "error",
			"message": "Service not found."
		},
		"status": "Error",
		"jobType": "execute-service",
		"submittedBy": "UNAUTHENTICATED",
		"progress": {}
	}`

	PZ_JOB_NOT_FOUND_RESPONSE = `{
		"type": "error",
		"jobId": "test-id",
		"message": "Job Not Found.",
		"origin": "Job Manager"
	}`

	PZ_CREATE_JOB_ERROR_RESPONSE = `{
		"timestamp": 1461985206250,
		"status": 500,
		"error": "Internal Server Error",
		"exception": "java.lang.NullPointerException",
		"message": "No message available",
		"path": "/v2/job"
	}`

	PZ_SERVICE_RESPONSE = `{
		"type": "service-list",
		"data": [
			{
				"serviceId": "test-id-1",
				"url": "test-url",
				"resourceMetadata": {
					"name": "test-name",
					"description": "test-description",
					"method": "POST",
					"availability": "test-availability"
				}
			},
			{
				"serviceId": "test-id-2",
				"url": "test-url",
				"resourceMetadata": {
					"name": "test-name",
					"description": "test-description",
					"method": "POST",
					"availability": "test-availability"
				}
			}
		],
		"pagination": {
			"count": 2,
			"page": 0,
			"per_page": 100
		}
	}`
)
