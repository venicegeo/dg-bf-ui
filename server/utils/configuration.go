package utils

import (
	"os"
	"path"
	"strconv"
	"strings"
)

const (
	API_NAMESPACE                = "API_NAMESPACE"
	defaultApiNamespace          = "/api/v1"

	ENABLE_BACKGROUND_TASKS      = "ENABLE_BACKGROUND_TASKS"
	defaultEnableBackgroundTasks = true

	PIAZZA_GATEWAY               = "PIAZZA_GATEWAY"
	defaultPiazzaGateway         = "http://localhost:3000"

	SERVER_ADDRESS               = "SERVER_ADDRESS"
	defaultServerAddress         = ":5000"

	STATIC_ASSET_PATH            = "STATIC_ASSET_PATH"
	defaultStaticAssetPath       = "./public"
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
		EnableBackgroundTasks: getBoolean(ENABLE_BACKGROUND_TASKS, defaultEnableBackgroundTasks),
		Namespace:             getString(API_NAMESPACE, defaultApiNamespace),
		PiazzaGateway:         getString(PIAZZA_GATEWAY, defaultPiazzaGateway),
		ServerAddress:         getString(SERVER_ADDRESS, defaultServerAddress),
		StaticAssetPath:       getString(STATIC_ASSET_PATH, resolve(defaultStaticAssetPath)),
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
