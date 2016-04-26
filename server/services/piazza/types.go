package piazza

const (
    Success = "Success"
    Error = "Error"
    Submitted = "Submitted"
    TimedOut = "Timed_Out"
    OutOfService = "OUT OF SERVICE"
)

type (
    Message struct {
        UserName          string `json:"userName"`
        JobType           interface{} `json:"jobType"`
        DataID            string `json:"dataId,omitempty"`
    }

    JobType struct {
        Type string `json:"type"`
        Data interface{} `json:"data,omitempty"`
        JobID string `json:"jobId,omitempty"`
    }

    SearchParameters struct {
        Field   string `json:"field"`
        Pattern string `json:"pattern"`
    }

    RetrievalParameters struct {
        JobID string `json:"jobId"`
        Type string `json:"type"`
    }

    ExecutionParameters struct {
        DataInput []ExecutionInputs `json:"dataInput"`
    }

    ExecutionInputs struct {
        Content string `json:"content"` // Note: Ampersands will be unicode-escaped
        Type    string `json:"type"`
    }

    ExecutionMetadata struct {
        OutFiles map[string]string
    }

    JobResponse struct {
        Type  string
        JobID string
        Status string
        Message string
        Result JobResult
    }

    JobResult struct {
        Type string
        Text string  // generally stringified JSON
        DataID string
    }

    RawAlgorithm struct {
        ID string
        ResourceMetadata RawAlgorithmMetadata
    }

    RawAlgorithmMetadata struct {
        Name string
        Description string
        URL string
        Availability string
    }
)

func (self RawAlgorithm) IsAvailable() bool {
    return self.ResourceMetadata.Availability != OutOfService
}
