package piazza

import (
	"fmt"
	"net/http"
)

type (
	HttpError struct {
		Response *http.Response
	}

	JobError struct {
		Message string
	}
)

func (e HttpError) Error() string {
	return fmt.Sprintf("HttpError: (code=%d)", e.Response.StatusCode)
}

func (e JobError) Error() string {
	return fmt.Sprintf("JobError: %s", e.Message)
}
