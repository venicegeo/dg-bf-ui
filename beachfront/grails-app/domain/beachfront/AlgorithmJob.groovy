package beachfront

class AlgorithmJob {
	//String bbox
	Date date
	String algorithm
	//String image
	//Double percision
	String piazzaJobId
	//Integer sensetivity


	static mapping = { 
		date index: "algorithm_job_date_idx"
		version false 
	}
}
