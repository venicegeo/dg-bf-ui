package beachfront

import "fmt"

type ErrValidation struct {
	Description string
}

func (e ErrValidation) Error() string {
	return fmt.Sprintf("ErrValidation: %s", e.Description)
}
