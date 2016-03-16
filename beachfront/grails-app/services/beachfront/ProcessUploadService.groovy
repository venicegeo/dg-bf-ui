package beachfront


import groovy.json.JsonSlurper


class ProcessUploadService {

	def grailsApplication

	
	def isGeoJson(file) {
		def text = file.getText()
		def geoJson = false
		try { geoJson = new JsonSlurper().parseText(text) }
		catch (Exception e) { println e }

		
		return geoJson
	}

	def isShapeFile(file) {
		return false
	}

	def serviceMethod(params) {
		def bytes = params.file.bytes

		def originalFilename = params.file.originalFilename
		def filename = "${new Date().format("yyyyMMddHHmmssSSS")}_${originalFilename}"
		def tempDirectory = new File("${grailsApplication.config.tempDirectory}")
		def file = new File("${tempDirectory}/${filename}")
		file.append(bytes)

		def map = [
			fileSize: file.size(),
			filename: originalFilename,
			geoJson: false,
			shapefile: false,
			other: false
		]

		def geoJson = isGeoJson(file)
		if (geoJson) { map.geoJson = geoJson }
		else {
			def shapefile = isShapefile(file)
			if (shapefile) {  map.shapefile = shapefile}
			else { map.other = true }
		}
	

		return map
	}
}
