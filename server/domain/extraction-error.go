package beachfront

import "fmt"

type ExtractionError struct {
    Description string
}

func (e ExtractionError) Error() string {
    return fmt.Sprintf("ExtractionError: %s", e.Description)
}
