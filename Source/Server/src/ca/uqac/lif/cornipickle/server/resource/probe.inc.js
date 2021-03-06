/********************************************************************
  Code auto-generated by Cornipickle. DO NOT EDIT!
 *********************************************************************/
/**
 * Allows to dynamically load a script by adding
 * a script tag to the head of the document with
 * the script found at the url, and then call
 * a javascript function that uses this script
 * @param url  The url of the script to load dynamically
 * @param callback  The javascript function to call after
 *                  the script is loaded
 */
function loadScript(url, callback)
{
	// Adding the script tag to the head as suggested before
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;

	// Then bind the event to the callback function.
	// There are several events for cross browser compatibility.
	script.onreadystatechange = callback;
	script.onload = callback;

	// Fire the loading
	head.appendChild(script);
}

/**
 * Probe code that is set dynamically by the Cornipickle server.
 * It executes only after staticProbe.inc.js is loaded, but not
 * necessarily after it is executed completely.
 */
var dynamicProbe = function() 
{
	//There is a Timeout in the window.onload function too. This gives time
	//to the window.onload function to execute.
	window.setTimeout(function() {
		cp_probe.setAttributesToInclude([/*%%ATTRIBUTE_LIST%%*/]);
		cp_probe.setTagNamesToInclude([/*%%TAG_LIST%%*/]);
		cp_probe.setServerName("%%SERVER_NAME%%");
		cp_probe.setProbeId( "1" );
		cp_probe.setProbeHash( "interpreter" );
		document.getElementById("cp-witness").innerHTML = "%%WITNESS_CODE%%";

		if(document.getElementsByClassName("cornipickle-code"))
		{
			var codestring = "";
			var codes = document.getElementsByClassName("cornipickle-code");
			for(var i = 0; i < codes.length; i++)
			{
				codestring = codestring + codes[i].textContent.replace(/\u00A0/g, ' ');
			}
			cxh = new XMLHttpRequest();
			cxh.open("POST", "http://%SERVER_NAME%%/add");
			//cxh.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			cxh.setRequestHeader("Content-type", "text/plain");
			cxh.onreadystatechange = function () {
				var DONE = this.DONE || 4;
				if (this.readyState === DONE) {
					//$("#to-cornipickle").prop('disabled', true);
					// eval is evil, but we can't assume JSON.parse is available
					eval("var result = " + decodeURI(this.responseText)); //NOSONAR
					cp_probe.setAttributesToInclude(result.attributes);
					cp_probe.setTagNamesToInclude(result.tagnames);
					sessionStorage.interpreter = result.interpreter;
					console.log(result.tagnames);
					cp_probe.preEvaluate();
				}
			};
			cxh.send(encodeURIComponent(codestring));
		}
		else
		{
			console.log("HELLO");
			cp_probe.preEvaluate();
		}
	}, 500);
};

//Loads the part of the probe file that doesn't change 
//according to the Cornipickle code given to the server
//It can be loaded from any url
loadScript("http://%%SERVER_NAME%%/staticProbe.inc.js", dynamicProbe);