package beachfront

class AlgorithmJob {
	String bbox
	Date date
	String algorithmName
	String image
	String jobId
	String jobName
	String status


	static mapping = { 
		date index: "algorithm_job_date_idx"
		version false 
	}
}
