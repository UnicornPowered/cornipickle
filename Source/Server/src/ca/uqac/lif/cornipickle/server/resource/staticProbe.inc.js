/********************************************************************
 Code auto-generated by Cornipickle. DO NOT EDIT!
 *********************************************************************/
var Cornipickle = Cornipickle || {};

Cornipickle.CornipickleProbe = function()
{
	/**
	 * An array of DOM attributes to include. Results in a smaller
	 * JSON by reporting only attributes that appear in the properties
	 * to evaluate.
	 */
	this.m_attributesToInclude = [];

	/**
	 * An array of tag names attributes to include. Results in a smaller
	 * JSON by reporting only tags that appear in the properties
	 * to evaluate.
	 */
	this.m_tagsToInclude = [];

	/**
	 * The name of the server of the form "name:port"
	 * e.g.: localhost:10101
	 */
	this.server_name = "";

	/**
	 * The probe's id
	 */
	this.probe_id = "";

	/**
	 * The probe's hash
	 */
	this.probe_hash = "";


	/**
	 * Sets the attributes to include in the JSON
	 * @param list An array of DOM attribute names
	 */
	this.setAttributesToInclude = function(list)
	{
		this.m_attributesToInclude = list;
	};

	/**
	 * getter for the attributes list
	 * @return the attributes list
	 */
	this.getAttributes = function()
	{
		return this.m_attributesToInclude;
	};

	/**
	 * Sets the tag names to include in the JSON
	 * @param list An array of tag names
	 */
	this.setTagNamesToInclude = function(list)
	{
		this.m_tagsToInclude = list;
	};

	/**
	 * getter for the tagnames list
	 * @return the tagnames list
	 */
	this.getTagNames = function()
	{
		return this.m_tagsToInclude;
	};

	/**
	 * Sets the server name
	 * @param name The name of the server
	 */
	this.setServerName = function(name)
	{
		this.server_name = name;
	};

	/**
	 * Sets the probe's id
	 */
	this.setProbeId = function(id)
	{
		this.probe_id = id;
	};

	/**
	 * Sets the probe's hash
	 */
	this.setProbeHash = function(hash)
	{
		this.probe_hash = hash;
	};

	/**
	 * Map from unique IDs to element references
	 */
	this.m_idMap = {};


	/**
	 * Serializes the contents of the page. This method recursively
	 * traverses the DOM and produces a JSON structure of some of
	 * its elements' properties
	 * @param n The DOM node to analyze
	 * @param path The path from the root of the DOM, expressed as
	 *   an array of tag names
	 * @param force_inclusion Set to true to force the inclusion of
	 *   n in the result, irrelevant of whether the node should be
	 *   included according to the normal criteria
	 */
	this.serializePageContents = function(n, path, event)
	{
		var current_path = path;
		current_path.push(n.tagName);
		var out = {};
		if (this.includeInResult(n, path) === Cornipickle.CornipickleProbe.INCLUDE || n === event.target)
		{
			if (n.tagName)
			{
				// Gives the element a unique ID, if it doesn't have one
				this.registerNewElement(n);
				var pos = Cornipickle.cumulativeOffset(n);
				out.tagname = n.tagName.toLowerCase();
				out.cornipickleid = n.cornipickleid;
				out = this.addIfDefined(out, "value", Cornipickle.CornipickleProbe.setValue(n));
				out = this.addIfDefined(out, "class", n.className);
				out = this.addIfDefined(out, "id", n.id);
				out = this.addIfDefined(out, "height", n.clientHeight);
				out = this.addIfDefined(out, "width", n.clientWidth);
				out = this.addIfDefined(out, "background", Cornipickle.CornipickleProbe.formatBackgroundString(n));
				out = this.addIfDefined(out, "color", Cornipickle.CornipickleProbe.getStyle(n, "color"));
				out = this.addIfDefined(out, "border", Cornipickle.CornipickleProbe.formatBorderString(n));
				out = this.addIfDefined(out, "top", pos.top);
				out = this.addIfDefined(out, "left", pos.left);
				out = this.addIfDefined(out, "bottom", Cornipickle.add_dimensions([pos.top, n.clientHeight]));
				out = this.addIfDefined(out, "right", Cornipickle.add_dimensions([pos.left,  n.clientWidth]));
				out = this.addIfDefined(out, "display", Cornipickle.CornipickleProbe.getStyle(n, "display"));
				out = this.addIfDefined(out, "size", n.size);
				out = this.addIfDefined(out, "checked", Cornipickle.CornipickleProbe.formatBool(n.checked));
				out = this.addIfDefined(out, "disabled", Cornipickle.CornipickleProbe.formatBool(n.disabled));
				out = this.addIfDefined(out, "accesskey", n.accessKey);
				out = this.addIfDefined(out, "min", n.min);
				if (n === event.target)
				{
					out.event = this.serializeEvent(event);
				}
				if (n.tagName === "INPUT")
				{
					// Form fields require special treatment
					if (n.type === "text") // Textbox
					{
						// We create a single text child with the box's contents
						out.children = [{
							"tagname" : "CDATA",
							"text" : n.value
						}];
						return out; // No need to recurse
					}
				}
				else if (n.tagName === "BUTTON")
				{
					// We create a single text child with the button's text
					out.children = [{
						"tagname" : "CDATA",
						"text" : n.innerHTML
					}];
					return out; // No need to recurse
				}
			}
			else
			{
				out.tagname = "CDATA";
				out.text = n.nodeValue;
				return out;
			}
		}
		if (this.includeInResult(n, path) !== Cornipickle.CornipickleProbe.DONT_INCLUDE_RECURSIVE)
		{
			var in_children = [];
			for (var i = 0; i < n.childNodes.length; i++)
			{
				var child = n.childNodes[i];
				var new_child = this.serializePageContents(child, current_path, event);
				if (!Cornipickle.is_empty(new_child))
				{
					in_children.push(new_child);
				}
			}
			if (in_children.length > 0)
			{
				out.children = in_children;
			}
		}
		return out;
	};

	this.addIfDefined = function(out, property_name, property)
	{
		// First check if this attribute must be included in the report
		if (Cornipickle.array_contains(this.m_attributesToInclude, property_name))
		{
			// Yes, now check if it is defined
			if (property !== undefined && property !== "")
			{
				out[property_name] = property;
			}
		}
		return out;
	};

	this.includeInResult = function(n, path)
	{
		var classlist = Cornipickle.get_class_list(n);
		if (classlist)
		{
			if (classlist.contains("nocornipickle")) // This is the probe itself
			{
				return Cornipickle.CornipickleProbe.DONT_INCLUDE_RECURSIVE;
			}
		}
		if (!n.tagName) // This is a text node
		{
			if (n.nodeValue.trim() === "")
			{
				// Don't include nodes containing only whitespace
				return Cornipickle.CornipickleProbe.DONT_INCLUDE_RECURSIVE;
			}
			else
			{
				return Cornipickle.CornipickleProbe.INCLUDE;
			}
		}
		for (var i = 0; i < this.m_tagsToInclude.length; i++)
		{
			var part = this.m_tagsToInclude[i];
			if (this.matchesSelector(part, n))
			{
				return Cornipickle.CornipickleProbe.INCLUDE;
			}
		}
		return Cornipickle.CornipickleProbe.DONT_INCLUDE;
	};

	/**
	 * Checks whether an element's tag, class and ID name match the
	 * CSS selector element.
	 */
	this.matchesSelector = function(selector, n)
	{
		var pat = new RegExp("([\\w\\d]+){0,1}(\\.([\\w\\d]+)){0,1}(#([\\w\\d]+)){0,1}");
		var mat = pat.exec(selector);
		var tag_name = mat[1];
		var class_name = mat[3];
		var id_name = mat[5];
		if (tag_name !== undefined)
		{
			if (!n.tagName || n.tagName.toLowerCase() !== tag_name.toLowerCase())
			{
				return false;
			}
		}
		if (class_name !== undefined)
		{
			if (!n.className)
			{
				return false;
			}
			var class_parts = Cornipickle.get_class_list(n).split(" "); //n.className.split(" ");
			if (!Cornipickle.array_contains(class_parts, class_name))
			{
				return false;
			}
		}
		if (id_name !== undefined)
		{
			if (!n.id || n.id !== id_name)
			{
				return false;
			}
		}
		return true;
	};

	this.serializeWindow = function(page_contents)
	{
		return {
			"tagname" : "window",
			"URL" : window.location.host + window.location.pathname,
			"aspect-ratio" : window.document.documentElement.clientWidth / window.document.documentElement.clientHeight,
			"orientation" : Cornipickle.get_orientation(),
			"width" : window.document.documentElement.clientWidth,
			"height" : window.document.documentElement.clientHeight,
			"device-width" : window.screen.availWidth,
			"device-height" : window.screen.availHeight,
			"device-aspect-ratio" : window.screen.availWidth / window.screen.availHeight,
			"mediaqueries" : cp_probe.serializeMediaQueries(),
			"children" : [ page_contents ]
		};
	};
	
	this.serializeMediaQueries = function()
	{
		var out = {};
		for (var i = 0; i < this.m_attributesToInclude.length; i++)
		{
			var att = this.m_attributesToInclude[i];
			var indexOfUnderscore = att.indexOf("_");
			var query = "";
			var id = -1;
			if(indexOfUnderscore != -1)
			{
				id = att.substring(0,indexOfUnderscore);
				query = att.substring(indexOfUnderscore + 1, att.length);
				if(window.matchMedia(query).matches)
				{
					out[id] = "true";
				}
				else
				{
					out[id] = "false";
				}
			}
		}
		return out;
	}

	this.serializeEvent = function(event)
	{
		//var out = {};
		//out.type = event.type;
		//return out;
		// At the moment, we only return a string with the event's name
		// Eventually, this will be replaced with a more complex structure

		// Determine if it is left or right click
		if (event.type === "mouseup")
		{
			//event.which -> Firefox, Safari, Chrome, Opera
			//event.button -> IE, Opera
			if (event.which == 3 || event.button == 2)
			{
				return "right click";
			}
			else if (event.which == 1 || event.button === 0)
			{
				return "click";
			}
		}
		return event.type;
	};

	this.handleEvent = function(event)
	{
		console.log("Click");
		Cornipickle.CornipickleProbe.updateTransmitIcon(true);
		// Un-highlight previously highlighted elements
		Cornipickle.CornipickleProbe.unHighlightElements();
		// Serialize page contents
		var json = cp_probe.serializePageContents(document.body, [], event);
		json = cp_probe.serializeWindow(json);
		var url = "http://" + this.server_name + "/image/";
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", url, true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.onreadystatechange = function () {
		    var DONE = this.DONE || 4;
		    if (this.readyState === DONE){
		    	Cornipickle.CornipickleProbe.handleResponse(this.responseText);
		    }
		};
		toSend = "contents=" + encodeURIComponent(JSON.stringify(json, Cornipickle.escape_json_string));

		var cpProbeProbeHash = sessionStorage.getItem(cp_probe.probe_hash);

		if( cpProbeProbeHash != null )
		{
			toSend += "&interpreter=" + encodeURIComponent(sessionStorage.getItem(cp_probe.probe_hash));
		}

		if(this.probe_id != "")
		{
			toSend += "&id=" + this.probe_id;
		}

		if(this.probe_hash != "")
		{
			toSend += "&hash=" + this.probe_hash;
		}
		xhttp.send(toSend);

	};

	this.registerNewElement = function(n)
	{
		if (n.cornipickleid !== undefined)
		{
			return;
		}
		n.cornipickleid = Cornipickle.CornipickleProbe.elementCounter;
		this.m_idMap[Cornipickle.CornipickleProbe.elementCounter] = {
			"element" : n,
			"style" : {}
		};
		Cornipickle.CornipickleProbe.elementCounter++;
	};
};

