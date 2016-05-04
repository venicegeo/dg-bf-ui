package imagery

import (
	"github.com/venicegeo/bf-ui/server/domain"
)

func List() ([]beachfront.Image, error) {
	return []beachfront.Image{
		beachfront.Image{"LC80090472014280LGN00_B3.TIF", "e32b37c5-dc6e-4c7b-b11e-81a23ebdbb0a"},
		beachfront.Image{"LC80090472014280LGN00_B6.TIF", "2aab2e30-a612-4c5a-8351-324e57a9e993"},
		beachfront.Image{"LC80150442014002LGN00_B3.TIF", "65bff6c1-62f4-41d6-a28b-aebb6cb56621"},
		beachfront.Image{"LC80150442014002LGN00_B6.TIF", "9c1dc643-5ddd-4f9e-8a3b-6fbc93906a50"},
	}, nil
}
