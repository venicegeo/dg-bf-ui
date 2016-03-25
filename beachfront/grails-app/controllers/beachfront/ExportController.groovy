package beachfront


import javax.imageio.ImageIO


class ExportController {

	def exportService
	def restApiService


	def exportCanvas() {

		def requestMap = request.reader.text.split('&').inject([:]) {
			map, token ->
				token.split('=').with { map[it[0]] = java.net.URLDecoder.decode(it[1]) }
				map
			}
		println requestMap                
                




		//def requestMap = restApiService.normalizeRequestParams(params, request)
		def image = exportService.canvasToImage([imageData: requestMap.imageData])


		response.contentType = "image/png"
		def filename = "BF_Screenshot_${new Date().format("yyyyMMddHHmmssSSS")}"
		response.setHeader("Content-disposition", "attachment;filename=${filename}")
		ImageIO.write(image, "png", response.outputStream)
		response.outputStream.flush()
	}
}
