package piazza

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

var gateway string

func Initialize(_gateway string) {
	gateway = strings.TrimRight(_gateway, "/")
}

func Reset() {
	gateway = ""
}

func GetFile(id string) ([]byte, error) {
	url := fmt.Sprintf("%s/file/%s", gateway, id)
	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return nil, HttpError{response}
	}

	return ioutil.ReadAll(response.Body)
}

func GetServices(criteria SearchParameters) ([]Service, error) {
	params := url.Values{}
	params.Set("keyword", criteria.Pattern)
	params.Set("per_page", "100")

	url := fmt.Sprintf("%s/service?%s", gateway, params.Encode())
	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return nil, HttpError{response}
	}

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var envelope struct{ Data []Service }
	err = json.Unmarshal(contents, &envelope)
	if err != nil {
		return nil, err
	}

	return envelope.Data, nil
}

func GetStatus(id string) (*Status, error) {
	url := fmt.Sprintf("%s/job/%s", gateway, id)

	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return nil, HttpError{response}
	}

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	status := &Status{}
	err = json.Unmarshal(contents, status)
	if err != nil {
		return nil, err
	}

	if status.Status == StatusError || status.Status == "" || status.Type == "error" {
		err = JobError{status.Message}
	}

	return status, nil
}

func Post(message Message) (jobId string, err error) {
	url := fmt.Sprintf("%s/v2/job", gateway)

	payload, _ := json.Marshal(message)
	response, err := http.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return
	}

	if response.StatusCode != http.StatusOK {
		return "", HttpError{response}
	}

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return
	}

	var metadata struct {
		JobID string
	}
	err = json.Unmarshal(contents, &metadata)
	if err != nil {
		return
	}

	jobId = metadata.JobID
	if jobId == "" {
		return "", JobError{fmt.Sprintf("No job ID was assigned %s", contents)}
	}

	return
}
