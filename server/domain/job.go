package beachfront

import (
    "time"
    "strings"
)

type Job struct {
    ID             string `json:"id"`                 // Piazza Job ID
    CreatedOn      time.Time `json:"createdOn"`
    AlgorithmID    string `json:"algorithmId"`
    AlgorithmName  string `json:"algorithmName"`
    Name           string `json:"name"`
    Images         []Image  `json:"images"`
    ResultFilename string `json:"resultFilename,omitempty"`
    ResultID       string `json:"resultId,omitempty"` // Piazza Data ID
    Status         string `json:"status"`
}

func (self Job) ImageIDs() string {
    ids := make([]string, 0)
    for _, image := range self.Images {
        ids = append(ids, image.ID)
    }
    return strings.Join(ids, ",")
}

func (self Job) ImageFilenames() string {
    filenames := make([]string, 0)
    for _, image := range self.Images {
        filenames = append(filenames, image.Filename)
    }
    return strings.Join(filenames, ",")
}

func (self Job) AddImage(id, filename string) {
    self.Images = append(self.Images, Image{ID: id, Filename: filename})
}

func (self Job) ValidateForSubmission() error {
    if self.Name == "" { return ExtractionError{"`JobName` must not be blank"} }
    if self.AlgorithmID == "" { return ExtractionError{"`AlgorithmID` must not be blank"} }
    if self.AlgorithmName == "" { return ExtractionError{"`AlgorithmName` must not be blank"} }
    if len(self.Images) == 0 { return ExtractionError{"`Images` must not be empty"} }
    return nil
}
