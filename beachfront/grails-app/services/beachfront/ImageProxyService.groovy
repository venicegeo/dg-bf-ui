package beachfront


import javax.imageio.ImageIO


class ImageProxyService {
	//def httpDownloadService


	def serviceMethod(params) {
		params.remove("controller")
		params.remove("format")


		def url = "${params.proxyUrl}"
		params.remove("proxyUrl")

		// add any other parameters that were submitted
		def paramsArray = []
		params.each() { paramsArray.push("${it.key}=${it.value}") }
		if (paramsArray.size() > 0) { url += "?${paramsArray.join("&")}" }

		//def inputStream = httpDownloadService.serviceMethod([url: url])
		//def byteArrayInputStream = new ByteArrayInputStream(inputStream)
		//def bufferedImage = ImageIO.read(byteArrayInputStream)
		def bufferedImage = ImageIO.read(new URL(url))

		return bufferedImage
	}
}
