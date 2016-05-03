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

type (
	Client struct {
		FileRetriever
		ServiceRetriever
		JobRetriever
		JobSubmitter
		gateway string
	}

	FileRetriever interface {
		GetFile(id string) ([]byte, error)
	}

	ServiceRetriever interface {
		GetServices(criteria SearchParameters) ([]Service, error)
	}

	JobRetriever interface {
		GetStatus(id string) (*Status, error)
	}

	JobSubmitter interface {
		Post(message Message) (jobId string, err error)
	}
)

func NewClient(gateway string) Client {
	return Client{
		gateway: strings.TrimRight(gateway, "/")}
}

func (c Client) Gateway() string {
	return c.gateway
}

func (c Client) GetFile(id string) ([]byte, error) {
	url := fmt.Sprintf("%s/file/%s", c.gateway, id)
	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return nil, HttpError{response}
	}

	return ioutil.ReadAll(response.Body)
}

func (c Client) GetServices(criteria SearchParameters) ([]Service, error) {
	params := url.Values{}
	params.Set("keyword", criteria.Pattern)
	params.Set("per_page", "100")

	url := fmt.Sprintf("%s/service?%s", c.gateway, params.Encode())
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

func (c Client) GetStatus(id string) (*Status, error) {
	url := fmt.Sprintf("%s/job/%s", c.gateway, id)

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

	if status.Status == "" || status.Type == "error" {
		return nil, InvalidResponseError{contents, "Status is ambiguous"}
	}

	return status, nil
}

func (c Client) Post(message Message) (jobId string, err error) {
	url := fmt.Sprintf("%s/v2/job", c.gateway)

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
		return "", InvalidResponseError{contents, "No job ID assigned"}
	}

	return
}
