//the integer-value for the flag representing the end of the main page browser load
//Wei: didn't figure out how to use below three constants, keep for now

const STATE_PAGE_LOADED = 786448; //STATE_STOP, STATE_IS_NETWORK, and STATE_IS_WINDOW flags
const NOTIFY_STATE_DOCUMENT =
  Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const STATE_STOP =
  Components.interfaces.nsIWebProgressListener.STATE_STOP;


// The Global CreateRequest Sidebar Object
var mysidebar;
var browser;
//var mainWindow;
var $mb = jQuery.noConflict();
var doc;

//for ajax;
var xmlHttp;
function S_xmlhttprequest() {
    if(window.ActiveXObject) {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    } else if(window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    }
}

function getSideBar() {
	if (!mysidebar) {
		mysidebar = top.document.getElementById('sidebar').contentWindow;
	}
	return mysidebar;
}

function getSideBarBrowser() {
	if (!browser) {
		browser=getSideBar().document.getElementById("createrequestBrowser");
	}
	return browser;
}

// Load a url in the content window.
function LoadSideBarContent(url) {
    getSideBarBrowser().webNavigation.loadURI(url,0, null, null, null);
}

function registerMyListener() {
   // alert("registerMyListener");
	// Wei: myListener is from ClickMap
        //alert("registerMyListener1: "+top.getBrowser());
	top.getBrowser().addProgressListener(myListener, NOTIFY_STATE_DOCUMENT);
	// Wei: clickReporter is used for Create Request
	top.getBrowser().addEventListener("click", clickReporter,false);
        top.getBrowser().addEventListener("mouseover", wartisan_mouseover,false);
       //alert("registerMyListener2: "+top.getBrowser());
}


function unregisterMyListener() {
	try{
            //alert("unregisterMyListener1: "+top.getBrowser());
		top.getBrowser().removeProgressListener(myListener);
		// Wei: have to clickReporter, otherwise even we close sidebar, this listener will keep working
		// Wei: this should work with "Recording" button later
                ////alert("unregisterMyListener");
		top.getBrowser().removeEventListener("click", clickReporter, false);
                top.getBrowser().removeEventListener("mouseover", wartisan_mouseover,false);
                 //alert("unregisterMyListener2: "+top.getBrowser());
	} catch(ex){}
}
var removeOuterRedline =1 //used for remove class
function wartisan_mouseover(e){
        e = e||window.event;
       
        var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
        var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var uri = ios.newURI('chrome://createrequest/skin/style.css', null, null);
        sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
        
        $mb('*',doc).removeClass("tcurrent");
         var test = $mb('.tcurrent',doc);
         if(test.length==0){
             //alert(doc);
         }
     
       // $mb('html',doc).removeClass("tcurrent");
       // alert(e.target);
      //  $mb(e.target,doc).addClass("tcurrent");
      if(removeOuterRedline>1)
   {
        $mb(e.target,doc).addClass("tcurrent");
  }
  removeOuterRedline=removeOuterRedline+1;

}




var myListener =
{

	onLocationChange:function(aProgress,aRequest,aURI) {
		/*if (!aProgress.isLoadingDocument) {
			//getSideBarBrowser().contentWindow.external.UpdateFSettings();
			//
		}*/
		///alert("444");
	},
	onStateChange:function(aProgress,aRequest,aFlag,aStatus) {
		//if (aFlag & STATE_STOP) {
		if (aFlag == STATE_PAGE_LOADED) {
			var attributes = new Array();
			dispatchClickMapEvent('clickMapUpdateEvent', attributes);
			
		}
		//alert("333");
	},
	onProgressChange:function(a,b,c,d,e,f){},
	onStatusChange:function(a,b,c,d){},
	onSecurityChange:function(a,b,c){},
	onLinkIconAvailable:function(a,b){},
	stateAnalyzer: function(abc){
	  	var the_State ='';
		if(abc & 1) the_State += ' START<br>';
		if(abc & 2) the_State += ' REDIRECTING<br>';
		if(abc & 4) the_State += ' TRANSFERRING<br>';
		if(abc & 8) the_State += ' NEGOTIATING<br>';
		if(abc & 16) the_State += ' STOP<br>';
		if(abc & 65536) the_State += ' IS_REQUEST<br>';
		if(abc & 131072) the_State += ' IS_DOCUMENT<br>';
		if(abc & 262144) the_State += ' IS_NETWORK<br>';
		if(abc & 524288) the_State += ' IS_WINDOW<br>';
   	return the_State;
   }
};


