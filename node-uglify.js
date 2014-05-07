var uglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var walk    = require('walk');
var fs = require('fs');
var path = require('path');

var minData = [
	{codeType: 'js', type : 'file', 	name : 'app/App.js',	 	minName : 'app/App.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/constants', 	minName : 'app/constants.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/controllers', 	minName : 'app/controllers.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/directives', 	minName : 'app/directives.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/factories', 	minName : 'app/factories.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/filters', 		minName : 'app/filters.min.js'},
	{codeType: 'js', type : 'folder', 	name : 'app/models', 		minName : 'app/models.min.js'},
		
	{codeType: 'css', type : 'file', 	name : 'css/standalone/general.css', 	minName : 'css/compressed/general.min.css'},
	{codeType: 'css', type : 'file', 	name : 'css/standalone/modals.css', 	minName : 'css/compressed/modals.min.css'},
	{codeType: 'css', type : 'file', 	name : 'css/standalone/sprite.css', 	minName : 'css/compressed/sprite.min.css'},
	{codeType: 'css', type : 'folder', 	name : 'css/site', 						minName : 'css/compressed/site.min.css'}
];

var options = {
        fromString   : false,
        warnings     : false,
        mangle       : true,
        compress     : true,
		drop_console: true,
		join_vars : true,
		dead_code : false,
		mangle_toplevel : false, //todo: test true,
		no_copyright : true
};
	
function minimize(files, data){
	if(data.codeType == 'js'){
		minimizeJs(files, data);
	}else{
		minimizeCss(files, data)
	}
}

function minimizeCss(files, data){
	var minCss = '';
	
	if(data.type == 'folder'){
		for(var i in files){
			minCss += getMinCss(files[i]);
		}
	}else{
		minCss += getMinCss(files);
	}
	
	writeFile(data.minName, minCss);
}

function getMinCss(file){
	if(file.indexOf('.css') == -1 || file.indexOf('.min.css') != -1) return '';
			
	var cssData = fs.readFileSync(file);
	return new CleanCSS().minify(cssData);	
}

function minimizeJs(files, data){
	var result = uglifyJS.minify(files, options);
	writeFile('./'+ data.minName, result.code);
}

function writeFile(file, data){
	fs.writeFile(file, data, function(err) {
		if(err) {
			console.log(file + ' -- FAIL.');
			console.log(err);
			console.log('----------------');
		} else {
			console.log(file + ' -- OK.');
		}		
		file = null;
		data = null;
	});
}

function processFiles(data){
	if(data.type == 'folder'){
		var walker  = walk.walk('./'+ data.name, { followLinks: false });
		var files   = [];
		
		walker.on('file', function(root, stat, next) {
		// Add this file to the list of files
		// Walker options
			files.push(root + '/' + stat.name);
			next();
		});

		walker.on('end', function() {
			minimize(files, data);
		});
		
	}else{
		minimize('./'+ data.name, data);
	}	
}

for(var i in minData){
	processFiles(minData[i]);
}
