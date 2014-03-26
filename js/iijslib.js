// JavaScript Document

//globals
var stdauthmessage='You do not have sufficient authorization for this action';

///////////////////////////////////////////////////////
// Utility Functions

// Value processing

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function setprecision(num, digits) {
	if (isNumber(num)) {
		var roundednumber=num.toPrecision(digits);
	}
	else {roundednumber = 0}
	return roundednumber;
}
function zeropad(num, sizebefore, sizeafter) {
	var frac = Math.round((num%1)*Math.pow(10,sizeafter))/Math.pow(10,sizeafter);
	var whole = num-frac;
	//console.log("whole: " + whole + " frac: " + frac)
	var after = frac + "";
	after = after.slice(2);
	var before = whole+"";
	while (before.length < sizebefore) before = "0" + before;	
	while (after.length < sizeafter) after = after + "0";
    return before + "." + after;
}
function booleansToIntegerString(boolean) {
	var integer=0;
	if (typeof boolean === 'string') { 
		boolean=boolean.toLowerCase();
	}
	
	//alert(boolean)
	if (boolean=='t') {
		integer=1;
	}
	else if (boolean =='f') {
		integer=0;
	}
	else if (boolean=='true') {
		integer=1;
	}
	else if (boolean =='false') {
		integer=0;
	}
	else if (boolean==true) {
		integer=1;
	}
	else if (boolean ==false) {
		integer=0;
	}
	else if (boolean =='on') {
		integer = 1;
	}
	else if (boolean =='off') {
		integer =0;
	}
	return integer.toString();
}
function booleanBinaryToEnabledDisabled(value) {
    var string="Value Error";
	if (value==0) { string = "Disabled" }
	else if (value==1) { string = "Enabled" }
	return string;
}
function booleanBinaryToOnOff(value) {
    var string="Value Error";
	if (value==0) { string = "Off" }
	else if (value==1) { string = "On" }
	return string;
}
function booleanBinaryToTrueFalseString(value) {
    var string = "Value Error";
	if (value==0) { string = "false" }
	else if (value==1) { string = "true" }
	return string;
}
function booleanBinaryToTrueFalse(value) {
    var answer = false;
	if (value==0) { answer = false }
	else if (value==1) { answer = true }
	return answer;
}
function dateStringToUTC(datestring) {
	var year = datestring.slice(0,4);
	var month = datestring.slice(5,7);
	var day = datestring.slice(8,10);
	var hour = datestring.slice(11,13);
	var minute = datestring.slice(14,16);
	var second = datestring.slice(17,19);
				
	return Date.UTC(year,month,day,hour,minute,second);
}
function trueFalseToInteger (boolean) {
	var integer=0;
    if (boolean == true) {
		integer=1;
	}
	return integer;
}

////////////////////////////////////////////////////////
// HTML DOM manipulation

