package beachfront


import groovy.json.JsonOutput


class AlgorithmController {

	def algorithmService	


	def checkStatus() {
		def status = algorithmService.checkStatus()

		
		render "Done"
	}

	def results() {
		def results = algorithmService.results(params)		

		
		response.contentType = "application/json"
		render new JsonOutput().toJson(results)
	}

	def search() {
		def search = algorithmService.search(params)

	
		render new JsonOutput().toJson(search)
	}

	def status() {
		def status = algorithmService.status(params)
		
		
		render new JsonOutput().toJson(status)
	}

	def submit() {
		def submit = algorithmService.submit(params)

	
		render new JsonOutput().toJson(submit)
	}
}
