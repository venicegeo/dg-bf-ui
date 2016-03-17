package beachfront


import javax.imageio.ImageIO


class ExportService {

	def canvasToImage(params) {
		def imageData = params.imageData
		def bytes = imageData.bytes
		def decoded = bytes.decodeBase64()
		def byteArrayInputStream = new ByteArrayInputStream(decoded)
		def image = ImageIO.read(byteArrayInputStream)

		
		return image
	}
}
