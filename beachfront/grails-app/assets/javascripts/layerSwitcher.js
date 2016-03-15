function addBaseLayersToLayerSwitcher() {
	$.each(
		bf.baseLayers,
		function(i, x) {
			var properties = x.getProperties();

			var input = document.createElement("input");
			if (x.getVisible()) { input.checked = "checked"; }
			input.name = "layerSwitcherBaseLayer";
			input.type = "radio";
			input.value = i;
	
			$("#layerSwitcherBaseLayersDiv").append(input);
			$("#layerSwitcherBaseLayersDiv").append(x.getProperties().title + "<br>");
		}
	);
	
	// change the base layer every time a radio button is clicked
	$("input[name = 'layerSwitcherBaseLayer']").on("change", function () { changeBaseLayer(this.value); });
}

function addOtherLayerToLayerSwitcher(layer) {

}

function changeBaseLayer(layerName) {
	$.each(
		bf.baseLayers, 
		function(i, x) {
			if (i == layerName) { x.setVisible(true); }
			else { x.setVisible(false); }
		}
	);	
}

function createLayerSwitcherControl() {
	var layerSwitcherControl = function() { ol.control.Control.call(this, { element: $("#layerSwitcher")[0] }); }
	ol.inherits(layerSwitcherControl, ol.control.Control);


	return new layerSwitcherControl();
}
