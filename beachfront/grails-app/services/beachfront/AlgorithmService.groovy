package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper


class AlgorithmService {

	def piazzaService	


	def checkStatus() {	
		AlgorithmJob.findAll().each() {
			// if the algorithm is not complete, check the status
			if (it.status != "Success" || !it.piazzaDataId) {
				def response = new URL("https://pz-gateway.stage.geointservices.io/job/${it.piazzaJobId}").getText()
				def json = new JsonSlurper().parseText(response)
				println response
				def status = json.status 

				// if the status is anything different than what is in the database, update it
				if (status != it.status) { it.status = status }
		
				if (!it.piazzaDataId && json.result?.dataId) { it.piazzaDataId = json.result.dataId }

				it.save()
			}
		}
	}

	def results(params) {
		//def text = piazzaService.getFile([ dataId: params.piazzaDataId ])
		def text = new URL("https://pz-gateway.stage.geointservices.io/file/${params.piazzaDataId}").getText()
		println text
		def outputFilename = AlgorithmJob.findByPiazzaDataId(params.piazzaDataId).outputFilename
		def dataId = text.find(/${outputFilename}\\["]:\\["]([a-z0-9|-]*)\\["]/) { matcher, geojsonDataId -> return geojsonDataId }
	
		//def file = piazzaService.getFile([ dataId: dataId ])
		def file = new URL("https://pz-gateway.stage.geointservices.io/file/${dataId}").getText()
		def json = new JsonSlurper().parseText(file)

	
		return json
	}

	def search(params) {
		// get a list of all beachfront applicable algorithms from Piazza
		def response = new URL("https://pz-gateway.stage.geointservices.io/service?per_page=100&keyword=BF_Algo").getText()
		def json = response ? new JsonSlurper().parseText(response) : []
		def algorithms = json.data.findAll({ it.resourceMetadata?.name?.contains("BF_Algo") && it.serviceId })
		
		// transform the list so that the inputs can be handled more easily
		algorithms.eachWithIndex() { algorithm, algorithmIndex ->
			algorithm.inputs = [""]
			algorithm.inputs.eachWithIndex() { input, inputIndex ->
				def inputParams = [
					displayName: "Images",
					formKey: "--image",
					type: "image"
				]
		
				algorithm.inputs[inputIndex] = inputParams
			}
			algorithms[algorithmIndex] = algorithm
		}


		return algorithms
	}

	def status(params) {
		checkStatus()

		def algorithmJobs = []
		AlgorithmJob.findAll().each() {
			algorithmJobs.push(it.properties)
		}

	
		return algorithmJobs
	}

	def submit(params) { println params 
		// assemble the parameters to submit to the algorithm
		def dataIdMap = [
			"LC80090472014280LGN00_B3.TIF": "0d625dbd-30e8-40ad-8d9a-4529a68c1687",
			"LC80090472014280LGN00_B6.TIF": "e386efe8-563c-4939-87c0-9c630d391178",
			"LC80150442014002LGN00_B3.TIF": "99a8c1e9-575e-415c-954d-052d95a105f4",
			"LC80150442014002LGN00_B6.TIF": "cc998be5-faab-472f-ba1b-08da47e4515c",
			"LC80340432016061LGN00_B3.TIF": "c6329155-10fd-4e46-af79-c10f9ea5d283",
			"LC80340432016061LGN00_B6.TIF": "a4be2d78-6079-42bc-8477-bed4f8b96f78",
			"LC82010352014217LGN00_B3.TIF": "c58cd36d-152b-4106-aba7-24653e276d46",
			"LC82010352014217LGN00_B6.TIF": "b0f85df4-4ce9-4734-a50c-c64728c0c0cf"
		]
		def dataIds = []
		params."--image".split(",").each() { dataIds.push(dataIdMap["${it}"]) }

		def geoJsonFilename = "BF_${new Date().format("yyyyMMddHHmmssSSS")}.geojson"
		def data = [
  			data: [
				dataInputs: [
					cmd: [
						content: "shoreline --image ${params."--image"} --projection geo-scaled --threshold 0.5 --tolerance 0 ${geoJsonFilename}",
						type: "urlparameter"
					],
					inFiles: [ 
						content: dataIds.join(","),
						type: "urlparameter"
					],
					outGeoJson: [ 
						content: geoJsonFilename,
						type: "urlparameter"
					]
				],
				dataOutput: [ 
					[
						mimeType: "application/json", 
						type: "text"
					]
				],
				serviceId: params.serviceId
                        ],
                        type: "execute-service"
		]
		def response = piazzaService.submitJob([ data: data ])

		println response

		// save to database
		def algorithmJob = new AlgorithmJob(
			algorithmName: params.algorithmName,
			date: new Date(),
			image: params."--image",
			jobName: params.jobName,
			outputFilename: geoJsonFilename,
			piazzaJobId: response.jobId,
			status: "Submitted"
		)


		if (algorithmJob.save()) {
			algorithmJob.save()

			
			return [status: true]
		}
		else { return [status: false] }
	}
}
