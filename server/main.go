package main

import (
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	"github.com/labstack/echo/middleware"
	"github.com/venicegeo/bf-ui/server/domain"
	"github.com/venicegeo/bf-ui/server/services"
	"github.com/venicegeo/bf-ui/server/common/configuration"
	"github.com/venicegeo/bf-ui/server/common/logger"
	"net/http"
	"strings"
)

func main() {
	logger := logger.New()
	config := configuration.New()

	services.Initialize(config)

	server := echo.New()
	mountApiEndpoints(server, config)
	mountStaticAssets(server, config)
	configureServerLogging(server, config)

	logger.Info("Listening on <%s>...", config.Binding)
	server.Run(standard.New(config.Binding))
}

//
// Endpoint Handlers
//

func handleGetAlgorithms(context echo.Context) error {
	return context.JSON(http.StatusOK, map[string][]beachfront.Algorithm{"algorithms": services.GetAlgorithms()})
}

func handleGetImages(context echo.Context) error {
	images, err := services.GetImageList()
	if err == nil {
		return context.JSON(http.StatusOK, map[string][]beachfront.ImageComposite{"images": images})
	}
	return echo.NewHTTPError(http.StatusServiceUnavailable, err.Error())
}

func handleGetJobs(context echo.Context) error {
	return context.JSON(http.StatusOK, map[string][]beachfront.Job{"jobs": services.GetJobs()})
}

func handleGetResult(context echo.Context) error {
	response := context.Response()
	contents, err := services.GetGeoJSON(context.Param("id"))
	if err == nil {
		response.Header().Set("content-type", "application/vnd.geo+json")
		response.WriteHeader(http.StatusOK)
		response.Write(contents)
		return nil
	}
	return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
}

func handlePostJob(context echo.Context) error {
	job := beachfront.Job{}
	context.Bind(&job)

	// HACK
	images, _ := services.GetImageList()
	for _, image := range images {
		if image.CompositeID == job.Image.CompositeID {
			job.Image = image
		}
	}
	// HACK

	if err := job.Validate(); err == nil {
		if id, err := services.SubmitJob(job); err == nil {
			return context.String(http.StatusCreated, id)
		} else {
			return echo.NewHTTPError(http.StatusBadRequest, err.Error())
		}
	} else {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
}

//
// Internals
//

func configureServerLogging(server *echo.Echo, config configuration.Configuration) {
	server.Use(middleware.Logger())
}

func generateErrorHandler(config configuration.Configuration, server *echo.Echo) echo.HTTPErrorHandler {
	return func(originalError error, context echo.Context) {
		path := context.Request().URL().Path()
		isNotApi := strings.HasPrefix(path, config.Namespace) == false
		if he, ok := originalError.(*echo.HTTPError); ok && isNotApi && he.Code == http.StatusNotFound {
			//
			// This allows the server to push the HTTP 404 handling to the client,
			// allowing the UI to set and handle arbitrary URL paths
			//
			context.File(config.StaticAssetPath + "/index.html")
		} else {
			server.DefaultHTTPErrorHandler(originalError, context)
		}
	}
}

func mountApiEndpoints(server *echo.Echo, config configuration.Configuration) {
	logger := logger.New()
	namespace := server.Group(config.Namespace)
	namespace.GET("/algorithms", handleGetAlgorithms)
	namespace.GET("/jobs", handleGetJobs)
	namespace.GET("/results/:id", handleGetResult)
	namespace.POST("/jobs", handlePostJob)
	namespace.GET("/images", handleGetImages)
	for _, route := range server.Routes() {
		if !strings.HasSuffix(route.Path, "*") {
			logger.Debug("<%s %s>", route.Method, route.Path)
		}
	}
}

func mountStaticAssets(server *echo.Echo, config configuration.Configuration) {
	logger := logger.New()
	filepath := config.StaticAssetPath
	logger.Info("</> points to <%s>", filepath)
	server.Use(middleware.Static(filepath))
	logger.Info("Delegating 404 authority to /index.html")
	server.SetHTTPErrorHandler(generateErrorHandler(config, server))
}
