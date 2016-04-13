package beachfront

class AlgorithmJob {
	Date date
	String algorithmName
	String image
	String jobName
	String outputFilename
	String piazzaDataId
	String piazzaJobId
	String status

	
	static constraints = {
		piazzaDataId nullable: true
	}

	static mapping = { 
		date index: "algorithm_job_date_idx"
		version false 
	}
}
