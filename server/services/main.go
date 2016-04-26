package services

import (
    "github.com/venicegeo/bf-ui/server/domain"
    "github.com/venicegeo/bf-ui/server/services/piazza"
    "github.com/venicegeo/bf-ui/server/utils"
    "fmt"
    "time"
)

func InitializeBackgroundTasks(config utils.ApplicationConfiguration) {
    logger := utils.ContextLogger{"InitializeBackgroundTasks"}
    if config.EnableBackgroundTasks {
        logger.Info("Starting goroutines")
        go piazza.WorkerForAlgorithmCache()
    } else {
        logger.Info("Background tasks are disabled by config")
    }
}

func SubmitJob(job beachfront.Job) error {
    job.CreatedOn = time.Now()
    job.ResultFilename = generateJobResultFilename()
    return piazza.SubmitJob(job)
}

func GetAlgorithms() ([]beachfront.Algorithm, error) {
    return piazza.GetCachedAlgorithms(), nil
}

func GetJobs() ([]beachfront.Job, error) {
    return piazza.GetCachedBeachfrontJobs(), nil
}

func GetImageList() ([]beachfront.Image, error) {
    return []beachfront.Image{
        beachfront.Image{"LC80090472014280LGN00_B3.TIF", "643dd0a6-5128-49a4-9dbc-ac5ba0530e95"},
        beachfront.Image{"LC80090472014280LGN00_B6.TIF", "22b85cb1-7b2c-4a51-874f-22fc4e439b8b"},
        beachfront.Image{"LC80150442014002LGN00_B3.TIF", "f51e7576-1245-455a-a683-707aa79e7e46"},
        beachfront.Image{"LC80150442014002LGN00_B6.TIF", "92741ab8-96ae-4a1f-841c-a05bc6d2f661"},
        beachfront.Image{"LC80340432016061LGN00_B3.TIF", "8cac8caa-cbdc-46fa-8e55-fa507522efc6"},
        beachfront.Image{"LC80340432016061LGN00_B6.TIF", "13299df7-37b5-445e-bc06-70c26c3e72c2"},
        beachfront.Image{"LC81190532015078LGN00_B3.TIF", "37c61870-f464-4c82-824c-29fe5d1d6528"},
        beachfront.Image{"LC81190532015078LGN00_B6.TIF", "fb143d27-570c-4993-90da-1120612b1662"},
        beachfront.Image{"LC81600422014314LGN00_B3.TIF", "742718f0-7f5f-4a7b-a431-ee55a4bedd16"},
        beachfront.Image{"LC81600422014314LGN00_B6.TIF", "f01c4f71-d19b-4ce6-81ec-1f83001f25f9"},
        beachfront.Image{"LC82010352014217LGN00_B3.TIF", "c392a815-3edf-4254-884c-27197e17a273"},
        beachfront.Image{"LC82010352014217LGN00_B6.TIF", "9b8f64ef-76ad-492c-8cc1-3842d6fbd4e9"},
    }, nil
}

func GetGeoJSON(resultId string) ([]byte, error) {
    return piazza.FetchGeoJSON(resultId)
}

//
// Internals
//

func generateJobResultFilename() string {
    return fmt.Sprintf("Beachfront_%s.geojson", time.Now().UTC().Format("20060102.150405.99999"))
}
