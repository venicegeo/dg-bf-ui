package utils

import (
    "strings"
    "os"
)

const (
    _KeyForServerAddress = "SERVER_ADDRESS"
    _KeyForApiNamespace = "API_NAMESPACE"
    _KeyForStaticAssetPath = "STATIC_ASSET_PATH"
    _KeyForEnableBackgroundTasks = "ENABLE_BACKGROUND_TASKS"
    _DefaultEnableBackgroundTasks = true
    _DefaultServerAddress = ":5000"
    _DefaultApiNamespace = "/api/v1"
    _DefaultStaticAssetPath = "/Users/dbazile/code/prototype-bf-ui-spa/dist"
)

type ApplicationConfiguration struct {
    ServerAddress string
    StaticAssetPath string
    Namespace string
    EnableBackgroundTasks bool
}

func LoadServerConfiguration() ApplicationConfiguration {
    return ApplicationConfiguration{
        ServerAddress: getString(_KeyForServerAddress, _DefaultServerAddress),
        StaticAssetPath: getString(_KeyForStaticAssetPath, _DefaultStaticAssetPath),
        Namespace: getString(_KeyForApiNamespace, _DefaultApiNamespace),
        EnableBackgroundTasks: getBoolean(_KeyForEnableBackgroundTasks, _DefaultEnableBackgroundTasks)}
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
    raw := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
    switch raw {
    case "false", "0": return false
    case "": return fallback
    default: return true
    }
}
