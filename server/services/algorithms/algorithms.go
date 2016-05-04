package algorithms

import (
	"fmt"
	"time"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/common/logger"
)

const (
	defaultCacheTTL = 1 * time.Minute
	OutOfService    = "OUT OF SERVICE"
)

type (
	client interface {
		piazza.ServiceRetriever
	}
)

var (
	cache    map[string]*beachfront.Algorithm
	cacheTTL time.Duration
)

func Initialize(client client, disableWorkers bool) {
	initializeCache()

	logger := logger.New()
	if disableWorkers {
		logger.Info("Background tasks disabled by config")
	} else {
		logger.Info("Starting background tasks")
		go cacheWorker(client)
	}
}

func List() []beachfront.Algorithm {
	algorithms := make([]beachfront.Algorithm, 0)
	for _, algorithm := range cache {
		algorithms = append(algorithms, *algorithm)
	}
	return algorithms
}

func Reset() {
	cache = nil
	cacheTTL = defaultCacheTTL
}

//
// Internals
//

func cacheWorker(client client) {
	for {
		logger := logger.New()
		logger.Info("Refreshing algorithm cache")
		if algorithms, err := fetch(client); err == nil {
			current := make(map[string]*beachfront.Algorithm, 0)
			for _, algorithm := range algorithms {
				current[algorithm.ID] = &algorithm
			}
			cache = current
		}
		logger.Info("Next refresh in %d minute(s)", cacheTTL/time.Minute)
		time.Sleep(cacheTTL)
	}
}

func convert(services []piazza.Service) []beachfront.Algorithm {
	logger := logger.New()

	logger.Debug("Received %d services: %s", len(services), services)
	algorithms := make([]beachfront.Algorithm, 0)
	for _, service := range services {
		if service.ID != "" && service.ResourceMetadata.Availability != OutOfService {
			algorithm := beachfront.Algorithm{
				ID:          service.ID,
				Name:        service.ResourceMetadata.Name,
				Description: service.ResourceMetadata.Description}

			// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
			// HACK -- overriding because it doesn't look like the current algos actually _list_ inputs
			algorithm.Inputs = []beachfront.AlgorithmInput{{"--image", "Images", beachfront.AlgorithmTypeImage}}
			// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
			// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

			algorithms = append(algorithms, algorithm)
		}
	}
	return algorithms
}

func fetch(client client) ([]beachfront.Algorithm, error) {
	logger := logger.New()

	services, err := client.GetServices(piazza.SearchParameters{Pattern: "^BF_Algo_"})
	if err != nil {
		err := ErrRetrieval{err.Error()}
		logger.Error("%s", err)
		return nil, err
	}

	return convert(services), nil
}

func initializeCache() {
	cacheTTL = defaultCacheTTL
	cache = make(map[string]*beachfront.Algorithm)
}

//
// Errors
//

type (
	ErrRetrieval struct {
		Message string
	}
)

func (e ErrRetrieval) Error() string {
	return fmt.Sprintf("ErrRetrieval: %s", e.Message)
}
