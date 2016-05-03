package beachfront

import "fmt"

type ValidationError struct {
	Description string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("ExtractionError: %s", e.Description)
}
