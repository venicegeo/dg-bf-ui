function buildJobList() {
	var table = $("#jobListTable")[0];
	var cell, row;

	// delete any rows that may already be there
	for (var i = table.rows.length - 1; i >= 0; i--) { table.deleteRow(i); }

	// table headers
	row = document.createElement("tr");
	$.each(
		["Job Name", "Date", "Status"],
		function(i, x) {
			cell = document.createElement("td");
			cell.innerHTML = "<b>" + x + "</b>"
			row.appendChild(cell);;

		}
	);
	table.appendChild(row);

	$.each(
		bf.jobs,
		function(i, x) {
			row = document.createElement("tr");

			cell = document.createElement("td");
			cell.innerHTML = x.jobName;
			row.appendChild(cell);
	
			//cell = document.createElement("td");
			//cell.innerHTML = convertDateFormat(x.algorithmName);
			//row.appendChild(cell);
		
			cell = document.createElement("td");
			cell.innerHTML = convertDateFormat(x.date);
			row.appendChild(cell);

			cell = document.createElement("td");
			cell.innerHTML = x.status;
			row.appendChild(cell);

			if (x.status == "Success") {
				cell = document.createElement("td");
				var view = document.createElement("button");
				view.className = "btn btn-primary btn-xs";
				view.innerHTML = "View";
				view.onclick = function() { viewResult(x.piazzaJobId); }
				cell.appendChild(view);
				row.appendChild(cell);
	
				cell = document.createElement("td");
				var download = document.createElement("button");
				download.className = "btn btn-primary btn-xs";
				download.innerHTML = "Download";
				download.onclick = function() { downloadResult(x.piazzaJobId); }

				cell.appendChild(download);
				row.appendChild(cell);
			}

			table.appendChild(row);
		}
	);
}

function checkJobStatus() {
	var countdownSpan = $("#jobStatusUpdateCountdownSpan");

	var seconds = parseFloat(countdownSpan.html());
	seconds--;
	countdownSpan.html(seconds);

	if (seconds == 0) { 
		$.ajax({
			dataType: "json",
			error: function() { alert("Uh oh, something went wrong!"); },
			success: function(data) {
				bf.jobs = data;
				buildJobList();
				countdownSpan.html(10);
				if ($("#jobListDialog").hasClass("in")) { setTimeout("checkJobStatus()", 1000); }
			},
			url: contextPath + "/algorithm/status"
		});
	}
	else {
		bf.automaticStatusUpdate = setTimeout("checkJobStatus()", 1000);
	}
}

function downloadResult(piazzaJobId) {
	window.open(contextPath + "/algorithm/results?piazzaJobId=" + piazzaJobId);
}

function getJobList() {
	displayLoadingDialog("The owl should be back soon with the list...");
	$.ajax({
		dataType: "json",
		error: function() { alert("Uh oh, something went wrong!"); },
		success: function(data) {
			hideLoadingDialog();
			bf.jobs = data;
			buildJobList();
                        $("#jobListDialog").modal("show");
			bf.automaticStatusUpdate = setTimeout("checkJobStatus()", 1000);
		},
		url: contextPath + "/algorithm/status"
	});
}

function stopAutomaticStatusUpdate() {
	clearTimeout(bf.automaticStatusUpdate);
}

function viewResult(piazzaJobId) {
	$.ajax({
		data: "piazzaJobId=" + piazzaJobId,
		dataType: "json",
		error: function() { alert("Uh oh, something went wrong!"); },
		success: function(data) {
			var geoJson = data;
			geoJson.title = piazzaJobId;
			addGeoJsonLayerToMap(geoJson);
		},
		url: contextPath + "/algorithm/results"
	});
}
