package beachfront


import groovy.json.JsonOutput


class UploadController {

	def upload() {
		def file = params.file	


		render new JsonOutput().toJson([fileSize: file.size])
	}
}
