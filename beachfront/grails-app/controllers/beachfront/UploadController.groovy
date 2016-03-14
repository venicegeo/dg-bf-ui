package beachfront


import groovy.json.JsonOutput


class UploadController {

	def grailsApplication


	def upload() {
		def bytes = params.file.bytes
		def filename = "${new Date().format("yyyyMMddHHmmssSSS")}_${params.file.originalFilename}"
		def tempDirectory = new File("${grailsApplication.config.tempDirectory}")
		def file = new File("${tempDirectory}/${filename}")
		file.append(bytes)
	

		render new JsonOutput().toJson([
			fileSize: file.size(),
			filename: file.name
		])
	}
}
