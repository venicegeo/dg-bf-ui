function addGeoJsonLayerToMap(geoJson) {
	// to differentiate between multiple vector layers, make them a different color
	var hue = generateRandomHue();
	var style = new ol.style.Style({
		fill: new ol.style.Fill({ color: hue }),
		stroke: new ol.style.Stroke({ color: hue })
	});

	var vectorLayer = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: new ol.format.GeoJSON().readFeatures(geoJson, { featureProjection: "EPSG:3857" })
		}),
		style: style,
		title: geoJson.title,
		visible: true
	});

	map.addLayer(vectorLayer);
	addOtherLayerToLayerSwitcher(vectorLayer);
	map.getView().fit(vectorLayer.getSource().getExtent(), map.getSize())
}

function prepareUpload() {
	// setup up an array to keep track of what's been uploaded
	var files = [];
	$.each($("#uploadFilesInput")[0].files, function(i, x) { files.push({ file: x, status: null }); });

	$("#uploadStatusDialog").modal("show");
	$("#uploadStatusDialog .modal-body").html("<table class = 'table table-striped' id = 'uploadStatusTable'></table>");
	updateUploadStatusTable(files);

	uploadFiles(files);
}

function processUploadedFile(data) {
	if (data.geoJson) {
		var geoJson = data.geoJson;
		geoJson.title = data.filename;
		addGeoJsonLayerToMap(geoJson);
	}
	else if (data.shapefile) {
		
	}
}

function updateUploadStatusTable(files) {
	var table = $("#uploadStatusTable")[0];

	// reset the table
	for (var i = table.rows.length - 1; i >= 0; i--) { table.deleteRow(i); }

	var row = table.insertRow(table.rows.length);
	var cell;
	$.each(
		["File", "Status"],
		function(i, x) {
			cell = row.insertCell(row.cells.length);
			$(cell).append("<b>" + x + "</b>");
		}
	);

	$.each(
		files,
		function(i, x) {
			row = table.insertRow(table.rows.length);
			cell = row.insertCell(row.cells.length);
			$(cell).append(x.file.name);

			cell = row.insertCell(row.cells.length);
			$(cell).append(x.status ? x.status : "Waiting...");
		}
	);

	// adjust the dialog so that is doesn't overflow off the page if the body is too big
	var dialogBody = $("#uploadStatusDialog .modal-body");
	var maxDialogBodyHeight = $(window).height() * 0.7;
	var dialogBodyIsTooTall = dialogBody.height() > maxDialogBodyHeight;
	dialogBody.css("max-height", dialogBodyIsTooTall ? maxDialogBodyHeight : "");
	dialogBody.css("overflow-y", dialogBodyIsTooTall ? "auto" : "");
}

function uploadFiles(files) {
	$.each(
		files,
		function(i, x) {
			if (!x.status) {
				// upload this file
				var formData = new FormData();
				formData.append("file", x.file, x.file.name);
				$.ajax({
					cache: false,
					contentType: false,
					context: { files: files, index: i },
					data: formData,
					dataType: "json",
					error: function(jqXHR, textStatus, errorThrown) {
						this.files[this.index].status = "Error: " + textStatus;

						updateUploadStatusTable(this.files);
						uploadFiles(this.files);
					},
					processData: false,
					success: function(data, textStatus, jqXHR) {
						var file = this.files[this.index];
						var fileSize = this.files[this.index].file.size;
						if (fileSize == data.fileSize) {
							file.status = "Complete!";
						}
						else { file.status = "Error: Incomplete upload. :(" }

						updateUploadStatusTable(this.files);

						processUploadedFile(data);

						// start the next upload
						uploadFiles(this.files);
					},
					type: "post",
 					url: contextPath + "/upload/upload",
					// handle uploading progress
					xhr: function(){
						var xhr = $.ajaxSettings.xhr();
						xhr.upload.addEventListener("progress", function(event){
							if (event.lengthComputable) {
								var percentComplete = parseInt(event.loaded / event.total * 100);
								x.status = percentComplete + "%";
							}
							else { x.status = "In Progress..."; }

							updateUploadStatusTable(files);
						}, false);
        
       
						return xhr;
					}
				});
				

				return false;
			}
		}
	);
}