function addInput(object,choices,classname,inputid){
    var inputid = inputid ||'';
    var newDiv=document.createElement('div');
    var selectHTML = '<select class="' + classname + '" id="' + inputid +'">';
    for(var i=0; i<choices.length; i=i+1){
        selectHTML+= "<option value='"+choices[i]+"'>"+choices[i]+"</option>";
    }
        selectHTML += "</select>";
    newDiv.innerHTML= selectHTML;
	//newDiv.firstChild.value='auto' THIS WORKS
    //document.getElementById(divName).appendChild(newDiv);
	object.appendChild(newDiv);
}
function UpdateSelect(inputid,choices){
	// find current value
	var options=[];
	// with js
 	var curval = document.getElementById(inputid).value;
	document.getElementById(inputid).options.length=0;
	for(var i=0; i<choices.length; i++) {
		document.getElementById(inputid).options[i]=new Option(choices[i], choices[i], true, false);
	}
	// set previous value if exists in new choices array
	if(choices.indexOf(curval)>=0){
		document.getElementById(inputid).value=curval;
	}
}
function addTableRow(tableID,contentarray) {
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
		  var cellclass = contentarray[i].cellclass || ''
          var cellid = contentarray[i].cellid || ''
          var celltype = contentarray[i].type || 'value'
          //var cellvalue = contentarray[i].value || ''
          var cellvalue = contentarray[i].value
          var choices = contentarray[i].choices || []
		  
		  // Act depending on type of cell
		  var textvalue='empty';
          switch(celltype) {
              case "text": 		// text is an entry field
			  		var element1 = document.createElement("input");
		  			element1.className=cellclass;
                    element1.type="text";
					newcell.appendChild(element1);
					element1.value = cellvalue;
                    break;
              case "checkbox":
			  		var element1 = document.createElement("input");
		  			element1.className=cellclass;
			  		element1.type="checkbox";
					newcell.appendChild(element1);
					
                    if (cellvalue==1) {
						element1.checked=true;
						element1.value=true;
					}
					else if (cellvalue==0 ){
						element1.checked=false;
						element1.value=false;
					} 
                    break;
              case "select-one":
                    addInput(newcell,choices,cellclass,cellid);
					newcell.firstChild.firstChild.value=cellvalue;
                    break;
			  case "value": // value is not editable
			        //alert(element1.className)
					var element1 = document.createElement("div");
					element1.className=cellclass;
					newcell.appendChild(element1);
					element1.innerHTML = cellvalue;
					break;
			  case "boolean":
			        if (cellvalue==1) {
						textvalue="T";
					}
					else if (cellvalue==0 ){
						textvalue="F";
					} 
					else {
						textvalue="Error";
					}
					newcell.innerHTML = textvalue;
					break;
			  case "onoff":
			        if (cellvalue==1) {
						textvalue="On";
					}
					else if (cellvalue==0 ){
						textvalue="Off";
					} 
					else {
						textvalue="Error";
					}
					newcell.innerHTML = textvalue;
					break;
              case "button":
					newcell.innerHTML = '<button class="' + cellclass + '">'+ cellvalue +'</button>';
					break;
          }	// end switch
		  //alert('type= ' + contentarray[i][2] + '. value in= ' + contentarray[i][0] + '. value out= ' + textvalue)
     } // end for
}	
function clearTable(tableid,headerrows) {
	var table = document.getElementById(tableid);
    if (table.rows.length > 0){
        for(var i = table.rows.length - 1; i > headerrows-1; i--)
        {
            table.deleteRow(i);
        }
    }
}

////////////////////////////////////////////////////////
// Authentication

function checkauth(authlevel, reqauthlevel, callback, messagearg) {
	// Handle custom message or lack thereof
	var message = messagearg || stdmessage ;
	if (authlevel >= reqauthlevel) {
		callback();
	}
	else {
		alert(message);
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

function wsgiCallbackTableData (database,table,callback,callbackoptionsarg) {
	// Get the data
	var callbackoptions=callbackoptionsarg || {};
	//console.log(database + ' ' + table + ' ' + callback)
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
function wsgiCallbackMultTableData (database,tablenames,callback,callbackoptionsarg) {
	// Get the data
    // We do this because the wsgi acts funny with things we say are
    // arrays and send in arrays of less than 2 items. So we send in two extra elements
    // and then prune them off in the response.
    tablenames=['',''].concat(tablenames);
    //console.log(tablenames)
    var callbackoptions=callbackoptionsarg || {};
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'tables':tablenames},
		success: function(response){
			//alert("I worked");
			// Execute our callback function
			callback(response.slice(2),callbackoptions);
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
function wsgiSwapTableRows (database,arguments,callback,callbackoptions) {
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype:"json",
        data: {'database':database,'table':arguments.tablename,'specialaction':'switchtablerows','row1':arguments.row1,'row2':arguments.row2,'uniqueindex':arguments.uniqueindex},
        success: function(response){
            //alert("I worked");
            // Execute our callback function
            callback(response,callbackoptions);
        }
    });
}
function wsgiExecuteCallbackQuery (database,query,callback) {
	// Get the data
    callback = callback || logdone;
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
function wsgiExecuteQuery (database,query,callback) {
	// Get the data
    callback=callback || logdone;
	$.ajax({
		url: "/wsgisqlitequery",
		type: "post",
		datatype:"json",						
		data: {'database':database,'query':query},
		success: function(response){
			//alert("I worked");
			callback(response);
		}
	});	
}
function wsgiExecuteQueryArray (database,queryarray,callback) {
	// Get the data
    callback = callback || logdone;
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype:"json",
        data: {'database':database,'queryarray':queryarray},
        success: function(response){
            //alert("I worked");
            callback(response)
        }
    });
}
