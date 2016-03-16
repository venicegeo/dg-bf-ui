package beachfront


import groovy.json.JsonOutput


class UploadController {

	def processUploadService


	def upload() {
		def json = processUploadService.serviceMethod(params)
	

		render new JsonOutput().toJson(json)
	}
}
