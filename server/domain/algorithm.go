package beachfront

const InputTypeImage = "image"
const InputTypeBoundingBox = "bbox"
const InputTypeInteger = "integer"
const InputTypeFloat = "float"
const InputTypeText = "text"

type Algorithm struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Inputs      []AlgorithmInput `json:"inputs"`
}

type AlgorithmInput struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Type string `json:"type"`
}
