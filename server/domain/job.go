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
	Image          Image     `json:"image"`
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
	if j.Image.CompositeID == "" {
		return ErrValidation{"`Image.CompositeID` must not be empty"}
	}
	if j.Image.CompositeFilename == "" {
		return ErrValidation{"`Image.CompositeFilename` must not be empty"}
	}
	return nil
}
