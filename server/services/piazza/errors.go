package piazza

import (
	"fmt"
	"net/http"
)

type (
	ErrHttp struct {
		Response *http.Response
	}

	ErrInvalidResponse struct {
		Contents []byte
		Message  string
	}
)

func (e ErrHttp) Error() string {
	return fmt.Sprintf("ErrHttp: (code=%d)", e.Response.StatusCode)
}

func (e ErrInvalidResponse) Error() string {
	return fmt.Sprintf("ErrInvalidResponse: %s (%s)", e.Message, e.Contents)
}
