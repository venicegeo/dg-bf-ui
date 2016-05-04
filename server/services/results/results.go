package results

import (
	"encoding/json"
	"fmt"
	"regexp"
	"github.com/venicegeo/bf-ui/server/services/piazza"
	"github.com/venicegeo/bf-ui/server/common/logger"
)

type (
	client interface {
		piazza.FileRetriever
	}

	metadata struct {
		OutFiles map[string]string
	}
)

func Get(client client, resultId string) ([]byte, error) {
	logger := logger.New()

	logger.Debug("<%s> Fetching metadata", resultId)
	metadata, err := fetchMetadata(client, resultId)
	if err != nil {
		logger.Error("<%s> %s", resultId, err)
		return nil, err
	}

	// Follow the trail to the GeoJSON
	geojsonId := extractFileId(*metadata)
	if geojsonId == "" {
		err := ErrRetrieval{"Could not find GeoJSON file in metadata"}
		logger.Error("<%s> %s", resultId, err)
		return nil, err
	}

	logger.Info("<%s> Fetching GeoJSON", resultId)
	contents, err := client.GetFile(geojsonId)
	if err != nil {
		err := ErrRetrieval{"Could not fetch GeoJSON from server: " + err.Error()}
		logger.Error("<%s> %s", resultId, err)
		return nil, err
	}

	return contents, nil
}

//
// Internals
//

func extractFileId(metadata metadata) string {
	pattern := regexp.MustCompile("^Beachfront_(.*)\\.geojson$")
	for filename, dataId := range metadata.OutFiles {
		if pattern.MatchString(filename) {
			return dataId
		}
	}
	return ""
}

func fetchMetadata(client client, id string) (*metadata, error) {
	raw, err := client.GetFile(id)
	if err != nil {
		return nil, ErrRetrieval{"Could not fetch metadata: " + err.Error()}
	}

	// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK
	var __hackaroundFor2610__ []string
	err = json.Unmarshal(raw, &__hackaroundFor2610__)
	if err != nil || len(__hackaroundFor2610__) == 0 {
		return nil, ErrMetadataParsing{err, raw}
	}
	raw = []byte(__hackaroundFor2610__[0]) // FIXME - refer to #2610
	// HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK HACK

	var metadata *metadata
	err = json.Unmarshal(raw, &metadata)
	if err != nil {
		return nil, ErrMetadataParsing{err, raw}
	}

	return metadata, nil
}

//
// Errors
//

type (
	ErrMetadataParsing struct {
		OriginalError error
		Raw           []byte
	}
	ErrRetrieval struct {
		Message string
	}
)

func (e ErrMetadataParsing) Error() string {
	return fmt.Sprintf("ErrMetadataParsing: (%s) %s", e.OriginalError, e.Raw)
}

func (e ErrRetrieval) Error() string {
	return fmt.Sprintf("ErrRetrieval: %s", e.Message)
}
