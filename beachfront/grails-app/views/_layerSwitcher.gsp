<div class = "layer-switcher-control ol-control ol-unselectable" id = "layerSwitcher">
	<div id = "layerSwitcherControlDiv">
		<button id = "layerSwitcherControlButton">
			<span class = "glyphicon glyphicon-menu-hamburger"></span>
		</button>
	</div>

	<div id = "layerSwitcherDiv" style = "display: none">
		<div align = "right">
			<button id = "layerSwitcherCloseButton">
				<span class = "glyphicon glyphicon-remove"></span>
			</button>
		</div>
		<div>
			<div><b>Base Layers:</b></div>
			<div id = "layerSwitcherBaseLayersDiv"></div>
			<div><b>Other Layers:</b></div>
			<div id = "layerSwitcherOtherLayersDiv"></div>
		</div>
	</div>
</div>

<script>
	$("#layerSwitcherControlButton").click(
		function() {
			$("#layerSwitcherControlDiv").hide();
			$("#layerSwitcherDiv").show();
		}
	);
	$("#layerSwitcherCloseButton").click(
		function() {
			$("#layerSwitcherDiv").hide();
			$("#layerSwitcherControlDiv").show();
		}
	);
</script>
