if (!("contains" in String.prototype)) {
	String.prototype.contains = function(string) { return this.search(string) > -1; }
}
