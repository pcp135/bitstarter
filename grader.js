#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT= "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist.  Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = htmlfile;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length>0;
	out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);    
    console.log(outJson);
};

var checkUrl = function(urlpath, checksfile) {
    rest.get(urlpath).on('complete', function(result) {
	checkHtmlFile(cheerio.load(result),checksfile);
})};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main==module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <html_file_url>', 'Url to check')
	.parse(process.argv);
    if(program.url) {
	checkUrl(program.url, program.checks);
    }
    else {
	checkHtmlFile(cheerioHtmlFile(program.file), program.checks);    
    } 
}
else {    
    exports.checkHtmlFile = checkHtmlFile;
}
    
