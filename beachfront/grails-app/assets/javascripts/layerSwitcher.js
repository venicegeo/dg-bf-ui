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
	var date = new Date().getTime();
	
	// create a div to hold all of the layer's layer-switcher things
	var div = document.createElement("div");
	div.id = date + "layerSwitcherOtherLayersDiv";
	$("#layerSwitcherOtherLayersDiv").append(div);

	// create a checkbox to toggle the layer's visibility
	var visibilityToggle = createVisibilityToggleCheckbox();
	$("#" + date + "layerSwitcherOtherLayersDiv").append(visibilityToggle);
	$("#" + visibilityToggle.id).click(function() {
		if ($(this).is(":checked")) { layer.setVisible(true); }
		else { layer.setVisible(false); }
	});

	$("#" + date + "layerSwitcherOtherLayersDiv").append("&nbsp;&nbsp;");

	// show the layer's corresponding filename
	var layerLabel = createLayerLabel(layer);
	$("#" + date + "layerSwitcherOtherLayersDiv").append(layerLabel);

	$("#" + date + "layerSwitcherOtherLayersDiv").append("&nbsp;&nbsp;");

	// create a button that will remove the layer
	var removeLayerButton = createRemoveLayerButton();
	$("#" + date + "layerSwitcherOtherLayersDiv").append(removeLayerButton);
	$("#" + removeLayerButton.id).click(function() {
		map.removeLayer(layer);
		$("#" + div.id).remove();
	});

	$("#" + date + "layerSwitcherOtherLayersDiv").append("<br>");

	var slider = createOpacitySlider();
	$("#" + date + "layerSwitcherOtherLayersDiv").append(slider);
	$("#" + slider.id).slider({
		max: 1,
		min: 0,
		step: 0.01,
		tooltip: "hide",
		value: 1
	});
	var hue = layer.getStyle().getFill().getColor();
	$("#" + $(slider).attr("data-slider-id")).find(".slider-selection").css("background", hue);
	$("#" + slider.id).on("change", function(event) { layer.setOpacity(event.value.newValue); });
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

function createLayerLabel(layer) {
	var date = new Date().getTime();

	var label = document.createElement("label");
	label.innerHTML = layer.getProperties().title;


	return label;
}

function createLayerSwitcherControl() {
	var layerSwitcherControl = function() { ol.control.Control.call(this, { element: $("#layerSwitcher")[0] }); }
	ol.inherits(layerSwitcherControl, ol.control.Control);


	return new layerSwitcherControl();
}

function createOpacitySlider() {
	var date = new Date().getTime();

	var input = document.createElement("input");
	$(input).attr("data-slider-id", date + "layerSwitcherOtherLayerOpacitySlider");
	input.id = date + "layerSwitcherOtherLayerOpacitySliderInput";
	input.type = "text";


	return input;
}

function createRemoveLayerButton() {
	var date = new Date().getTime();

	var span = document.createElement("span");
	span.className = "glyphicon glyphicon-remove-circle";
	span.id = date + "layerSwitcherOtherLayerRemoveButton";
	span.style.cursor = "pointer";
	span.title = "Remove Layer";

	
	return span;
}

function createVisibilityToggleCheckbox() {
	var date = new Date().getTime();

	var input = document.createElement("input");
	input.checked = "checked";
	input.id = date + "layerSwitcherOtherLayerCheckbox";
	input.title = "Toggle Layer Visibility";
	input.type = "checkbox";


	return input;
}