Cornipickle.CornipickleProbe.INCLUDE = 0;
Cornipickle.CornipickleProbe.DONT_INCLUDE = 1;
Cornipickle.CornipickleProbe.DONT_INCLUDE_RECURSIVE = 2;

/**
 * Produces a browser-dependent XmlHttpRequest object
 */
Cornipickle.CornipickleProbe.getXhr = function()
{
	var XHRobject = null;
	if (window.XMLHttpRequest)
	{
		//Native XMLHttpRequest
		XHRobject = new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{
		//ActiveX XMLHttpRequest (for some Internet Explorer versions)
		XHRobject = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return XHRobject;
};

Cornipickle.CornipickleProbe.updateTransmitIcon = function(active)
{
	var icon = document.getElementById("bp_witness_transmit");
	if (typeof icon === 'undefined' || icon === null)
	{
		return;
	}
	if (active === true)
	{
		icon.style.opacity = 1;
	}
	else
	{
		icon.style.opacity = 0.3;
	}
};

/* Obtained from http://stackoverflow.com/a/25078870 */
Cornipickle.CornipickleProbe.getStyle = function(elem, prop)
{
	var res = null;
	if (elem.currentStyle)
	{
		res = elem.currentStyle[prop];
	}
	else if (window.getComputedStyle)
	{
		if (window.getComputedStyle.getPropertyValue)
		{
			res = window.getComputedStyle(elem, null).getPropertyValue(prop);
		}
		else
		{
			res = window.getComputedStyle(elem)[prop];
		}
	}
	return res;
};

Cornipickle.CornipickleProbe.handleResponse = function(response)
{

	console.log("handle Response");
	// eval is evil, but we can't assume JSON.parse is available
	eval("var response = " + decodeURI(response)); // jshint ignore:line

	sessionStorage.setItem(cp_probe.probe_hash,response.interpreter);
	document.getElementById("cp-image").src = response["image"];
	if (response["global-verdict"] === "TRUE")
	{
		document.getElementById("bp_witness").style.backgroundColor = "green";
	}
	else if (response["global-verdict"] === "FALSE")
	{
		document.getElementById("bp_witness").style.backgroundColor = "red";
	}
	else
	{
		document.getElementById("bp_witness").style.backgroundColor = "white";
	}
	// Highlight elements, if any
	for (var i = 0; i < response["highlight-ids"].length; i++)
	{
		var set_of_tuples = response["highlight-ids"][i].ids;
		for (var j = 0; j < set_of_tuples.length; j++)
		{
			var tuple = set_of_tuples[j];
			for (var k = 0; k < tuple.length; k++)
			{
				var el_id = tuple[k];
				Cornipickle.CornipickleProbe.highlightElement(el_id, i);
			}
		}
		// Show explanation
		var in_html = document.getElementById("bp_witness_explanation").innerHTML;
		in_html += "<div class=\"cp-highlight-text\" id=\"highlight-zone-id-"+ i + "\" style=\"display:none;";
		in_html += "position:absolute;cursor:help;width:186px;height:96px;padding:17px;background:url('http://" + this.server_name + "/speech-bubble.png') no-repeat;color:black;";
		in_html += "bottom:10px;right:10px;";
		in_html += "\">" + response["highlight-ids"][i].caption + "</div>";
		document.getElementById("bp_witness_explanation").innerHTML = in_html;
	}
	Cornipickle.CornipickleProbe.updateTransmitIcon(false);
};

Cornipickle.CornipickleProbe.unHighlightElements = function()
{
	document.getElementById("cp-highlight").innerHTML = "";
};

/**
 * Highlights an element that violates a property
 */
Cornipickle.CornipickleProbe.highlightElement = function(id, tuple_id)
{
	console.log("Highlight");
	var el = cp_probe.m_idMap[id].element;
	var offset = Cornipickle.cumulativeOffset(el);
	var in_html = document.getElementById("cp-highlight").innerHTML;
	in_html += "<div class=\"cp-highlight-zone\" ";
	in_html += "onmouseover=\"Cornipickle.CornipickleProbe.toggleExplanationBox(" + tuple_id + ",true)\" ";
	in_html += "onmouseout=\"Cornipickle.CornipickleProbe.toggleExplanationBox(" + tuple_id + ",false)\" ";
	in_html += "style=\"pointer-events:none;opacity:0.1;border-radius:3px;cursor:help;position:absolute;border:4px solid red;";
	in_html += "left:" + Cornipickle.add_dimensions([offset.left, "-4px"]) + "px;top:" + Cornipickle.add_dimensions([offset.top, "-4px"]) + "px;";
	in_html += "width:" + Cornipickle.add_dimensions([el.offsetWidth, "4px"]) + "px;height:" + Cornipickle.add_dimensions([el.offsetHeight, "4px"]) + "px\">";
	in_html += "</div>";
	document.getElementById("cp-highlight").innerHTML = in_html;
};

/**
 * Creates a style string for an element's border.
 * Caveat emptor: only reads the properties for the top border!
 */
Cornipickle.CornipickleProbe.formatBorderString = function(elem)
{
	var s_top_style = Cornipickle.CornipickleProbe.getStyle(elem, "border-top-style");
	var s_top_colour = Cornipickle.CornipickleProbe.getStyle(elem, "border-top-color");
	var s_top_width = Cornipickle.CornipickleProbe.getStyle(elem, "border-top-width");
	var out = s_top_style + " " + s_top_colour + " " + s_top_width;
	return out.trim();
};

Cornipickle.CornipickleProbe.formatBackgroundString = function(elem)
{
	var s_background_color = Cornipickle.CornipickleProbe.getStyle(elem, "background-color");
	return s_background_color.trim();
};

Cornipickle.CornipickleProbe.formatBool = function(property)
{
	if (property) {return "true";}
	else {return "false";}
};

Cornipickle.CornipickleProbe.setValue = function(elem)
{
	//value property is only defined for input elements
	if (elem.tagName === "INPUT" || elem.tagName === "BUTTON")
	{
		if (elem.type === "range" || elem.type == "number")
		{
			return elem.valueAsNumber;
		}
		else
		{
			return elem.value;
		}
	}
};

/**
 * The delay in ms before the probe refreshes its status,
 * after a JSON has been sent to the server. If set too low, the witness
 * processes the cookie before the server has had the time to update it
 */
Cornipickle.CornipickleProbe.refreshDelay = 500;

/**
 * A global counter to give a unique ID to every element
 * encountered and reported back to the server
 */
Cornipickle.CornipickleProbe.elementCounter = 0;

/**
 * Whether highlighted elements are let mouse events through
 */
Cornipickle.CornipickleProbe.clickThrough = false;

Cornipickle.CornipickleProbe.toggleClickThrough = function()
{
	Cornipickle.CornipickleProbe.clickThrough = !Cornipickle.CornipickleProbe.clickThrough;
	Cornipickle.CornipickleProbe.setClickThrough(Cornipickle.CornipickleProbe.clickThrough);
	return false; // Prevent bubbling of click event
};

Cornipickle.CornipickleProbe.setClickThrough = function(b)
{
	var list = document.getElementsByClassName("cp-highlight-zone");
	for (var i = 0; i < list.length; i++)
	{
		var e = list[i];
		if (b === true)
		{
			e.style.pointerEvents = "none";
			e.style.opacity = 0.1;
		}
		else
		{
			e.style.pointerEvents = "auto";
			e.style.opacity = 1;
		}
	}
};

/**
 * Retrieves the value of a cookie in a cookie string.
 * Found from <a href="http://stackoverflow.com/a/22852843">Stack Overflow</a>
 * @param c_name The cookie's name
 * @return The cookie's value
 */
Cornipickle.CornipickleProbe.getCookie = function(c_name)
{
	var c_value = " " + document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	{
		c_value = null;
	}
	else
	{
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1)
		{
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
};

Cornipickle.CornipickleProbe.toggleExplanationBox = function(id, b)
{
	var e = document.getElementById("highlight-zone-id-" + id);
	if (b === true)
	{
		e.style.display = "block";
	}
	else
	{
		e.style.display = "none";
	}
};

/**
 * Gets the class list of the element using className
 * and classList DOM attributes combined, to make sure
 * we get the class names in every case
 * @param  element  The DOM element to retrieve its classes
 * @return A list of class names separated by spaces
 */
Cornipickle.get_class_list = function(element)
{
	var out = "";
	if (element.className)
	{
		out += element.className; //className already is a space separated class name string
	}
	if (element.classList) //supported by IE9+ only; classList is an array of class names
	{
		for(var i = 0; i < element.classList.length; i++)
		{
			if(!out.contains(element.classList[i]))
			{
				out += " ";
				out += element.classList[i];
			}
		}
	}
	return out;
};

/**
 * Computes the absolute coordinates of an element
 * with respect to the document
 * @param element The element to get the position
 * @return A JSON structure giving the cumulative top and left
 *   properties
 */
Cornipickle.cumulativeOffset = function(element)
{
	var top = 0, left = 0;
	do
	{
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
};

/**
 * Checks if an array contains an element
 * @param a The array
 * @param obj The element
 * @return True or false
 */
Cornipickle.array_contains = function(a, obj)
{
	for (var i = 0; i < a.length; i++)
	{
		if (a[i] === obj)
		{
			return true;
		}
	}
	return false;
};

/**
 * Checks if an object is empty
 */
Cornipickle.is_empty = function(object)
{
	for (var i in object)
	{
		return false;
	}
	return true;
};

Cornipickle.escape_json_string = function(key, value)
{
	if (typeof value === "string" || value instanceof String)
	{
		// Escape some characters left of by encodeURI
		value = value.replace(/&/g, "%26");
		value = value.replace(/=/g, "%3D");
	}
	return value;
};

Cornipickle.add_dimensions = function(dimensions)
{
	var sum = 0;
	for (var i = 0; i < dimensions.length; i++)
	{
		var d = dimensions[i];
		sum += Cornipickle.remove_units(d);
	}
	return sum;
};

Cornipickle.remove_units = function(s)
{
	if (typeof s == "string" || s instanceof String)
	{
		s = s.replace("px", "");
	}
	return Number(s);

};

// http://stackoverflow.com/a/9824480
Cornipickle.get_orientation = function()
{
	switch(window.orientation) 
    {  
      case -90:
      case 90:
        return "landscape";
      default:
        return "portrait";
    }
}

/*
 * Replaces the window.onload() function
 * it allows us not to change the webpage's html code
 * by not removing the onload blockers
 */
function loadFunction() {
    //IE fix for String.contains which is used throughout the file
    //found here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    if ( !String.prototype.contains ) {
        String.prototype.contains = function() {
            return String.prototype.indexOf.apply( this, arguments ) !== -1;
        };
    }

    cp_probe = new Cornipickle.CornipickleProbe();
    var cp_witness_div = document.createElement("div");
    cp_witness_div.id = "cp-witness";
    document.body.appendChild(cp_witness_div);
    //document.getElementById("cp-witness").onclick = cp_probe.handleEvent;
    document.body.onmouseup = function(event) {
        var target_id = event.target.id;
        if (target_id.match(/bp_witness/) !== null) {
            // If we clicked on the probe status panel, do nothing
            return;
        }
        // Wait .25 sec, so that the browser has time to process the click
        window.setTimeout(function() {
            cp_probe.handleEvent(event);
        }, 0.25);
    };

	// Call the probe a first time at startup
	//window.setTimeout(cp_probe.handleEvent(event), 0.25);
}

var addFunctionOnWindowLoad = function(callback){
      if(window.addEventListener) {
          window.addEventListener('load',callback,false);
      }
      else {
          window.attachEvent('onload',callback);
      }
};

function getByteCount( s )
{
  var count = 0, stringLength = s.length, i;
  s = String( s || "" );
  for( i = 0 ; i < stringLength ; i++ )
  {
    var partCount = encodeURI( s[i] ).split("%").length;
    count += partCount==1?1:partCount-1;
  }
  return count;
}

addFunctionOnWindowLoad(loadFunction);