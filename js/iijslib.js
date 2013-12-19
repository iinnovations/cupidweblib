// JavaScript Document

////////////////////
// jqplot object stuff

function plotdefs(id) {
	this.id = 'page plot definitions';
}

/////////////////////////////////////////////////////
// Utility Functions

// Value processing

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function setprecision(num, digits) {
	if (isNumber(num)) {
		roundednumber=num.toPrecision(digits)
	}
	else {roundednumber = 0}
	return roundednumber
}
function zeropad(num, sizebefore, sizeafter) {
	var frac = Math.round((num%1)*Math.pow(10,sizeafter))/Math.pow(10,sizeafter);
	var whole = num-frac;
	//console.log("whole: " + whole + " frac: " + frac)
	var after = frac + "";
	after = after.slice(2);
	before = whole+"";
    
	while (before.length < sizebefore) before = "0" + before;	
	while (after.length < sizeafter) after = after + "0";
	
    return before + "." + after;
}
function BooleansToIntegerString(boolean) {
	var integer=0
	if (typeof boolean === 'string') { 
		boolean=boolean.toLowerCase()
	}
	
	//alert(boolean)
	if (boolean=='t') {
		integer=1
	}
	else if (boolean =='f') {
		integer=0
	}
	else if (boolean=='true') {
		integer=1
	}
	else if (boolean =='false') {
		integer=0
	}
	else if (boolean =='on') {
		integer = 1
	}
	else if (boolean =='off') {
		integer =0
	}
	return integer.toString()
}
function booleanbinarytoenableddisabled(value) {
	if (value==0) { string = "Disabled" }
	else if (value==1) { string = "Enabled" }
	else { string = "Value Error" }
	return string
}
function booleanbinarytoonoff(value) {
	if (value==0) { string = "Off" }
	else if (value==1) { string = "On" }
	else { string = "Value Error" }
	return string
}

function datestringtoUTC(datestring) {
	year = datestring.slice(0,4);
	month = datestring.slice(5,7);
	day = datestring.slice(8,10);
	hour = datestring.slice(11,13);
	minute = datestring.slice(14,16);
	second = datestring.slice(17,19);
				
	return Date.UTC(year,month,day,hour,minute,second)	
}
function IntegerStringToTrueFalue(integerinput) {
	var integer=parseInt(integerinput)
	if (integer==1) {
		boolean=true
	}
	else {
		boolean=false
	}
	return boolean
}
function truefalsetointeger (boolean) {
	if (boolean == true) {
		integer=1
	}
	else {
		integer=0
	}
	return integer
}

////////////////////////////////////////////////////////
// HTML DOM manipulation

function addInput(object,choices,classname){
    var newDiv=document.createElement('div');
    var selectHTML = "";
    selectHTML="<select>";
    for(i=0; i<choices.length; i=i+1){
        selectHTML+= "<option value='"+choices[i]+"'>"+choices[i]+"</option>";
    }
        selectHTML += "</select>";
    newDiv.innerHTML= selectHTML;
	newDiv.className=classname;
	//newDiv.firstChild.value='auto' THIS WORKS
    //document.getElementById(divName).appendChild(newDiv);
	object.appendChild(newDiv);
}
function UpdateSelect(inputid,choices){
	// find current value
	options=[]
	// with js
 	var curval = document.getElementById(inputid).value
	document.getElementById(inputid).options.length=0;
	for(var i=0; i<choices.length; i++) {
		document.getElementById(inputid).options[i]=new Option(choices[i], choices[i], true, false);
	}
	// set previous value if exists in new choices array
	if(choices.indexOf(curval)>=0){
		document.getElementById(inputid).value=curval
	}	
	
	// with jquery
	//var curval = $('#' + inputid).val()
}
function addRow(tableID,contentarray) {
 	// contentarray = [column 1, column2 ... column N]
	// where column = [ value, label, type, [ choice array ]]
	// choice array is only necessary for select-one
	
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
 
    var colCount = table.rows[0].cells.length;
 
    for(var i=0; i<contentarray.length; i++) {
 		  //alert(table.name);
          var newcell = row.insertCell(i);
		  
		  // determine if input or indicator
		  
 		  label=contentarray[i][1];
		  
		  // Act depending on type of cell
		  var textvalue='empty'
          switch(contentarray[i][2]) {
              case "text": 		// text is an entry field
			  		var element1 = document.createElement("input")
		  			element1.className=label;
                    element1.type="text";
					newcell.appendChild(element1);
					element1.value = contentarray[i][0];
                    break;
              case "checkbox":
			  		var element1 = document.createElement("input")
		  			element1.className=label;
			  		element1.type="checkbox";
					newcell.appendChild(element1);
					
                    if (contentarray[i][0]==1) {
						element1.checked=true;
						element1.value=true;
					}
					else if (contentarray[i][0]==0 ){
						element1.checked=false;
						element1.value=false;
					} 
                    break;
              case "select-one":
                    addInput(newcell,contentarray[i][3],label)
					newcell.firstChild.firstChild.value=contentarray[i][0];
                    break;
			  case "value": // value is not editable
			        //alert(element1.className)
					var element1 = document.createElement("div");
					element1.className=label;
					newcell.appendChild(element1);
					element1.innerHTML = contentarray[i][0];
					
					break;
			  case "boolean":
			        if (contentarray[i][0]==1) {
						textvalue="T";
					}
					else if (contentarray[i][0]==0 ){
						textvalue="F"
					} 
					else {
						textvalue="Error"
					}
					newcell.innerHTML = textvalue;
					break;
			  case "onoff":
			        if (contentarray[i][0]==1) {
						textvalue="On";
					}
					else if (contentarray[i][0]==0 ){
						textvalue="Off"
					} 
					else {
						textvalue="Error"
					}
					newcell.innerHTML = textvalue;
					break;
          }	// end switch
		  //alert('type= ' + contentarray[i][2] + '. value in= ' + contentarray[i][0] + '. value out= ' + textvalue)
     } // end for
}	
function clearTable(tableid,headerrows) {
	var table = document.getElementById(tableid)	
	// render recipenames for indicators
	controlrecipes=[]
	for(var i = table.rows.length - 1; i > headerrows-1; i--)
	{
    	table.deleteRow(i);
	}
}
///////////////////////////////////////////////////////////////////////////////
// Authentication

