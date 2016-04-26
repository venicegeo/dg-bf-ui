package main

import (
    "github.com/labstack/echo"
    "github.com/labstack/echo/engine/standard"
    "net/http"
    "github.com/venicegeo/bf-ui/server/services"
    "github.com/labstack/echo/middleware"
    "os"
    "log"
    "github.com/venicegeo/bf-ui/server/domain"
    "github.com/venicegeo/bf-ui/server/utils"
    "strings"
)

func main() {
    config := utils.LoadServerConfiguration()
    configureLogging(config)
    services.InitializeBackgroundTasks(config)
    mountEndpoints(config)
}

//
// Endpoint Handlers
//

func handleGetAlgorithms(context echo.Context) error {
    algorithms, err := services.GetAlgorithms()
    if err == nil {
        return context.JSON(http.StatusOK, map[string][]beachfront.Algorithm{"algorithms": algorithms})
    }
    return echo.NewHTTPError(http.StatusServiceUnavailable, err.Error())
}

func handleGetImages(context echo.Context) error {
    images, err := services.GetImageList()
    if err == nil {
        return context.JSON(http.StatusOK, map[string][]beachfront.Image{"images": images})
    }
    return echo.NewHTTPError(http.StatusServiceUnavailable, err.Error())
}

func handleGetJobs(context echo.Context) error {
    jobs, err := services.GetJobs()
    if err == nil {
        return context.JSON(http.StatusOK, map[string][]beachfront.Job{"jobs": jobs})
    }
    return echo.NewHTTPError(http.StatusServiceUnavailable, err.Error())
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
    if err := job.ValidateForSubmission(); err == nil {
        if err := services.SubmitJob(job); err == nil {
            return context.NoContent(http.StatusCreated)
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

func configureLogging(config utils.ApplicationConfiguration) {
    log.SetFlags(log.LstdFlags | log.Lshortfile | log.Lmicroseconds | log.LUTC)
    log.SetOutput(os.Stdout)
}

func generateErrorHandler(config utils.ApplicationConfiguration, server *echo.Echo) echo.HTTPErrorHandler {
    return func (originalError error, context echo.Context) {
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

func mountEndpoints(config utils.ApplicationConfiguration) {
    logger := utils.ContextLogger{"mountEndpoints"}
    server := echo.New()
    v1 := server.Group(config.Namespace)
    v1.GET("/algorithms", handleGetAlgorithms)
    v1.GET("/jobs", handleGetJobs)
    v1.GET("/results/:id", handleGetResult)
    v1.POST("/jobs", handlePostJob)
    v1.GET("/images", handleGetImages)
    server.Use(middleware.Logger())
    server.Use(middleware.Static(config.StaticAssetPath))
    server.SetHTTPErrorHandler(generateErrorHandler(config, server))
    logger.Info("HTTP listener starting on %s...", config.ServerAddress)
    server.Run(standard.New(config.ServerAddress))
}
