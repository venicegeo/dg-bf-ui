<div class = "modal" id = "jobListDialog">
	<div class = "modal-dialog">
 		<div class = "modal-content">
			<div class = "modal-header">
				<h4>Job List</h4>
				We'll check back and update the table in <span id = "jobStatusUpdateCountdownSpan">10</span> seconds...
			</div>
			<div class = "modal-body">
				<table class = "table table-hover" id = "jobListTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal" onclick = stopAutomaticStatusUpdate()>Close</button>
 			</div>
		</div>
	</div>
</div>
