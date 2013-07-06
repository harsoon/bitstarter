#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com/onetwothree";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var checkUrl = function(str) {
  var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  if(!pattern.test(str)) {
    console.log("Please enter a valid URL.");
    process.exit(1);
  } else {
    return str;
  }
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlUrl = function(htmlurl){
    return cheerio.load(htmlurl);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, url) {
    var checks = loadChecks(checksfile).sort();    
    
    if (url==URL_DEFAULT)
    {
	$ = cheerioHtmlFile(htmlfile);
	var out = {};
	for(var ii in checks) {
            var present = $(checks[ii]).length > 0;
            out[checks[ii]] = present;
	}
	return out;
    }
    else
    {
	rest.get(url).on('complete', function(result) {
	    if (result instanceof Error) {
		return result; 
	    } else {
		$ = cheerioHtmlUrl(result);
		var out = {};
		for(var ii in checks) {
		    var present = $(checks[ii]).length > 0;
		    out[checks[ii]] = present;
		}
		var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);
		return result;
	    }
	});
    }
    
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
.option('-u, --url <url_html>', 'URL of html file', clone(checkUrl), URL_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks, program.url);
    var outJson = JSON.stringify(checkJson, null, 4);
    if (program.url == URL_DEFAULT)
	console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