// This function is called right when the sidebar is opened
function onLoadCreateRequestSidebar() {
        // In FF4.0, the call to get the addon version in the install.rdf is asynchronous
        // so we need to poll until the variable is set.
        if(!window.createrequest.location) {
        	//alert("no createrequest.location"); // no createreqeust.location
            getCreateRequestVersion();
        } else {
			//alert("there is createrequest.location");
        }

        var callback = function() {
            if(window.createrequest.location) {
            	//alert("2");
                clearInterval(window.createrequest.polling);
                LoadSideBarContent(window.createrequest.location);
            } else return false;
        };

        window.createrequest.polling = window.setInterval(callback, 500);
}

/* Attach myListener to the browser window once clickmapSidebar has loaded */


//window.addEventListener("load",registerMyListener,false);
//window.addEventListener("unload",unregisterMyListener,false);



// Wei: below codes comes from https://code.google.com/p/fbug/source/browse/branches/firebug1.6/content/firebug/lib.js?spec=svn12950&r=8828#1332
function readXPath(element) {

	var paths = [];

// Use nodeName (instead of localName) so namespace prefix is included (if any).
	for (; element && element.nodeType == 1; element = element.parentNode) {
		var index = 0;
		for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)	{
			// Ignore document type declaration.
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
				continue;

			if (sibling.nodeName == element.nodeName)
				++index;
		}

		var tagName = element.nodeName.toLowerCase();
		var pathIndex = (index ? "[" + (index+1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}

	return paths.length ? "/" + paths.join("/") : null;
        
}


function pass_xpath(){   

alert ('start');
$mb = jQuery.noConflict();
doc = window.content.document;

var wartisan_sidebar = top.document.getElementById('sidebar').contentWindow.document.getElementById("createrequestBrowser").contentWindow;
var wdoc = wartisan_sidebar.document;
var sidebardoc = unwrap(wdoc);

var olElement = sidebardoc.getElementById("lupditem");
var liElement = sidebardoc.createElement("li");
//if no click on right side, new textarea will not be appended on leftside.
if ($mb("li",wdoc).length <= countClicks ){
    olElement.appendChild(liElement);
    var idnum = "inp"+$mb("li",wdoc).length;
    var remnum = "rem"+$mb("li",wdoc).length;
    var addnum = "add"+$mb("li",wdoc).length;

  //  $mb("li:last",wdoc).html("<span style='display: inline-block; vertical-align: middle'><textarea style='width: 230px; height: 200px; max-height: 100px; min-width: 250px;min-height: 200px; max-width: 230px;margin-left:10px' id='"+idnum+"' name='"+idnum+"'></textarea></span><input style='width: 80px; height: 21px;margin-left:10px' type='button' value='Remove' id='"+remnum+"' name='"+remnum+"' />");
       $mb("li:last",wdoc).html("<table style='display: inline-block; vertical-align: top' id='"+idnum+"' name='"+idnum+"'></table><input style='width: 15px; height: 15px;background:url(images/remove_icon-15x15.png) transparent; border:none;margin:0px 5px 0px 0px;cursor:pointer;' type='button' value='' id='"+remnum+"' name='"+remnum+"' />");
    //$mb("#lupditem",wdoc).html("<textarea id='kika' style='width: 370px; height: 400px; min-width: 230px; max-width: 630px;'></textarea>");
    registerMyListener();
    $mb("input[id^='rem']",wdoc).click(function() {
                    unregisterMyListener();
                    $mb('*',doc).removeClass("tcurrent"); 
                    var leng= $mb("li",wdoc).length;
                    var m= parseInt($mb(this,wdoc).attr("id").substr($mb(this,wdoc).attr("id").length-1));
                    var n= parseInt(m)-1;
                    var j= parseInt(m)+1;
                    //alert(n);
                    $mb("li:eq("+n+")",wdoc).remove();
                    if(m!=leng){
                            for (var i=0; i< leng-m; i++){
                                    //$("#rem"+(j+i)).attr({id:"rem"+(m+i)});
                                    $mb("#rem"+(j+i),wdoc).attr("id", "rem"+(m+i));
                                    $mb("#rem"+(m+i),wdoc).attr("name", "rem"+(m+i));
                                    $mb("#inp"+(j+i),wdoc).attr("id", "inp"+(m+i));
                                    $mb("#inp"+(m+i),wdoc).attr({name:"inp"+(m+i)});
                                    }
                            }
                      
                            event.stopPropagation(); 

                    });
                    $mb("input[id^='add']",wdoc).click(function() {
                                                                                                                
                            var tbId=parseInt($mb(this,wdoc).attr('id').substr($mb(this,wdoc).attr('id').length-1));
                            var tbElement = sidebardoc.getElementById("inp"+tbId);
                            var rows=parseInt(tbElement.rows.length+1);
                            if(rows!=1){
                            //alert(rows);
                            var trElement="<tr><td><input type='text' value='input new attribute here'/></td><td><textarea style='max-height: 70px; min-width: 200px;min-height: 70px; max-width: 200px;' id='inp"+tbId+"_"+rows+"'></textarea></td></tr>";
                            tbElement.innerHTML = tbElement.innerHTML + trElement;                         
                            }
                            event.stopPropagation(); 
                    });


    }
    
}

var countClicks = 0; //numberof clicks on right side after started update.
function clickReporter(e) {
var wartisan_sidebar = top.document.getElementById('sidebar').contentWindow.document.getElementById("createrequestBrowser").contentWindow;
var wdoc = wartisan_sidebar.document;


 countClicks = $mb("li",wdoc).length;

	e = e||window.event;
	var xpath = readXPath(e.target);

	// Wei: "sidebar" is the default ID for FF sidebar
	// Wei: ID createrequestBrowser was defined in sidebar.xul
	mySidebarDoc = top.document.getElementById('sidebar').contentWindow.document.getElementById("createrequestBrowser").contentWindow;
	mySidebarDoc = mySidebarDoc.document;
       
	mySidebarDoc = unwrap(mySidebarDoc);
    

	
	var request_steps = mySidebarDoc.getElementById("inp"+$mb("li",wdoc).length); // get the element <span id="catchdetails"></span>
	var textareaId = "inp"+countClicks;        
	//alert("details: " + request_steps);

	if (!request_steps) {
		alert("Didn't find catch details");
	} 

// pringt all need information for right side browser.
        var wartisanHtml = '';
        var loopCount=1;
        var style = '';
        for (var x in inner_content(e) ){
            if ( (x === 'pageUrl') || (x === 'action')|| (x === 'pathType')|| (x === 'pathText')){
                style = "style='display:none'";
            }
            else{
                style = '';
            }
             wartisanHtml += "<tr "+style+"><td>"+x+"</td><td><textarea class='change' id='"+textareaId+"_"+loopCount+"' style='max-height: 70px; min-width: 200px;min-height: 70px; max-width: 200px;'>"+inner_content(e)[x]+"</textarea></td></tr>";
             loopCount++;   

        }
 

        request_steps.innerHTML += wartisanHtml;

//prevent click <a> tag and <img> tag
        var oTarget = e.target||e.srcElement;//???????????
        tagn = oTarget.tagName;
        if(tagn.toLowerCase() == "a" || tagn.toLowerCase() == "img"){

                if(e && e.preventDefault) {  
                 e.preventDefault();  
                  } else {  

                 window.event.returnValue = false;   
             }
            
            unregisterMyListener();
            $mb('*',doc).removeClass("tcurrent");
             return false;
        }
        else{    
            unregisterMyListener();
            $mb('*',doc).removeClass("tcurrent");              
        }

}
function inner_content(e){
    e = e||window.event;
    var sscontent = new Array();
    //current page Url
    sscontent['pageUrl'] = content.document.URL;
    
    //current target xpath
    sscontent['action'] = 'update';
    sscontent['pathType'] = 'xPath';
    sscontent['pathText'] = readXPath(e.target);
    /*check if this target has child nodes.*/
    var haschild = $mb(e.target,doc).children();
    var inlineEle = "";
    haschild.each(function(){
        inlineEle += this.tagName+",";
    });
        var inlineArr = inlineEle.split(",");

    var inlineBase = "a,abbr,acronym,b,bdo,big,br,cite,code,dfn,em,font,i,img,input,kbd,label,q,s,samp,select,small,span,strike,strong,sub,sup,textarea,tt,u,var";                          
   //check if inner ele is inline elements.
   var inlineLength = inlineArr.length;
   var childLength = 0;
   for (var i = 0; i<inlineLength; i++){      
       var s = inlineBase.indexOf(inlineArr[i].toLowerCase()+",");
    
       if (s < 0){
           childLength++;
       }
       else{
           break;
       }
   }

  /*check if this target has child nodes.*/ 
 // if has child tags and child tags containing non-inline elements
    if ((haschild.length > 0) && (childLength > 0)){
        
     //   sscontent["verifyText"] = 'has inner element';
        alert('has inner element');
        return false;
               
    }
    //
    else {
//            /* if content containing <br>, split it into two parts.*/
//            var rawContent = $mb(e.target,doc).find('br');
//            if (rawContent.length > 0){
//                var regex = /<br\s*[\/]?>/gi;
//                var rawHtml = $mb(e.target,doc).html();
//                var splitHtml = rawHtml.split(regex);
//                var splitLength = splitHtml.length;
//                for ( var i = 0; i< splitLength; i++ ){
//                    sscontent["verifyText_"+i] = splitHtml[i].replace(/(<([^>]+)>)/ig,"");
//                }
//                
//            }
//            else {
            var rawContent = $mb(e.target,doc).text();
           
            var finalContent = String(rawContent).replace(/^\s+|\s+$/g, '');
      
           
            sscontent["verifyText"] = finalContent;
//            }
            
           /*end check <br>*/
           
            var tagName = $mb(e.target,doc).prop("tagName");
            //check targets tagname
            switch(tagName){
                case "IMG":
                   var properties = GetAttributes(e.target);
                   for( var x in properties) {
                       sscontent[tagName+"_"+x] = properties[x];
                   }  

                    sscontent["tagname"] = tagName;
                    
                    //if this image is a link; 
                    var isLink = $mb(e.target,doc).parent().prop("tagName");
                    if (isLink == "A"){
                        var linkProperties = GetAttributes(e.target.parentNode);

                        for( var y in linkProperties) {

                            sscontent[isLink+"_"+y] = linkProperties[y];

                          }  
                    }
                  break;
                
                 case "A":
                     var linkAttrs = GetAttributes(e.target);
                          for( var i in linkAttrs) {
                                sscontent["linpropertise_"+i] = linkAttrs[i];

                            }
                     break;
                     
                 default:
                 var hasAtag = $mb(e.target,doc).find('a');
                 var AtagLength = hasAtag.length;
                 if ( AtagLength > 0 ){
                      hasAtag.each(function(index){
                          sscontent["linkcontent_"+index] = $mb(this,doc).text();
                        //  sscontent["linklocation_"+index] = $mb(e.target,doc).find('a')[index];
                          var linkAttrs = GetAttributes($mb(e.target,doc).find('a')[index]);
                          for( var i in linkAttrs) {
                                sscontent["linpropertise_"+i+"_"+index] = linkAttrs[i];

                            }
//                            
//                           sscontent['link']['content'] = $mb(this,doc).text();
//                           var linkAttrs = GetAttributes($mb(e.target,doc).find('a')[index]);
//                           for( var i in linkAttrs) {
//                                sscontent['link'][i] = linkAttrs[i];
//
//                            }
                      });
                     
                 }
            }
         

    }

//    var textContent = fullContent.replace(/(<([^>]+)>)/ig,"");

  
    return sscontent;    
}

function GetAttributes(att){
    var instElement = att.attributes;
    var Properties = {};
    for( var attr in instElement){ 
     // only need 5 attrs for now: src, value, alt, target,   
     if( (instElement[attr].value == undefined) || (instElement[attr].name != 'src') && (instElement[attr].name != 'value') && (instElement[attr].name != 'alt')&& (instElement[attr].name != 'href') && (instElement[attr].name != 'target')){
      delete instElement[attr]; //firefox true 
     }else{
     
      //var Everypro ="\"" + instElement[attr].name + "\"" + ":\"" + instElement[attr].value + "\"";
      Properties[instElement[attr].name] = instElement[attr].value;
      //Properties.push(Everypro);
     }  
    }
   return Properties;
// || (instElement[attr].name != 'src') || (instElement[attr].name != 'href') || (instElement[attr].name != 'alt') || (instElement[attr].name != 'value')
}
