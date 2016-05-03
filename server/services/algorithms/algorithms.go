package algorithms

import (
	"fmt"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/utils"
	"time"
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

func Initialize(client client, enableWorker bool) {
	initializeCache()

	logger := utils.ContextLogger{"Initialize"}
	if enableWorker {
		logger.Info("Starting background tasks")
		go cacheWorker(client)
	} else {
		logger.Info("Background tasks disabled by config")
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
		logger := utils.ContextLogger{"cacheWorker"}
		logger.Info("Updating cache")
		if algorithms, err := fetch(client); err == nil {
			current := make(map[string]*beachfront.Algorithm, 0)
			for _, algorithm := range algorithms {
				current[algorithm.ID] = &algorithm
			}
			cache = current
		}
		logger.Info("Next update in %d minute(s)", cacheTTL/time.Minute)
		time.Sleep(cacheTTL)
	}
}

func convert(services []piazza.Service) []beachfront.Algorithm {
	logger := utils.ContextLogger{"convert"}

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
	logger := utils.ContextLogger{"fetch"}

	services, err := client.GetServices(piazza.SearchParameters{Pattern: "^BF_Algo_"})
	if err != nil {
		err := ErrServiceTranslation{"Fetch failed: " + err.Error()}
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
	ErrServiceTranslation struct {
		Message string
	}
)

func (e ErrServiceTranslation) Error() string {
	return fmt.Sprintf("ErrServiceTranslation: %s", e.Message)
}
