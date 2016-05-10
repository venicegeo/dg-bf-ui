package algorithms

import (
	"github.com/stretchr/testify/assert"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"testing"
	"time"
)

func TestInitialize_BootstrapsCache(t *testing.T) {
	defer teardown()

	Initialize(spy{}, true)
	assert.NotNil(t, cache)
	assert.Len(t, cache, 0)
}

func TestInitialize_CanEnableWorker(t *testing.T) {
	defer teardown()

	timesCalled := 0
	client := spy{
		get: func(params piazza.SearchParameters) ([]piazza.Service, error) {
			timesCalled += 1
			return nil, nil
		}}

	Initialize(client, false)
	time.Sleep(5 * time.Millisecond)
	assert.Equal(t, 1, timesCalled)
}

func TestInitialize_CanDisableWorker(t *testing.T) {
	defer teardown()

	timesCalled := 0
	client := spy{
		get: func(params piazza.SearchParameters) ([]piazza.Service, error) {
			timesCalled += 0
			return nil, nil
		}}

	Initialize(client, true)
	assert.Equal(t, 0, timesCalled)
}

func TestList(t *testing.T) {
	setup()
	defer teardown()

	algorithms := List()
	assert.Len(t, algorithms, 0)
}

func TestList_ReturnsCachedAlgorithms(t *testing.T) {
	setup()
	defer teardown()

	cache["test"] = &beachfront.Algorithm{}
	algorithms := List()
	assert.Len(t, algorithms, 1)
}

func TestWorker_GracefullyHandlesErrors(t *testing.T) { t.Skip() }
func TestCacheWorker_PopulatesCache(t *testing.T) {
	setup()
	defer teardown()

	client := spy{}
	cacheWorker(client, false)

	assert.Len(t, cache, 1)
	assert.Contains(t, cache, "test-algo-1")
}

func TestCacheWorker_ExtractsRequirementsFromMetadata(t *testing.T) {
	setup()
	defer teardown()

	client := spy{}
	cacheWorker(client, false)

	algorithm := cache["test-algo-1"]
	assert.Len(t, algorithm.Requirements, 3)
	assert.Contains(t, algorithm.Requirements, beachfront.AlgorithmRequirement{"Bands", "3 and 6"})
	assert.Contains(t, algorithm.Requirements, beachfront.AlgorithmRequirement{"Cloud Cover", "Less than 10%"})
	assert.Contains(t, algorithm.Requirements, beachfront.AlgorithmRequirement{"Coastline", "Yes"})
}

func TestWorker_RecoversFromErrors(t *testing.T) { t.Skip() }

func TestWorker_RespectsCacheTTL(t *testing.T) { t.Skip() }

//
// Helpers
//

type spy struct {
	piazza.ServiceRetriever
	get func(params piazza.SearchParameters) ([]piazza.Service, error)
}

func (s spy) GetServices(params piazza.SearchParameters) ([]piazza.Service, error) {
	if s.get != nil {
		return s.get(params)
	}
	return []piazza.Service{
		generateService("test-algo-1", ""),
		generateService("test-algo-2", OutOfService),
	}, nil
}

func generateService(id, availability string) piazza.Service {
	return piazza.Service{
		ID: "test-algo-1",
		ResourceMetadata: struct {
			Name         string
			Description  string
			Availability string
			Extended     map[string]string `json:"metadata"`
		}{
			"test-algo-1",
			"test-description",
			availability,
			map[string]string{
				"imageReq - Bands":      "3,6",
				"imageReq - CloudCover": "10%",
				"imageReq - Coastline":  "Yes",
			},
		}}
}

func setup() {
	initializeCache()
}

func teardown() {
	Reset()
}
