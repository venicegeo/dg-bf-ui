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

func (j Job) ImageIDs() string {
    ids := make([]string, 0)
    for _, image := range j.Images {
        ids = append(ids, image.ID)
    }
    return strings.Join(ids, ",")
}

func (j Job) ImageFilenames() string {
    filenames := make([]string, 0)
    for _, image := range j.Images {
        filenames = append(filenames, image.Filename)
    }
    return strings.Join(filenames, ",")
}

func (j Job) AddImage(id, filename string) {
    j.Images = append(j.Images, Image{ID: id, Filename: filename})
}

func (j Job) Validate() error {
    if j.Name == "" { return ExtractionError{"`JobName` must not be blank"} }
    if j.AlgorithmID == "" { return ExtractionError{"`AlgorithmID` must not be blank"} }
    if j.AlgorithmName == "" { return ExtractionError{"`AlgorithmName` must not be blank"} }
    if len(j.Images) == 0 { return ExtractionError{"`Images` must not be empty"} }
    return nil
}
