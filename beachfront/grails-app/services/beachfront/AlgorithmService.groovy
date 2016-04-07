package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper


class AlgorithmService {

	def piazzaService	


	def checkStatus() {	
		AlgorithmJob.findAll().each() {
			// if the algorithm is not complete, check the status
			if (it.status != "done") {
				def status = "Success" // insert piazza query

				// if the status is anything different than what is in the database, update it
				if (status != it.status) {
					it.status = status
					it.save()
				}
			}
		}
	}

	def results(params) {
		def json = new URL("http://bf-algo.stage.geointservices.io").getText() // insert piazza query
			
	
		return json
	}

	def search(params) {
		// get a list of all beachfront applicable algorithms from Piazza
		//def jobType = [
		//	data: [
		//		field: "name",
		//		pattern: "BFAlgo"
		//	],
		//	type: "search-service"
		//]
		//def response = piazzaService.submitJob([ jobType: jobType, waitForCompletion: true ])
		
		//def json = response ? new JsonSlurper().parseText(response.result.text) : []
		//def algorithms = json.findAll({ it.resourceMetadata.availability != "OUT OF SERVICE" })
		def algorithms = [
			[
				inputs: [
					[ 
						metadata: [ about: "{\"displayName\":\"Images\",\"formKey\":\"--image\",\"type\":\"image\"}" ],
						name: "images"
					]
				],
				resourceMetadata: [
					description: "This Normalized Difference Water Index (DWI) algorithm uses the Open Source Software Image Map (OSSIM) to examine image pixels in an effort to extract shoreline vector data.",
					method: "GET",
					name: "BF_Algo_NDWI",
					url: "https://pzsvc-ossim.stage.geointservices.io/execute"
				]
			]
		]

		
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
		]
		//def submit = new URL("http://localhost:8080/dummyAlgo?aoi=${new JsonOutput().toJson(map)}")
		//println submit.properties
		def response = UUID.randomUUID() //submit.getText()

		def algorithmJob = new AlgorithmJob(
			algorithmName: params.algorithmName,
			date: new Date(),
			image: params."--image",
			jobName: params.jobName,
			piazzaJobId: response,
			status: "Submitted"
		)


		if (algorithmJob.save()) {
			algorithmJob.save()

			
			return [status: true]
		}
		else { return [status: false] }
	}
}
