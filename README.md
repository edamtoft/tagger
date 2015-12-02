# Tagger

Tagger is a front-end javascript runtime based around the 
idea that you should be able to easily extend and modularize HTML with web components
without having to worry about loading dependencies. Tagger leverages
the power of require.js to automatically handle dependency resolution throught
your project, so all you have to do is create your components. Tagger does 
not aim to be a all-encompassing framework. Though it provides a range of system 
libraries to make many common frontend tasks easier, it makes few
assumptions about how to use it or what it can work with. Feel free to mix
this in with your favorite other libraries and tools.

## What it does

Tagger automatically resolves everything you need based on what's on the 
current page. No matter how many components you have on the page, you
only need to include tagger.js in a script tag.

Let's say you want to create a custom component says hello to someone based on
a property.

Start off by naming your custom component. Per W3 specifications,
custom tags must be two or more words separated by dashes. Let's call this one
sample-component

In your markup, create the following:

```
<sample-component name="World"></sample-component>
```

In the controllers folder of the runtime, create a file called sampleComponentController.js:

```
define([
	"system/text"
], function(text) {
	
	"use strict";
	
	function SampleComponentController(element, config) {
		element.innerHTML = text.from("<h1>Hello {name}</h1>", config);
	}
	
	return SampleComponentController;
});
```

text.from is a system runtime helper that interpolates objects into strings. More on these libraries
later.

Open a terminal in the project root and run "grunt" to compile the project (you'll need 
node.js and grunt. See Installation), open the HTML page, and you component should 
automatically boot up. You should see the following:

```
<sample-component name="World">
	<h1>Hello World</h1>
</sample-component>
```

For a more practical (though more complex) example, see the google map component in the
controllers folder.

## Installation

To start, fork this repo and clone it. You will need to install node.js and grunt.

to install node, goto https://nodejs.org/en/ and download and run the installer for your platform.

next, open a terminal window and run the following to install grunt (the task runner/compiler for our modules):
```
npm install grunt-cli -g
```
next, navigate in the terminal to the root of this project and run:
```
npm install --dev
```
to install the build dependencies.

make your controllers in the source folder, and run "grunt" from the terminal to compile. By default, it runs jshint to
detect javascript errors.

If you use Visual Studio Code, it is already set to build automatically with ctrl+shift+b.

### Don't want to install anything?

That's fine too. You just won't get automatic compression / optimization checks of new modules/controllers.

Download just the "bin" folder (the whole folder, not just tagger.js), and start writing controllers in the controllers folder. Feel free to delete the samples.


## Built in MVC Functionality

This is still under construction, but here's how it works:

Markup:
```
<sample-mvc-component>
	<h4 model="test"></h4>
	<input type="text" model="test" />
	<button event="clickHappened">Alert Me</button>
</sample-mvc-component>
```

Controller:
```
define([], function() {
	
	function SampleMvcController(element, config) {
		
		this.clickHappened = function() {
			alert(this.model.test);
		};
	}
	 	
	return SamplMvcController;
});
```
The H4 tag and the input will be automatically bound in real time. When you click the button, 
it will call the clickHappened function on the controller, no additional wire-up needed.

If you include a this.modelChanged function in the controller, it will be called when any part of the
model is changed.

This aspect is still experimental and will remain rudamentary for a while. If you need additional
functionality, combining this with another MVC library. 

## Config Options

If you need to pass in more config options than will easily fit as attributes, you can add a script tag
of type="application/JSON" with role="config" inside the component with config as JSON.

multi-word config keys are collapsed to camelCase when resolving keys from the component attributes.

```
<google-map>
	<script type="application/JSON" role="config">
	{
		"address":"some long address",
		"key":"loiasdf9yh3r893yh5r43982492834",
		"info":"<h4>Info Window Title</h4><p>Marker Description</p>"	
	}
	</script>
</google-map>

```

## System Libraries
Tagger comes pre-installed with a number of system libraries which provide an easy-to-use and
reusable wrappers around many common operations. These can be accessed through require-js's 
syntax.

When defining dependencies for a controller (or other module):
```
define([
	"system/text", 
	"system/http"
], function(text, http) {
	
	// text and http are available here.
	
});

```

