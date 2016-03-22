<div class = "modal" id = "algorithmListDialog">
	<div class = "modal-dialog">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Algorithm List</h4></div>
			<div class = "modal-body">
				<table class = "table table-hover" id = "algorithmListTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = selectAlgorithm()>Select</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>

<script>
	function getAlgorithmList() {
		displayLoadingDialog("Dispatching a pigeon to fetch a list of algorithms...");
		setTimeout(
			function() { 
				hideLoadingDialog(); 
				buildAlgorithmList();
				$("#algorithmListDialog").modal("show");
				
			}, 
		3000);
	}
</script>

<div class = "modal" id = "algorithmInputsDialog">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Algorithm Input(s)</h4></div>
			<div class = "modal-body">
				<table class = "table" id = "algorithmInputsTable"></table>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal">Submit</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

