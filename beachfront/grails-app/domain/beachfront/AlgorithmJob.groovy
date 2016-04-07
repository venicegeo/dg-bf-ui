package beachfront

class AlgorithmJob {
	Date date
	String algorithmName
	String image
	String jobName
	String piazzaJobId
	String status


	static mapping = { 
		date index: "algorithm_job_date_idx"
		version false 
	}
}
