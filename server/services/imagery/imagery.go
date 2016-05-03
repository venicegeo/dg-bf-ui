package imagery

import (
	"github.com/venicegeo/bf-ui/server/domain"
)

func List() ([]beachfront.Image, error) {
	return []beachfront.Image{
		beachfront.Image{"LC80090472014280LGN00_B3.TIF", "0d625dbd-30e8-40ad-8d9a-4529a68c1687"},
		beachfront.Image{"LC80090472014280LGN00_B6.TIF", "e386efe8-563c-4939-87c0-9c630d391178"},
		beachfront.Image{"LC80150442014002LGN00_B3.TIF", "99a8c1e9-575e-415c-954d-052d95a105f4"},
		beachfront.Image{"LC80150442014002LGN00_B6.TIF", "cc998be5-faab-472f-ba1b-08da47e4515c"},
		beachfront.Image{"LC80340432016061LGN00_B3.TIF", "c6329155-10fd-4e46-af79-c10f9ea5d283"},
		beachfront.Image{"LC80340432016061LGN00_B6.TIF", "a4be2d78-6079-42bc-8477-bed4f8b96f78"},
		beachfront.Image{"LC82010352014217LGN00_B3.TIF", "c58cd36d-152b-4106-aba7-24653e276d46"},
		beachfront.Image{"LC82010352014217LGN00_B6.TIF", "b0f85df4-4ce9-4734-a50c-c64728c0c0cf"},
	}, nil
}
