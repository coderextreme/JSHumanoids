"use strict";

// Convert X3D JSON to various formats

process.argv.shift();
process.argv.shift();

var convertJSON = require("./convertJSON.js");
console.log(convertJSON.convertJSON);

convertJSON.convertJSON([
	{ 
	serializer : './JavaScriptSerializer.js',
	folder : "../graaljs/net/coderextreme/",
	extension : ".js",
	codeOutput : "../"
	}
	]);
process.exit(0);
