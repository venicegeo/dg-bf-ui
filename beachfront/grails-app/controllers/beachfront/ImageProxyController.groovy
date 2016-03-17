package beachfront


import javax.imageio.ImageIO


class ImageProxyController {

	def imageProxyService


	def imageProxy() {
		def image = imageProxyService.serviceMethod(params)


		response.contentType = "image/png"
		ImageIO.write(image, "png", response.outputStream)
	}
}
