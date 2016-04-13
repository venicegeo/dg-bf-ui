function buildAlgorithmInputList(algorithm) {
	var table = document.createElement("table");
	table.className = "table";

	var row = document.createElement("tr");
	var cell = document.createElement("td");
	cell.align = "right";
	cell.innerHTML = "<b>Job Name:</b>";
	row.appendChild(cell);

	cell = document.createElement("td");
	cell.innerHTML = "<input id = 'jobNameInput' type = 'text' value = 'BF_Run_" + new Date().getTime() + "'>";
	row.appendChild(cell);
	table.appendChild(row);

	var inputs = algorithm.inputs;
	$.each(
		inputs,
		function(i, x) {
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.align = "right";
			cell.innerHTML = "<b>" + x.displayName + ":</b>";
			row.appendChild(cell);

			cell = document.createElement("td");
			switch (x.type) {
				case "bbox" : 
					cell.appendChild(createBboxInput(x)); 
					break;
				case "float" :
					cell.innerHTML = "<input id = '" + x.formKey + "Input' " + 
						"max = '" + x.max + "' min = '" + x.min + "' step = '0.1' value = '" + x.default + "' type = 'number'>"; 
					break;
				case "image" :
					cell.innerHTML = "<input id = '" + x.formKey + "Input' placeholder = 's3://my-bucket/my-file' type = 'text'>"; 
					cell.innerHTML = "<select id = '" + x.formKey + "Input'>" + 
							"<option value = 'LC80090472014280LGN00_B3.TIF,LC80090472014280LGN00_B6.TIF'>LC80090472014280LGN00</option>" +
							"<option value = 'LC80150442014002LGN00_B3.TIF,LC80150442014002LGN00_B6.TIF'>LC80150442014002LGN00</option>" +
							"<option value = 'LC80340432016061LGN00_B3.TIF,LC80340432016061LGN00_B6.TIF'>LC80340432016061LGN00</option>" +
							"<option value = 'LC81190532015078LGN00_B3.TIF,LC81190532015078LGN00_B6.TIF'>LC81190532015078LGN00</option>" +
							"<option value = 'LC81600422014314LGN00_B3.TIF,LC81600422014314LGN00_B6.TIF'>LC81600422014314LGN00</option>" +
							"<option value = 'LC82010352014217LGN00_B3.TIF,LC82010352014217LGN00_B6.TIF'>LC82010352014217LGN00</option>" +
						"</select>";
					break;
				case "integer" :
					cell.innerHTML = "<input id = '" + x.formKey + "Input' " + 
						"max = '" + x.max + "' min = '" + x.min + "' step = '1' value = '" + x.default + "' type = 'number'>"; 
					break;
				case "text" : cell.innerHTML = "<input id = '" + x.formKey + "Input' type = 'text'>";
			}
			row.appendChild(cell);

			table.appendChild(row);
		}
	);

	$("#algorithmInputsDialog .modal-body").html(table);
        $("#algorithmInputsDialog").modal("show");	
}

function buildAlgorithmList() {
	var table = $("#algorithmListTable")[0];
	var row, cell;
	
	// delete any rows that may already be there
	for (var i = table.rows.length - 1; i >= 0; i--) { table.deleteRow(i); }

	$.each(
		bf.algorithms,
		function(i, x) {
			row = table.insertRow(i);
			var cell = row.insertCell(row.cells.length);
			$(cell).append(x.resourceMetadata.name + "<br>");		

			// create a details div section for the algorithm
			var div = document.createElement("div");
			div.id = "details";
			var details = "<b>Description: </b>" + x.resourceMetadata.description + "<br>"; 
			details += "<b>Inputs: </b><br>";
			$.each(
				x.inputs,
				function(j, y) {
					details += "&nbsp;&nbsp;&nbsp;" + y.displayName + " (" + y.type + ")<br>";
				}
			);
			div.innerHTML = details;
			div.style.display = "none";

			cell.appendChild(div);

			// handle click events 
			row.onclick = function() { 	
				resetAlgorithmListTable();
				$(this).addClass("success");
				$(this).find("div#details").show();
			}
		}
	);
}

function createBboxInput(inputObject) {
	var div = document.createElement("div");

	var input = document.createElement("input");
	input.id = "bboxInput";
	input.placeholder = "minX,minY,maxX,maxY";
	input.type = "text";
	input.width = "100%";
	div.appendChild(input);

	div.innerHTML += "&nbsp;";

	var button = document.createElement("button");
	button.className = "btn btn-primary";
	button.innerHTML = "Select";
	button.onclick = function() { prepareBoundingBoxInput(); return false; }
	div.appendChild(button);


	return div;
}

function getAlgorithmList() {
	displayLoadingDialog("Dispatching a pigeon to fetch a list of algorithms...");
	$.ajax({
		dataType: "json",
		error: function() { alert("Uh oh, something went wrong!"); },
		success: function(data) {
			hideLoadingDialog();
			bf.algorithms = data;
			buildAlgorithmList();			
			$("#algorithmListDialog").modal("show");
		},
		url: contextPath + "/algorithm/search"
	});
}

function getSelectedAlgorithm() {
	// determine which algorithm has been selected
        var algorithm;
        $.each(
                $("#algorithmListTable")[0].rows,
                function(i, x) {
                        if ($(x).hasClass("success")) { algorithm = bf.algorithms[i]; }
                }
        );

	
	return algorithm;
}

function resetAlgorithmListTable() {
	var table = $("#algorithmListTable")[0];
	$.each(
		table.rows, 
		function(i, x) { 
			$(x).removeClass("success"); 
			var details = $(this).find("div");
			$(details).hide();
		}
	); 
}

function selectAlgorithm() {
	// determine which algorithm has been selected 
	var algorithm = getSelectedAlgorithm();
	buildAlgorithmInputList(algorithm);
}

function submitAlgorithmInputs() {
	var algorithm = getSelectedAlgorithm();

	var params = { 
		algorithm: algorithm,
		algorithmName: algorithm.resourceMetadata.name, 
		jobName: $("#jobNameInput").val(),
		serviceId: algorithm.id
	};
	$.each(
		algorithm.inputs,
		function(i, x) {
			params[x.formKey] = $("#" + x.formKey + "Input").val();
		}
	);

	$.ajax({
		data: params,
		dataType: "json",
		error: function() { alert("Uh oh, something went wrong!"); },
		success: function(data) {
			if (data.status) { alert("You have successfully submitted your algorithm inputs!"); }
			else { alert("Uh oh, something went wrong!"); }
		},
		type: "post",
		url: contextPath + "/algorithm/submit"
	});
}

