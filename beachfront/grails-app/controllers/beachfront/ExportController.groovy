package beachfront


import javax.imageio.ImageIO


class ExportController {

	def exportService
	def restApiService


	def exportCanvas() {
		def requestMap = restApiService.normalizeRequestParams(params, request)
		def image = exportService.canvasToImage([imageData: requestMap.imageData])


		response.contentType = "image/png"
		ImageIO.write(image, "png", response.outputStream)
		response.outputStream.flush()
	}
}
