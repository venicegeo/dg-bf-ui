package piazza

import (
	"fmt"
	"net/http"
)

type (
	HttpError struct {
		Response *http.Response
	}

	InvalidResponseError struct {
		Contents []byte
		Message string
	}
)

func (e HttpError) Error() string {
	return fmt.Sprintf("HttpError: (code=%d)", e.Response.StatusCode)
}

func (e InvalidResponseError) Error() string {
	return fmt.Sprintf("InvalidResponseError: %s (%s)", e.Message, e.Contents)
}
