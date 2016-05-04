package configuration

import (
	"flag"
	"os"
	"path"
)

const (
	defaultBinding        = ":5000"
	defaultDisableWorkers = false
	defaultNamespace      = "/api/v1"
	defaultPiazzaGateway  = "http://localhost:3000"
	defaultStatic         = "./public"
)

var (
	binding        = flag.String("bind", defaultBinding, "Set the bound server address")
	disableWorkers = flag.Bool("disable-workers", defaultDisableWorkers, "Disables cache workers")
	namespace      = flag.String("namespace", defaultNamespace, "Set the root path for the API endpoints")
	piazzaGateway  = flag.String("piazza-gateway", defaultPiazzaGateway, "Set the URL to Piazza gateway")
	static         = flag.String("static", resolve(defaultStatic), "Set the path from which static assets will be served")
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
		Binding:         *binding,
		DisableWorkers:  *disableWorkers,
		Namespace:       *namespace,
		PiazzaGateway:   *piazzaGateway,
		StaticAssetPath: *static,
	}
}

func resolve(relativePath string) string {
	return path.Clean(path.Join(path.Dir(os.Args[0]), relativePath))
}
