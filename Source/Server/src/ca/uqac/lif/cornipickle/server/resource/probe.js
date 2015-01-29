/********************************************************************
  Code auto-generated by Cornipickle. DO NOT EDIT!
*********************************************************************/

/* This code found on http://stackoverflow.com/questions/1480133/how-can-i-get-an-objects-absolute-position-on-the-page-in-javascript
   ----------------- */
   
var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

/* ----------------- */

var CornipickleProbe = function()
{
  this.handleXhrResponse = function()
  {
    // Update notification icon to indicate that the transmission is over
    CornipickleProbe.updateTransmitIcon(false);
  };
  
  this.serializePageContents = function(n, path, indent)
  {
    var n_indent = indent + " ";
    var current_path = path;
    current_path.push(n.tagName);
    var output_something = false;
    var out = "";
    out += indent + "{\n";
    if (this.includeInResult(n, path) === CornipickleProbe.INCLUDE)
    {

      if (n.tagName)
      {
        output_something = true;
        out += indent + " \"tagname\" : \"" + n.tagName.toLowerCase() + "\"\n";
        out += this.outputStringIfDefined("class", n.className, n_indent);
        out += this.outputStringIfDefined("id", n.id, n_indent);
        out += this.outputNumberIfDefined("height", n.clientHeight, n_indent);
        out += this.outputNumberIfDefined("width", n.clientWidth, n_indent);
        out += this.outputStringIfDefined("border", CornipickleProbe.formatBorderString(n), n_indent);
        var pos = cumulativeOffset(n);
        out += this.outputNumberIfDefined("top", pos.top, n_indent);
        out += this.outputNumberIfDefined("left", pos.left, n_indent);
        out += this.outputNumberIfDefined("bottom", pos.top + n.clientHeight, n_indent);
        out += this.outputNumberIfDefined("right", pos.left + n.clientWidth, n_indent);
      }
      else
      {
        output_something = true;
        out += indent + " \"tagname\" : \"#CDATA\",\n";
        out += indent + " \"text\" : \"" + n.nodeValue + "\"";
      }
    }
    if (this.includeInResult(n, path) !== CornipickleProbe.DONT_INCLUDE_RECURSIVE)
    {
      var in_children = "";
      var first = true;
      for (var i = 0; i < n.childNodes.length; i++)
      {
        var child = n.childNodes[i];
        new_child = this.serializePageContents(child, current_path, n_indent + " ");
        if (new_child.trim() !== "")
        {
          if (first)
          {
            first = false;
          }
          else
          {
            in_children += ",\n";
          }
          in_children += new_child;
        }
      }
      if (in_children.trim() === "")
      {
        //out += indent + "  \"children\" : [ ]\n";
      }
      else
      {
        output_something = true;
        out += ",\n" + indent + " \"children\" : [\n" + in_children + indent + "\n" + indent + " ]\n";
      }
    }
    out += indent + "}";
    if (!output_something)
    {
      return "";
    }
    return out;
  }
  
  this.ru = function(s)
  {
    // ru as in remove units
    if (typeof s == "string" || s instanceof String)
    {
      s = s.replace("px", "");
    }
    return Number(s);
  }
  
  this.outputStringIfDefined = function(property_name, property, indent)
  {
    if (property != undefined && property !== "")
    {
      return ",\n" + indent + "\"" + property_name + "\" : \"" + property + "\"";
    }
    return "";
  }
  
  this.outputNumberIfDefined = function(property_name, property, indent)
  {
    if (property != undefined && property !== "")
    {
      return ",\n" + indent + "\"" + property_name + "\" : " + property;
    }
    return "";
  }
  
  this.includeInResult = function(n, path)
  {
    if (n.id == "cp-witness") // This is the probe itself
    {
      return CornipickleProbe.DONT_INCLUDE_RECURSIVE;
    }
    if (n.id == "cornipickle-explanation") // Special page
    {
      return CornipickleProbe.DONT_INCLUDE_RECURSIVE;
    }
    if (!n.tagName) // This is a text node
    {
      if (n.nodeValue.trim() === "")
      {
        // Don't include nodes containing only whitespace
        return CornipickleProbe.DONT_INCLUDE_RECURSIVE;
      }
    }
    return CornipickleProbe.INCLUDE;
  }
  
  /*this.handleEvent = function()
  {
    console.log("Click");
    // Update notification icon to indicate that a transmission is in progress
    CornipickleProbe.updateTransmitIcon(true);
    // Serialize page contents
    var json = cp_probe.serializePageContents(document.body, [], "");
    // Build URL and send HTTP request
    var url = "http://<?php echo $server_name."/probe-phone-home.php?username=".$user_name."&probeid=".$probe_id; ?>";
    var xhr = CornipickleProbe.getXhr();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-length", json.length);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Connection", "close");
    xhr.addEventListener("load", this.handleXhrResponse, false);
    xhr.send(json);
  };*/
  
  this.serializeWindow = function(page_contents)
  {
    out = "{\n";
    out += " \"tagname\" : \"window\"";
    out += ",\n \"width\" : " + window.innerWidth;
    out += ",\n \"height\" : " + window.innerHeight;
    out += ",\n \"children\" : [\n";
    out += page_contents;
    out += " ]\n";
    out += "}";
    return out;
  };
  
  this.handleEvent = function()
  {
    console.log("Click");
    CornipickleProbe.updateTransmitIcon(true);
    // Serialize page contents
    var json = cp_probe.serializePageContents(document.body, [], "  ");
    json = cp_probe.serializeWindow(json);
    //var json_url = CornipickleProbe.encodeUrl(json);
    var json_url = encodeURIComponent(json);
    var url = "http://%%SERVER_NAME%%/image?rand=" + Math.round(Math.random() * 1000);
    document.getElementById("cp-image").src = url + "&contents=" + json_url;
  };
}

CornipickleProbe.INCLUDE = 0;
CornipickleProbe.DONT_INCLUDE = 1;
CornipickleProbe.DONT_INCLUDE_RECURSIVE = 2;

CornipickleProbe.getXhr = function()
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

CornipickleProbe.updateTransmitIcon = function(active)
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
CornipickleProbe.getStyle = function(elem, prop)
{
  if (elem.currentStyle)
  {
    var res = elem.currentStyle.margin;
  }
  else if (window.getComputedStyle)
  {
    if (window.getComputedStyle.getPropertyValue)
    {
      var res = window.getComputedStyle(elem, null).getPropertyValue(prop)
    }
    else
    {
      var res = window.getComputedStyle(elem)[prop]
    }
  }
  return res;
};

/**
 * Creates a style string for an element's border.
 * Caveat emptor: only reads the properties for the top border!
 */
CornipickleProbe.formatBorderString = function(elem)
{
  var s_top_style = CornipickleProbe.getStyle(elem, "border-top-style");
  var s_top_colour = CornipickleProbe.getStyle(elem, "border-top-color");
  var s_top_width = CornipickleProbe.getStyle(elem, "border-top-width");
  var out = s_top_style + " " + s_top_colour + " " + s_top_width;
  return out.trim();
};

window.onload = function()
{
  cp_probe = new CornipickleProbe();
  var cp_witness_div = document.createElement("div");
  cp_witness_div.id = "cp-witness";
  document.body.appendChild(cp_witness_div);
  document.getElementById("cp-witness").innerHTML = "%%WITNESS_CODE%%";
  document.getElementById("cp-witness").onclick = cp_probe.handleEvent;
}