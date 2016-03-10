<li class = "dropdown">
	<a href ="javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" title = "Map Controls">
		<span class = "glyphicon glyphicon-globe"></span><span class = "caret"></span>
	</a>
	<ul class = "dropdown-menu">
		<li><a href = javascript:void(0) onclick = enableDisableMapRotation($(this).children()[0])>
			<span>Enable Map Rotation</span>
		</a></li>
		<li><a href = javascript:void(0) onclick = $("#geoJumpDialog").modal("show");$("#geoJumpLocationInput").focus()>Geo-Jump</a></li>
	</ul>
</li>
