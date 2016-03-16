<div class = "modal" id = "uploadDialog">
	<div class = "modal-dialog">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Upload File(s)</h4></div>
			<div class = "modal-body">
					<input accept = ".geojson" id = "uploadFilesInput" multiple type = "file">
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = prepareUpload()>Submit</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>


<div class = "modal" id = "uploadStatusDialog">
	<div class = "modal-dialog">
		<div class = "modal-content">
			<div class = "modal-header"><h4>Upload Status</h4></div>
			<div class = "modal-body"></div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
			</div>
		</div>
	</div>
</div>

