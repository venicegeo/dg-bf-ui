package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import groovyx.net.http.*
import org.apache.http.entity.mime.content.StringBody
import org.apache.http.entity.mime.MultipartEntity
import static groovyx.net.http.Method.POST
import static groovyx.net.http.ContentType.*



class PiazzaService {

	def getFile(params) {
		def postBody = new JsonOutput().toJson([
			dataId: params.dataId,
			userName: "myUserName"
		])

		def http = new HTTPBuilder("http://pz-gateway.venicegeo.io/file")
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

	def postToPiazza(postBody) { println JsonOutput.toJson(postBody)
		def http = new HTTPBuilder("http://pz-gateway.venicegeo.io/v2/job")
		http.headers."Accept" = "application/json"
		http.headers."Content-Type" = "application/json"
		http.request(POST) { req ->
			headers."Accept" = "application/json"
			headers."Content-Type" = "application/json"
			send JSON, JsonOutput.toJson(postBody)
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
		def postBody = params.data

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
