<div class = "modal" id = "geoJumpDialog">
	<div class = "modal-dialog">
 		<div class = "modal-content">
			<div class = "modal-header"><h4>Geo-Jump</h4></div>
			<div class = "modal-body">
				Location: <input id = "geoJumpLocationInput" placeholder = "DD, DMS or MGRS" type = "text">
				<script>
					$("#geoJumpLocationInput").keypress(
						function(event) { 
							if (event.keyCode == 13) { 
								$("#geoJumpDialog").modal("hide");
								geoJump($("#geoJumpLocationInput").val()); 
							} 
						}
					);
				</script>
			</div>
			<div class = "modal-footer">
				<button type = "button" class = "btn btn-primary" data-dismiss = "modal" onclick = geoJump($("#geoJumpLocationInput").val())>Go There!</button>
				<button type = "button" class = "btn btn-default" data-dismiss = "modal">Close</button>
 			</div>
		</div>
	</div>
</div>
