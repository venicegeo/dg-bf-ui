package beachfront


import groovy.json.JsonOutput
import groovy.json.JsonSlurper


class AlgorithmService {

	def piazzaService	


	def checkStatus() {	
		AlgorithmJob.findAll().each() {
			// if the algorithm is not complete, check the status
			if (it.status != "Success" || !it.piazzaDataId) {
				def response = piazzaService.getJobStatus([ jobId: it.piazzaJobId ])
				def status = response.status 

				// if the status is anything different than what is in the database, update it
				if (status != it.status) { it.status = status }
		
				if (!it.piazzaDataId && response.result?.dataId) { it.piazzaDataId = response.result.dataId }

				it.save()
			}
		}
	}

	def results(params) {
		def text = piazzaService.getFile([ dataId: params.piazzaDataId ])
		def outputFilename = AlgorithmJob.findByPiazzaDataId(params.piazzaDataId).outputFilename
		def dataId = text.find(/${outputFilename}\\["]:\\["]([a-z0-9|-]*)\\["]/) { matcher, geojsonDataId -> return geojsonDataId }
	
		def file = piazzaService.getFile([ dataId: dataId ])
println file
println file.class
		def json = new JsonSlurper().parseText(file)
println json			
	
		return json
	}

	def search(params) {
		// get a list of all beachfront applicable algorithms from Piazza
		def jobType = [
			data: [
				field: "name",
				pattern: "BF_Algo"
			],
			type: "search-service"
		]
		def response = piazzaService.submitJob([ jobType: jobType, waitForCompletion: true ])
		def json = response ? new JsonSlurper().parseText(response.result.text) : []
		def algorithms = json.findAll({ it.resourceMetadata.availability != "OUT OF SERVICE" })
		
		// transform the list so that the inputs can be handled more easily
		algorithms.eachWithIndex() { algorithm, algorithmIndex ->
			algorithm.inputs = [""]
			algorithm.inputs.eachWithIndex() { input, inputIndex ->
				def inputParams = [
					displayName: "Images",
					formKey: "--image",
					type: "image"
				]
			//	// [] //new JsonSlurper().parseText(input.metadata.about)
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

	def submit(params) { 
		// assemble the parameters to submit to the algorithm
		def dataIdMap = [
			"LC80090472014280LGN00_B3.TIF": "643dd0a6-5128-49a4-9dbc-ac5ba0530e95",
			"LC80090472014280LGN00_B6.TIF": "22b85cb1-7b2c-4a51-874f-22fc4e439b8b",
			"LC80150442014002LGN00_B3.TIF": "f51e7576-1245-455a-a683-707aa79e7e46",
			"LC80150442014002LGN00_B6.TIF": "92741ab8-96ae-4a1f-841c-a05bc6d2f661",
			"LC80340432016061LGN00_B3.TIF": "8cac8caa-cbdc-46fa-8e55-fa507522efc6",
			"LC80340432016061LGN00_B6.TIF": "13299df7-37b5-445e-bc06-70c26c3e72c2",
			"LC81190532015078LGN00_B3.TIF": "37c61870-f464-4c82-824c-29fe5d1d6528",
			"LC81190532015078LGN00_B6.TIF": "fb143d27-570c-4993-90da-1120612b1662",
			"LC81600422014314LGN00_B3.TIF": "742718f0-7f5f-4a7b-a431-ee55a4bedd16",
			"LC81600422014314LGN00_B6.TIF": "f01c4f71-d19b-4ce6-81ec-1f83001f25f9",
			"LC82010352014217LGN00_B3.TIF": "c392a815-3edf-4254-884c-27197e17a273",
			"LC82010352014217LGN00_B6.TIF": "9b8f64ef-76ad-492c-8cc1-3842d6fbd4e9"
		]
		def dataIds = []
		params."--image".split(",").each() { dataIds.push(dataIdMap["${it}"]) }

		def geoJsonFilename = "BF_${new Date().format("yyyyMMddHHmmssSSS")}.geojson"
		def jobType = [
  			data: [
				dataInputs: [
					"": [
						content: "cmd=shoreline --image ${params."--image"} --projection geo-scaled --threshold 0.5 --tolerance 0 ${geoJsonFilename}&inFiles=${dataIds.join(",")}&outGeoJson=${geoJsonFilename}",
						type: "text"
					] 
				],
				serviceId: params.serviceId,
                        ],
                        type: "execute-service"
		]
		def response = piazzaService.submitJob([ jobType: jobType ])

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
