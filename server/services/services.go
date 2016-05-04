package services

import (
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/algorithms"
	"github.com/venicegeo/bf-ui/server/services/imagery"
	"github.com/venicegeo/bf-ui/server/services/jobs"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/services/results"
	"github.com/venicegeo/bf-ui/server/common/configuration"
)

var client piazza.Client

func Initialize(config configuration.Configuration) {
	client = piazza.NewClient(config.PiazzaGateway)

	jobs.Initialize()
	algorithms.Initialize(client, config.DisableWorkers)
}

func SubmitJob(job beachfront.Job) (id string, err error) {
	return jobs.Execute(client, job)
}

func GetAlgorithms() []beachfront.Algorithm {
	return algorithms.List()
}

func GetJobs() []beachfront.Job {
	return jobs.List()
}

func GetImageList() ([]beachfront.Image, error) {
	return imagery.List()
}

func GetGeoJSON(resultId string) ([]byte, error) {
	return results.Get(client, resultId)
}
