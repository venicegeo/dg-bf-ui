package beachfront


import groovy.json.JsonOutput


class AlgorithmService {

	def checkStatus() {	
		AlgorithmJob.findAll().each() {
			// if the algorithm is not complete, check the status
			if (it.status != "done") {
				def status = new URL("http://localhost:8080/checkStatus?procIndex=${it.jobId}").getText()

				// if the status is anything different than what is in the database, update it
				if (status != it.status) {
					it.status = status
					it.save()
				}
			}
		}
	}

	def results(params) {
		def json = new URL("http://localhost:8080/getResult?resultIndex=${params.jobId}").getText()
	
	
		return json
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
					key: "precision",
					max: 1,
					min: 0,
					name: "Precision",
					type: "float"
				],
				[
					default: 1,
					key: "sensitivity",
					max: 100,
					min: 0,
					name: "Sensitivity",
					type: "integer"
				]
			]
		]

		def algorithms = []
		(0..5).each() {
			algorithm.name = "Cool Algorithm ${it}"
			algorithms.push(new LinkedHashMap(algorithm))
		}

		sleep(2000)			

		return algorithms
	}

	def status(params) {
		checkStatus()

		def algorithmJobs = []
		AlgorithmJob.findAll().each() {
			algorithmJobs.push(it.properties)
		}
		sleep(3000)	

	
		return algorithmJobs
	}

	def submit(params) {
		// assemble the parameters to submit to the algorithm
		def map = [
			BoundBox: params.bbox.split(",").collect({ it as Double }),
			ImageLink: params.image
		]
		def submit = new URL("http://localhost:8080/dummyAlgo?aoi=${new JsonOutput().toJson(map)}")
		def response = submit.getText()

		def algorithmJob = new AlgorithmJob(
			algorithmName: params.algorithmName,
			bbox: params.bbox,
			date: new Date(),
			image: params.image,
			jobId: response,
			jobName: params.jobName,
			status: "Submitted"
		)


		if (algorithmJob.save()) {
			algorithmJob.save()

			
			return [status: true]
		}
		else { return [status: false] }
	}
}
