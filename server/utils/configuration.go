package utils

import (
	"os"
	"path"
	"strconv"
	"strings"
)

const (
	apiNamespace        = "API_NAMESPACE"
	defaultApiNamespace = "/api/v1"

	enableBackgroundTasks        = "ENABLE_BACKGROUND_TASKS"
	defaultEnableBackgroundTasks = true

	piazzaGateway        = "PIAZZA_GATEWAY"
	defaultPiazzaGateway = "http://localhost:3000"

	serverAddress        = "SERVER_ADDRESS"
	defaultServerAddress = ":5000"

	staticAssetPath        = "STATIC_ASSET_PATH"
	defaultStaticAssetPath = "./public"
)

type Configuration struct {
	EnableBackgroundTasks bool
	Namespace             string
	PiazzaGateway         string
	ServerAddress         string
	StaticAssetPath       string
}

func Load() Configuration {
	return Configuration{
		EnableBackgroundTasks: getBoolean(enableBackgroundTasks, defaultEnableBackgroundTasks),
		Namespace:             getString(apiNamespace, defaultApiNamespace),
		PiazzaGateway:         getString(piazzaGateway, defaultPiazzaGateway),
		ServerAddress:         getString(serverAddress, defaultServerAddress),
		StaticAssetPath:       getString(staticAssetPath, resolve(defaultStaticAssetPath)),
	}
}

//
// Internals
//

func getString(key, fallback string) (value string) {
	value = strings.TrimSpace(os.Getenv(key))
	if value == "" {
		value = strings.TrimSpace(fallback)
	}
	return
}

func getBoolean(key string, fallback bool) bool {
	if value, err := strconv.ParseBool(os.Getenv(key)); err == nil {
		return value
	}
	return fallback
}

func resolve(relativePath string) string {
	return path.Join(path.Dir(os.Args[0]), relativePath)
}
