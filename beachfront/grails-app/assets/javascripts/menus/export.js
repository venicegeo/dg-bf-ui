function createForm() {
	var form = document.createElement("form");
	form.method = "post";
	form.target = "_blank";
	$("body").append(form);

	var input = document.createElement("input");
	input.type = "hidden";
               
	form.appendChild(input);


	return [form, input];
}

function exportScreenshot() {
	map.once(
		"postcompose", 
		function(event) {
			var canvasData = event.context.canvas.toDataURL().replace(/\S+,/, ""); 		
			
			var elements = createForm();
			var form = elements[0];
			var input = elements[1];

			form.action = contextPath + "/export/exportCanvas";
			input.name = "imageData";
			input.value = canvasData;

			form.submit();
			form.remove();
		}
	);
	map.renderSync();
}
