package results

import (
	"encoding/json"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/utils"
	"regexp"
)

type (
	client interface {
		piazza.FileRetriever
	}

	executionMetadata struct {
		OutFiles map[string]string
	}
)

func Get(client client, resultId string) ([]byte, error) {
	logger := utils.ContextLogger{"GetResult"}

	logger.Debug("[result:%s] Fetching metadata", resultId)
	metadata, err := fetchMetadata(client, resultId)
	if err != nil {
		err := RetrievalError{"Could not fetch metadata: " + err.Error()}
		logger.Error("[result:%s] %s", resultId, err)
		return nil, err
	}

	// Follow the trail to the GeoJSON
	geojsonId := extractFileId(metadata)
	if geojsonId == "" {
		err := RetrievalError{"Could not find GeoJSON file in metadata"}
		logger.Error("[result:%s] %s", resultId, err)
		return nil, err
	}

	logger.Info("[result:%s] Fetching GeoJSON", resultId)
	contents, err := client.GetFile(geojsonId)
	if err != nil {
		err := RetrievalError{"Could not fetch GeoJSON from server: " + err.Error()}
		logger.Error("[result:%s] %s", resultId, err)
		return nil, err
	}

	return contents, nil
}

//
// Internals
//

func extractFileId(metadata executionMetadata) string {
	pattern := regexp.MustCompile("^Beachfront_(.*)\\.geojson$")
	for filename, dataId := range metadata.OutFiles {
		if pattern.MatchString(filename) {
			return dataId
		}
	}
	return ""
}

func fetchMetadata(client client, id string) (metadata executionMetadata, err error) {
	raw, err := client.GetFile(id)
	if err != nil {
		return
	}

	// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
	var __hackaroundFor2610__ []string
	json.Unmarshal(raw, &__hackaroundFor2610__)
	raw = []byte(__hackaroundFor2610__[0]) // FIXME - hack-around for #2610
	// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

	err = json.Unmarshal(raw, &metadata)
	return
}

//
// Errors
//

type RetrievalError struct {
	Message string
}

func (e RetrievalError) Error() string {
	return e.Message
}
