package ossim

/*
Piazza Exec-Message Content:

cmd=shoreline
    --image ${params.--image}
    --projection geo-scaled
    --threshold 0.5
    --tolerance 0
    ${geoJsonFilename}&inFiles=${dataIds.join(",")}&outGeoJson=${geoJsonFilename}

*/

import (
    "github.com/venicegeo/bf-ui/server/domain"
    "github.com/venicegeo/bf-ui/server/services/piazza"
)

type Params struct {
    UserName       string
    Image          string
    OutputFilename string
    InputIds       []string
}

func CreateJob(user beachfront.User, job beachfront.Job) piazza.Message {
    return piazza.Message{
        UserName: user.Name,
        JobType: piazza.JobType{
            Data: piazza.Data{
                DataInputs: []piazza.DataInput{
                    {
                        Content: "cmd=shoreline" +
                        " --image " + job.ImageFilenames() +
                        " --projection geo-scaled" +
                        " --threshold 0.5" +
                        " --tolerance 0" +
                        " " + job.ResultFilename +
                        "&inFiles=" + job.ImageIDs() +
                        "&outGeoJson=" + job.ResultFilename,
                        Type: "text",
                    },
                },
            },
            Type: "execute-service",
        },
    }
}
