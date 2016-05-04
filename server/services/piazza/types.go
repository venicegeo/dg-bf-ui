package piazza

const (
	StatusSuccess = "Success"
	StatusError   = "Error"
	StatusRunning = "Running"
)

type (
	Message struct {
		Type string      `json:"type"`
		Data interface{} `json:"data,omitempty"`
	}

	SearchParameters struct {
		Pattern string `json:"pattern"`
	}

	Status struct {
		Type    string
		JobID   string
		Status  string
		Message string
		Result  struct {
			DataID string
		}
	}

	Service struct {
		ID               string `json:"serviceId"`
		ResourceMetadata struct {
			Name         string
			Description  string
			Availability string
		}
	}
)
