package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper


class AlgorithmService {

	def piazzaService	


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
		// get a list of all beachfront applicable algorithms from Piazza
		def jobType = [
			data: [
				field: "name",
				pattern: "BFAlgo"
			],
			type: "search-service"
		]
		def response = piazzaService.submitJob([ jobType: jobType, waitForCompletion: true ])
		def json = response ? new JsonSlurper().parseText(response.result.text) : []
		def algorithms = json.findAll({ it.resourceMetadata.availability != "OUT OF SERVICE" })

		// transform the list so that the inputs can be handled more easily
		algorithms.eachWithIndex() { algorithm, algorithmIndex ->
			algorithm.inputs.eachWithIndex() { input, inputIndex ->
				def inputParams = new JsonSlurper().parseText(input.metadata.about)
				algorithm.inputs[inputIndex] = inputParams
			}
			algorithms[algorithmIndex] = algorithm
		}


		return algorithms
	}

	def status(params) {
		checkStatus()

		def algorithmJobs = []
		AlgorithmJob.findAll().each() {
			algorithmJobs.push(it.properties)
		}

	
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
