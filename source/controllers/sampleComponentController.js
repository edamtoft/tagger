define([
	"system/text"
], function(text) {
	
	"use strict";
	
	/*
	Markup sample:
	<sample-component name="World"></sample-component>
	
	Will yield:
	<sample-component name="World">
		<h1>Hello World</h1>
	</sample-component>
	*/
	
	function SampleComponentController(element, config) {
		element.innerHTML = text.from("<h1>Hello {name}</h1>", config);
	}
	
	return SampleComponentController;
});