package jobs

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"fmt"
	"encoding/json"
)

func TestExecute(t *testing.T) {
	m, _ := json.MarshalIndent(executionMessage("test-id", "1.jpg,2.jpg", "foo.geojson", "000,111"), "", "  ")
	fmt.Println(string(m))
	assert.Equal(t, 1, 1)
}
