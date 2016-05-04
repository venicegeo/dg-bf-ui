package configuration

import (
	"flag"
	"os"
	"path"
)

// Environment variables provided by Cloud Foundry
const (
	environmentKeyDomain = "DOMAIN"
	environmentKeyPort   = "PORT"
)

const (
	defaultBinding        = ":5000"
	defaultDisableWorkers = false
	defaultNamespace      = "/api/v1"
	defaultPiazzaGateway  = "http://localhost:3000"
	defaultStatic         = "./public"
)

var (
	bind           = flag.String("bind", generateBinding(), "Set the bound address")
	disableWorkers = flag.Bool("disable-workers", defaultDisableWorkers, "Disables cache workers")
	namespace      = flag.String("namespace", defaultNamespace, "Set the root path for the API endpoints")
	piazzaGateway  = flag.String("piazza-gateway", generateGateway(), "Set the URL to Piazza gateway")
	static         = flag.String("static", generateStatic(), "Set the path from which static assets will be served")
)

func init() {
	flag.Parse()
}

type Configuration struct {
	Binding         string
	DisableWorkers  bool
	Namespace       string
	PiazzaGateway   string
	StaticAssetPath string
}

func New() Configuration {
	return Configuration{
		Binding:         *bind,
		DisableWorkers:  *disableWorkers,
		Namespace:       *namespace,
		PiazzaGateway:   *piazzaGateway,
		StaticAssetPath: *static,
	}
}

func generateBinding() string {
	if port := os.Getenv(environmentKeyPort); port != "" {
		return ":" + port
	}
	return defaultBinding
}

func generateGateway() string {
	if domain := os.Getenv(environmentKeyDomain); domain != "" {
		return "https://pz-gateway." + domain
	}
	return defaultPiazzaGateway
}

func generateStatic() string {
	return path.Clean(path.Join(path.Dir(os.Args[0]), defaultStatic))
}
