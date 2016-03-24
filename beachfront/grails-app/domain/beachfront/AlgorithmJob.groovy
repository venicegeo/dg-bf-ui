package beachfront

class AlgorithmJob {
	//String bbox
	Date date
	String algorithmName
	//String image
	//Double percision
	String piazzaJobId
	String status
	//Integer sensetivity


	static mapping = { 
		date index: "algorithm_job_date_idx"
		version false 
	}
}