function checkauth(authlevel, reqauthlevel, callback, message) {
	// Handle custom message or lack thereof
	message = (typeof message === "undefined") ? "You do not have authorization for this action" : message;

	if (authlevel >= reqauthlevel) {
		callback()
	}
	else {
		alert(message)
	}
}
function partial(func /*, 0..n args */) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
  	var allArguments = args.concat(Array.prototype.slice.call(arguments));
   	return func.apply(this, allArguments);
	};
}
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//////////////////////////////////////////////////
// WSGI Data Retrieval


// this is the old function, just in case we have problems with the function
// passing options, the next below

//function wsgiCallbackTableData (database,table,callback) {
	// Get the data
	//alert(database + ' ' + table + ' ' + callback)
//	$.ajax({
//		url: "/wsgisqlitequery",
//		type: "post",
//		datatype:"json",						
//		data: {'database':database,'table':table},
//		success: function(response){
//			// Execute our callback function
//			callback(response);										
//		}
//	});	
//}

function wsgiCallbackTableData (database,table,callback,callbackoptions) {
	// Get the data
	callbackoptions=callbackoptions || {}
	//alert(database + ' ' + table + ' ' + callback)
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",				
			
		data: {'database':database,'table':table},
		success: function(response){
			// Execute our callback function
			callback(response,callbackoptions);										
		}
	});	
}
function wsgiCallbackMultTableData (database,tablenames,callback) {
	// Get the data
	// We have to initialize the array or else it will not execute properly
	// We can just trim it off the backend..
	queryarray=['',]
	//queryarray=[]
	for (i=0;i<tablenames.length;i++){
		queryarray.push('select * from \'' + tablenames[i] + '\'')
	}
	
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'queryarray':queryarray},
		success: function(response){
			//alert("I worked");
			// Execute our callback function
			callback(response.slice(1));										
		}
	});	
}
function wsgiGetTableNames (database,callback,callbackoptions) {	
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'specialaction':'gettablenames'},
		success: function(response){
			//alert("I worked");
			// Execute our callback function
			callback(response,callbackoptions);										
		}
	});	
}
function wsgiExecuteCallbackQuery (database,query,callback) {
	// Get the data
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'query':query},
		success: function(response){
			callback(response)										
		}
	});	
}
function wsgiExecuteQuery (database,query) {
	// Get the data
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'query':query},
		success: function(response){
			//alert("I worked");
			// Execute our callback function										
		}
	});	
}
function wsgiExecuteQueryArray (database,queryarray) {
	// Get the data
   		$.ajax({
        	url: "/wsgisqlitequery",
        	type: "post",
        	datatype:"json",						
        	data: {'database':database,'queryarray':queryarray},
        	success: function(response){
        		//alert("I worked");
				// Execute our callback function										
			}
    	});	
}