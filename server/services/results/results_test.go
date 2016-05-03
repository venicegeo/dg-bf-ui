package results

import (
	"github.com/stretchr/testify/assert"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"net/http"
	"testing"
)

func TestGetResult(t *testing.T) {
	client := fileSpy{}

	data, err := Get(client, ID_COMMAND_OUTPUT)
	assert.Nil(t, err)
	assert.Equal(t, []byte(GEOJSON), data)
}

func TestGetResult_GracefullyHandlesErrorsBeforeResolution(t *testing.T) {
	timesCalled := 0

	client := fileSpy{
		get: func(id string) ([]byte, error) {
			timesCalled += 1
			return nil, piazza.HttpError{
				&http.Response{StatusCode: http.StatusServiceUnavailable}}
		}}

	data, err := Get(client, "test-throws-http-error")
	assert.Error(t, err)
	assert.Nil(t, data)
	assert.Equal(t, 1, timesCalled)
}

func TestGetResult_GracefullyHandlesErrorsAfterResolution(t *testing.T) {
	timesCalled := 0

	client := fileSpy{
		get: func(id string) ([]byte, error) {
			timesCalled += 1
			if id != ID_GEOJSON {
				return []byte(COMMAND_OUTPUT), nil
			}
			return nil, piazza.HttpError{
				&http.Response{StatusCode: http.StatusServiceUnavailable}}
		}}

	data, err := Get(client, "test-throws-http-error-after-resolution")
	assert.Error(t, err)
	assert.Nil(t, data)
	assert.Equal(t, 2, timesCalled)

}

func TestGetResult_GracefullyHandlesFunkyMetadata(t *testing.T) {
	timesCalled := 0

	client := fileSpy{
		get: func(id string) ([]byte, error) {
			timesCalled += 1
			return []byte(FUNKY_COMMAND_OUTPUT), nil
		}}

	data, err := Get(client, "test-yields-funky-metadata")
	assert.Error(t, err)
	assert.Nil(t, data)
	assert.Equal(t, 1, timesCalled)
}

func TestGetResult_GracefullyHandlesAbsentMetadata(t *testing.T) {
	timesCalled := 0

	client := fileSpy{
		get: func(id string) ([]byte, error) {
			timesCalled += 1
			return []byte(`[]`), nil
		}}

	data, err := Get(client, "test-yields-absent-metadata")
	assert.Error(t, err)
	assert.Nil(t, data)
	assert.Equal(t, 1, timesCalled)
}

//
// Helpers
//

type fileSpy struct {
	piazza.FileRetriever
	get func(string) ([]byte, error)
}

func (f fileSpy) GetFile(id string) ([]byte, error) {
	if f.get != nil {
		return f.get(id)
	}
	switch id {
	case ID_GEOJSON:
		return []byte(GEOJSON), nil
	case ID_COMMAND_OUTPUT:
		return []byte(COMMAND_OUTPUT), nil
	}
	return nil, piazza.HttpError{
		&http.Response{StatusCode: http.StatusNotFound}}
}

//
// Fixtures
//

const (
	ID_GEOJSON        = "test-id-geojson"
	ID_COMMAND_OUTPUT = "test-id-command-output"

	GEOJSON = `{"foo":"bar"}`

	COMMAND_OUTPUT = `["{\"InFiles\":{\"noise\":\"rabble rabble rabble\"},\"OutFiles\":{\"more_noise\":\"rabble rabble rabble\",\"Beachfront_1234.geojson\":\"test-id-geojson\"},\"ProgReturn\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"}"]`

	FUNKY_COMMAND_OUTPUT = `["exit status 1open ./E26E0D95-89FB-0421-F733-E13C5F7BC07D/Beachfront_Postman_Manual_Testing_111.geojson: no such file or directory{\"InFiles\":{\"2841d02d-0630-4717-98bc-ace187517a02\":\"dummy.txt\",\"d91e9a73-fccd-4418-9489-dd155f1cdfec\":\"dummy.txt\"},\"OutFiles\":{},\"ProgReturn\":\"\"}"]`
)
