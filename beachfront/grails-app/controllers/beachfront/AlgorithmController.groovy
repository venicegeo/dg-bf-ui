package beachfront


import groovy.json.JsonOutput


class AlgorithmController {

	def algorithmService	


	def result() {
		def response = algorithmService.result(params)		


		render new JsonOutput().toJson(response)
	}

	def search() {
		def response = algorithmService.search(params)

	
		render new JsonOutput().toJson(response)
	}

	def status() {
		def response = algorithmService.status(params)

		
		render new JsonOutput().toJson(response)
	}

	def submit() {
		def response = algorithmService.submit(params)

	
		render new JsonOutput().toJson(response)
	}
}
