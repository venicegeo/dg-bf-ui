package beachfront


import groovy.json.JsonOutput
import groovyx.net.http.*
import org.apache.http.entity.mime.content.StringBody
import org.apache.http.entity.mime.MultipartEntity
import static groovyx.net.http.Method.POST


class PiazzaService {

	def getJobStatus(params) {
		def postBody = new JsonOutput().toJson([
			apiKey: "my-api-key",
			jobType: [
				jobId: params.jobId,
				type: "get"
			]
		])


		return postToPiazza(postBody)
	}

	def postToPiazza(postBody) {
		def http = new HTTPBuilder("https://pz-gateway.stage.geointservices.io/job")
		http.request(POST) { req ->
			requestContentType: "multipart/form-data"

			def multiPartContent = new MultipartEntity()
			multiPartContent.addPart("body", new StringBody(postBody))
			req.setEntity(multiPartContent)

			response.failure = { resp ->
				println resp


				return null
			}
			response.success = { resp, reader ->


				return reader
			}
		}
	}

	def submitJob(params) {
		def postBody = new JsonOutput().toJson([
			apiKey: "my-api-key",
			jobType: params.jobType
		])

		def response = postToPiazza(postBody)

		if (params.waitForCompletion) {
			def jobResults = getJobStatus(response)
			while (jobResults.status != "Success" && jobResults.status != "Error") { jobResults = getJobStatus(response) }
			

			return jobResults
		}
		else { return response }
	}
}
