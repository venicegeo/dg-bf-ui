package beachfront


class AlgorithmService {

	def results() {
	}

	def search(params) {
		def algorithm = [
			name: "Cool Algorithm 1",
			description: "This algorithm is far better than anything you've ever used before, trust me.",
			inputs: [
				[
					key: "bbox",
					name: "Bounding Box",
					type: "bbox"
				],
				[
					key: "image",
					name: "Image",
					type: "image"
				],
				[
					default: 1,
					key: "percision",
					max: 1,
					min: 0,
					name: "Percision",
					type: "float"
				],
				[
					default: 1,
					key: "sensetivity",
					max: 100,
					min: 0,
					name: "Sensetivity",
					type: "integer"
				]
			]
		]

		def algorithms = []
		(0..5).each() {
			algorithm.name = "Cool Algorithm ${it}"
			algorithms.push(new LinkedHashMap(algorithm))
		}
			

		return algorithms
	}

	def status() {
	}

	def submit(params) {
		def http = 1 // new URL("http://localhost:8080/dummyAlgo").getText()

		def algorithmJob = new AlgorithmJob(
			algorithm: params.name,
			date: new Date(),
			piazzaJobId: http
		)


		if (algorithmJob.save()) {
			algorithmJob.save()

			
			return [status: true]
		}
		else { return [status: false] }
		
	}
}
