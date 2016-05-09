package beachfront

import (
	"time"
)

type Job struct {
	ID             string    `json:"id"` // Piazza Job ID
	CreatedOn      time.Time `json:"createdOn"`
	AlgorithmID    string    `json:"algorithmId"`
	AlgorithmName  string    `json:"algorithmName"`
	Name           string    `json:"name"`
	ImageIDs       []string  `json:"imageIds"`
	ResultFilename string    `json:"resultFilename,omitempty"`
	ResultID       string    `json:"resultId,omitempty"` // Piazza Data ID
	Status         string    `json:"status"`
}

func (j Job) Validate() error {
	if j.Name == "" {
		return ErrValidation{"`JobName` must not be blank"}
	}
	if j.AlgorithmID == "" {
		return ErrValidation{"`AlgorithmID` must not be blank"}
	}
	if j.AlgorithmName == "" {
		return ErrValidation{"`AlgorithmName` must not be blank"}
	}
	if len(j.ImageIDs) < 2 {
		return ErrValidation{"`ImageIDs` must have at least two elements"}
	}
	return nil
}
