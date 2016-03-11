<li class = "dropdown">
	<a href ="javascript:void(0)" class = "dropdown-toggle" data-toggle = "dropdown" title = "Map Controls">
		Map Controls<span class = "caret"></span>
	</a>
	<ul class = "dropdown-menu">
		<li><a href = javascript:void(0) onclick = enableDisableMapRotation($(this).children()[0])>
			<span>Enable Rotation</span>
		</a></li>
		<li><a href = javascript:void(0) onclick = $("#geoJumpDialog").modal("show");$("#geoJumpLocationInput").focus()>Geo-Jump</a></li>
	</ul>
</li>
