package piazza

import "fmt"

type FileRetrievalError struct {
    Message string
}

func (e FileRetrievalError) Error() string {
    return fmt.Sprintf("FileRetrievalError: %s", e.Message)
}

type StatusError struct {
    Message string
}

func (e StatusError) Error() string {
    return fmt.Sprintf("StatusError: %s", e.Message)
}

type TooManyAttemptsError struct {
    Count int
}

func (e TooManyAttemptsError) Error() string {
    return fmt.Sprintf("TooManyAttemptsError: (max=%d)", e.Count)
}
