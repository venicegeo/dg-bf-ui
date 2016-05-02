package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper


class AlgorithmService {

	def piazzaService	


	def checkStatus() {	
		AlgorithmJob.findAll().each() {
			// if the algorithm is not complete, check the status
			if (it.status != "Success" || !it.piazzaDataId) {
				def response = new URL("http://pz-gateway.venicegeo.io/job/${it.piazzaJobId}").getText()
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
		def text = new URL("http://pz-gateway.venicegeo.io/file/${params.piazzaDataId}").getText()
		println text
		def outputFilename = AlgorithmJob.findByPiazzaDataId(params.piazzaDataId).outputFilename
		def dataId = text.find(/${outputFilename}\\["]:\\["]([a-z0-9|-]*)\\["]/) { matcher, geojsonDataId -> return geojsonDataId }
	
		//def file = piazzaService.getFile([ dataId: dataId ])
		def file = new URL("http://pz-gateway.venicegeo.io/file/${dataId}").getText()
		def json = new JsonSlurper().parseText(file)

	
		return json
	}

	def search(params) {
		// get a list of all beachfront applicable algorithms from Piazza
		def response = new URL("http://pz-gateway.venicegeo.io/service?per_page=100&keyword=BF_Algo").getText()
println response
		def json = response ? new JsonSlurper().parseText(response) : []
		def algorithms = json.data.findAll({ it.resourceMetadata?.name?.contains("BF_Algo") && it.serviceId && it.resourceMetadata?.availability != "OUT OF SERVICE" })
		
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
			"LC80090472014280LGN00_B3.TIF": "df44ad97-5b39-4a19-b668-a1311444d439",
			"LC80090472014280LGN00_B6.TIF": "d2004fac-d55c-4eaf-8e7a-051d1ecf134d",
			"LC80150442014002LGN00_B3.TIF": "6aa8c5a2-90a7-417f-8424-5b7bb41bcef5",
			"LC80150442014002LGN00_B6.TIF": "d76aa544-f8a8-416e-b0c0-f0c11645a997",
			"LC80340432016061LGN00_B3.TIF": "c4353694-026c-402d-80c6-694698f16c31",
			"LC80340432016061LGN00_B6.TIF": "769dca25-deaa-4e12-9d9e-25c6c5963058",
			"LC82010352014217LGN00_B3.TIF": "3c6f1cd4-b1fb-44a6-9bd9-ab5c1d5d60e6",
			"LC82010352014217LGN00_B6.TIF": "d7b2aba9-c362-4014-9d9e-70a75398c69c"
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
