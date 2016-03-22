var algorithms = [
	{
		name: "Cool Algorithm 1",
		description: "This is where a description goes.",
		inputs: [
			{
				name: "Bounding Box",
				type: "array"
			},
			{
				name: "Image",
				type: "image"
			},
			{
				name: "Sensetivity",
				type: "integer"
			}
		]
	},
	{
		name: "Cool Algorithm 2",
		description: "This is where a description goes.",
		inputs: [
			{
				name: "Bounding Box",
				type: "array"
			},
			{
				name: "Image",
				type: "image"
			},
			{
				name: "Sensetivity",
				type: "integer"
			}
		]
	},
	{       
		name: "Cool Algorithm 3",
		description: "This is where a description goes.",
		inputs: [
			{
				name: "Bounding Box",
				type: "array"
			},
			{
				name: "Image",
				type: "image"
			},
			{
				name: "Sensetivity",
				type: "integer"
			}
		]
	},
	{       
		name: "Cool Algorithm 4",
		description: "This is where a description goes.",
		inputs: [
			{
				name: "Bounding Box",
				type: "array"
			},
			{
				name: "Image",
				type: "image"
			},
			{
				name: "Sensetivity",
				type: "integer"
			}
		]
	},
	{       
		name: "Cool Algorithm 5",
		description: "This is where a description goes.",
		inputs: [
			{
				name: "Bounding Box",
				type: "array"
			},
			{
				name: "Image",
				type: "image"
			},
			{
				name: "Sensetivity",
				type: "integer"
			}
		]
	}
];

function buildAlgorithmList() {
	var table = $("#algorithmListTable")[0];
	var row, cell;
	
	// delete any rows that may already be there
	for (var i = table.rows.length - 1; i >= 0; i--) { table.rows.delete(i); }

	$.each(
		algorithms,
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

function getAlgorithmList() {
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
	var algorithm;
	$.each(
		$("#algorithmListTable")[0].rows,
		function(i, x) {
			if ($(x).hasClass("success")) {
				algorithm = algorithms[i];
			}
		}
	);

	alert("You chose " + JSON.stringify(algorithm));
}