Or on it's own:
```
require([
	"system/text", 
	"system/http"
], function(text, http) {
	
	// text and http are available here.
});
```

### Text

Interpolates and manipulates text similarly to string.Format in c#

```
	var yourName = "you";
	var myName = "me";
	
	text.from("hello {0}, my name is {1}", yourName, myName);	
```

you can also enter it by property name in an object

```
	var props = {
		yourName: "you",
		myName: "me"	
	};
	
	text.from("hello {yourName}, my name is {myName}", props);
```

you can also parse a querystring to an object or serialize one from an object:

```
	var query = {
		page: 1,
		type: "sample type" 	
	};
	
	var serialized = text.toQuery(query); //page=1&type=sample%20type
	
	var deserialized = text.fromQuery(serialized);
	
	desirialized.type // returns "sample type";
```
### http

Http aims to make it easier to handle making calls to REST api endpoints. See the following example:

```
	var params = {
		topic: "sometopic",
		subtopic: "somesubtopic"	
	};
	
	http.get("/api/{topic}/{subtopic}", params)
	.success(function(response){
		// response will be automatically parsed if it's a JSON response
	})
	.error(function() {
		alert("Call failed");	
	});
```
This will send a HTTP get to "/api/sometopic/somesubtopic" and will then call either the success or error
callback. Text in the params is automatically interpolated using the same engine as text.js

and for a post:

```
	var params = {
		topic: "sometopic",
		subtopic: "somesubtopic"	
	};
	
	http.post("/api/{topic}/{subtopic}", params)
	.send({
		data: "data",
		otherData: "otherData"	
	})
	.success(function(response){
		
		// response will be automatically parsed if it's a JSON response
		
	});

```
This will automatically send the supplied data encoded as JSON with the proper content-type headers to the
same endpoint as before.

For a more complex example:

 ```
	var params = {
		topic: "sometopic",
		subtopic: "somesubtopic"	
	};
	
	http.post("/api/{topic}/{subtopic}", params)
	.withBasicAuth("username","password")
	.withQuery({
		extraData: "extra data"	
	})
	.send({
		data: "data",
		otherData: "otherData"	
	})
	.success(function(response){
		
		// response will be automatically parsed if it's a JSON response
		
	});
```

This will send a request to "/api/sometopic/somesubtopic/?extraData=extra&20data" with an encoded HTTP basic auth
header with the supplied user name and password. To use a different type of auth, call .withAuth(type, credentials).
You can also add custom headers by calling .withHeader(name, value) one or more times.

### enumerable

Basically a javascript copy of c# linq.

Examples:

```
	var elements = document.querySelectorAll("*");
	
	enumerable.of(elements)
		.where(function(e) { return e.tagName == "IMG" || e.style.backgroundImage > ""; })
		.select(function(e) { return e.style.height; })
		.distinct()
		.toArray();
```
This would return a simple array of image-like elements's distinct heights. To find the size of the one:

```
	enumerable.of(elements)
		.where(function(e) { return e.tagName == "IMG" || e.style.backgroundImage > ""; })
		.max(function(e) { return e.style.height; });
```

And to iterate over a list:
```
	enumerable.of(collection).each(function(item) { 
		// do stuff
	});
```
### logManager

provides an easy framework for logging messages in modules, using the text.js engine.

```
	var log = logManager.getLogger("Logger Name");
	
	log.info("Something happend. Details: {0}", details);
	
	log.error("Something bad happend. Details: {0}", details);
```

You can call logManager.get() to get the full text of all logs for the page with detailed timestamps.

You can set the logger display level (default to INFO) with the following:
```
	logManager.logLevel = logManager.levels.DEBUG
	
	// DEBUG, INFO, WARN, ERROR
```

### guid

Returns v4 guids. Not cryptographically secure, but plenty random for everyday use.
```
	guid.create() // => 621398fa-5b37-4164-98ff-6c845aa6c61c
	
	guid.createMany(2) // => array of 2 guids 
```

### promise

simple promise library.

 Sample:

```
	var myPromise = promise.that(function(resolve, reject) {
		do.some.async.work
			.success(function(data) {
				resolve(data);
			})
			.error(function(err) {
				reject(err);
			});
	});
	
	myPromise.then(function(err, data) {
		if (err) {
			// handle error	
		}
		
		// use data
	});
```