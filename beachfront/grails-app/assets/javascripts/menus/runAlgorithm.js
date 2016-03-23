function buildAlgorithmInputList(algorithm) {
	var table = document.createElement("table");
	table.className = "table";

	var inputs = algorithm.inputs;
	$.each(
		inputs,
		function(i, x) {
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.align = "right";
			cell.innerHTML = "<b>" + x.name + ":</b>";
			row.appendChild(cell);

			cell = document.createElement("td");
			switch (x.type) {
				case "bbox" : 
					cell.appendChild(createBboxInput(x)); break;
				case "float" :
					cell.innerHTML = "<input id = '" + x.key + "Input' max = '" + x.max + "' min = '" + x.min + "' step = '0.1' value = '" + x.default + "' type = 'number'>"; break;
				case "image" :
					cell.innerHTML = "<input id = '" + x.key + "Input' placeholder = 's3://my-bucket/my-file' type = 'text'>"; break;
				case "integer" :
					cell.innerHTML = "<input id = '" + x.key + "Input' max = '" + x.max + "' min = '" + x.min + "' step = '1' value = '" + x.default + "' type = 'number'>"; break;
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
			$(cell).append(x.name + "<br>");		

			// create a details div section for the algorithm
			var div = document.createElement("div");
			div.id = "details";
			var details = "<b>Description: </b>" + x.description + "<br>"; 
			details += "<b>Inputs: </b><br>";
			$.each(
				x.inputs,
				function(j, y) {
					details += "&nbsp;&nbsp;&nbsp;" + y.name + " (" + y.type + ")<br>";
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

	var params = { name: algorithm.name };
	$.each(
		algorithm.inputs,
		function(i, x) {
			params[x.key] = $("#" + x.key + "Input").val();
		}
	);

	$.ajax({
		data: params,
		dataType: "json",
		success: function(data) {
			if (data.status) { alert("You have successfully submitted your algorithm inputs!"); }
			else { alert("Uh oh, something went wrong!"); }
		},
		type: "post",
		url: contextPath + "/algorithm/submit"
	});
}

