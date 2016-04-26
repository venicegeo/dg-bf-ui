package beachfront

const AlgorithmTypeImage = "image"
const AlgorithmTypeBoundingBox = "bbox"
const AlgorithmTypeInteger = "integer"
const AlgorithmTypeFloat = "float"
const AlgorithmTypeText = "text"

type Algorithm struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Inputs      []AlgorithmInput `json:"inputs"`
}

type AlgorithmInput struct {
    Key  string `json:"key"`
    Name string `json:"name"`
    Type string `json:"type"`
}
