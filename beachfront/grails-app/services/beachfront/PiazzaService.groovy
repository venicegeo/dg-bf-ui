package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import groovyx.net.http.*
import org.apache.http.entity.mime.content.StringBody
import org.apache.http.entity.mime.MultipartEntity
import static groovyx.net.http.Method.POST


class PiazzaService {

	def getFile(params) {
		def postBody = new JsonOutput().toJson([
			dataId: params.dataId,
			userName: "myUserName"
		])

		def http = new HTTPBuilder("http://pz-gateway.stage.geointservices.io/file")
		http.request(POST) { req ->
			requestContentType: "multipart/form-data"

			def multiPartContent = new MultipartEntity()
			multiPartContent.addPart("body", new StringBody(postBody))
			req.setEntity(multiPartContent)

			response.failure = { resp, reader ->


				return null
			}
			response.success = { resp, reader ->
				def text = reader.getText()
			
			
				return text
			}
		}
	}

	def getJobStatus(params) {
		def postBody = new JsonOutput().toJson([
			userName: "myUserName",
			jobType: [
				jobId: params.jobId,
				type: "get"
			]
		])


		return postToPiazza(postBody)
	}

	def postToPiazza(postBody) { println postBody
		def http = new HTTPBuilder("http://pz-gateway.stage.geointservices.io/job")
		http.request(POST) { req ->
			requestContentType: "multipart/form-data"

			def multiPartContent = new MultipartEntity()
			multiPartContent.addPart("body", new StringBody(postBody))
			req.setEntity(multiPartContent)

			response.failure = { resp, reader ->
println "Error: " + reader

				return null
			}
			response.success = { resp, reader ->
println "Success: " + reader

				return reader
			}
		}
	}

	def submitJob(params) {
		def postBody = new JsonOutput().toJson([
			userName: "myUserName",
			jobType: params.jobType
		])

		def response = postToPiazza(postBody)

		if (params.waitForCompletion) {
			sleep(1000)
			def jobResults = getJobStatus(response)
			while (jobResults.status != "Success" && jobResults.status != "Error") { jobResults = getJobStatus(response) }
			

			return jobResults
		}
		else { return response }
	}
}
