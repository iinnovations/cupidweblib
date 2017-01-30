// JavaScript Document

//globals
var stdauthmessage = 'You do not have sufficient authorization for this action';

////////////////////////////////////////////////////////////////////////////////////////////
// Utility Functions
////////////////////////////////////////////////////////////////////////////////////////////

// Value processing

function getNameFromPath(path) {
    path = path.replace(/\//g, ' ')
    path = path.trim()

    var mysplit = path.split(' ')
    var name = mysplit[mysplit.length - 1]
    var cleanname = name.split('.')[0]
    return cleanname
}
function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
function setprecision(num, digits) {
    if (isNumber(num)) {
        var roundednumber = num.toPrecision(digits);
    }
    else {
        roundednumber = 0
    }
    return roundednumber;
}
function zeropad(num, sizebefore, sizeafter) {
    var frac = Math.round((num % 1) * Math.pow(10, sizeafter)) / Math.pow(10, sizeafter);
    var whole = num - frac;
//console.log("whole: " + whole + " frac: " + frac)
    var after = frac + "";
    after = after.slice(2);
    var before = whole + "";
    while (before.length < sizebefore) before = "0" + before;
    while (after.length < sizeafter) after = after + "0";
    return before + "." + after;
}
function booleansToIntegerString(boolean) {
    var integer = 0;
    if (typeof boolean === 'string') {
        boolean = boolean.toLowerCase();
    }

//alert(boolean)
    if (boolean == 't') {
        integer = 1;
    }
    else if (boolean == 'f') {
        integer = 0;
    }
    else if (boolean == 'true') {
        integer = 1;
    }
    else if (boolean == 'false') {
        integer = 0;
    }
    else if (boolean == true) {
        integer = 1;
    }
    else if (boolean == false) {
        integer = 0;
    }
    else if (boolean == 'on') {
        integer = 1;
    }
    else if (boolean == 'off') {
        integer = 0;
    }
    return integer.toString();
}
function booleanBinaryToEnabledDisabled(value) {
    var string = "Value Error";
    if (value == 0) {
        string = "Disabled"
    }
    else if (value == 1) {
        string = "Enabled"
    }
    return string;
}
function booleanBinaryToOnOff(value) {
    var string = "Value Error";
    if (value == 0) {
        string = "Off"
    }
    else if (value == 1) {
        string = "On"
    }
    else {
        string = "Err"
    }
    return string;
}
function booleanBinaryToTrueFalseString(value) {
    var string = "Value Error";
    if (value == 0) {
        string = "false"
    }
    else if (value == 1) {
        string = "true"
    }
    return string;
}
function booleanBinaryToTrueFalse(value) {
    var answer = false;
    if (value == 0) {
        answer = false
    }
    else if (value == 1) {
        answer = true
    }
    return answer;
}
function dateStringToUTC(datestring) {
    var year = datestring.slice(0, 4);
    var month = datestring.slice(5, 7);
    var day = datestring.slice(8, 10);
    var hour = datestring.slice(11, 13);
    var minute = datestring.slice(14, 16);
    var second = datestring.slice(17, 19);

    return Date.UTC(year, month, day, hour, minute, second);
}
function trueFalseToInteger(boolean) {
    var integer = 0;
    if (boolean == true) {
        integer = 1;
    }
    return integer;
}
function getStringTime(args) {
    var UTC = args.UTC || false;
    var now = new Date();

    if (UTC) {
        var hours = now.getUTCHours();
        var minutes = now.getUTCMinutes();
        var seconds = now.getUTCSeconds();
        var year = now.getYear() + 1900;
        var month = now.getUTCMonth() + 1;
        var date = now.getUTCDate();
    }
    else{
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var year = now.getYear() + 1900;
        var month = now.getMonth() + 1;
        var date = now.getDate();
    }
    var stringtime = year + '-' + month + '-' + date + ' ' + hours + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    return stringtime
}

////////////////////////////////////////////////////////
// HTML DOM manipulation

function addInput(object, choices, classname, inputid) {
    var inputid = inputid || '';
    var newDiv = document.createElement('div');
    var selectHTML = '<select class="' + classname + '" id="' + inputid + '">';
    for (var i = 0; i < choices.length; i = i + 1) {
        selectHTML += "<option value='" + choices[i] + "'>" + choices[i] + "</option>";
    }
    selectHTML += "</select>";
    newDiv.innerHTML = selectHTML;
//newDiv.firstChild.value='auto' THIS WORKS
    //document.getElementById(divName).appendChild(newDiv);
    object.appendChild(newDiv);
}
function UpdateSelect(inputid, choices) {
// find current value
    var options = [];
// with js
    var curval = document.getElementById(inputid).value;
    document.getElementById(inputid).options.length = 0;
    for (var i = 0; i < choices.length; i++) {
        document.getElementById(inputid).options[i] = new Option(choices[i], choices[i], true, false);
    }
// set previous value if exists in new choices array
    if (choices.indexOf(curval) >= 0) {
        document.getElementById(inputid).value = curval;
    }
    if (inputid.indexOf("jqmselect") >= 0) {
        $('#' + inputid).selectmenu('refresh')
    }
}
function addTableRow(tableID, contentarray) {
    // contentarray = [column 1, column2 ... column N]
// where column = [ value, label, type, [ choice array ]]
// choice array is only necessary for select-one

    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    var colCount = table.rows[0].cells.length;

    for (var i = 0; i < contentarray.length; i++) {
        //alert(table.name);
        var newcell = row.insertCell(i);
        var cellclass = contentarray[i].cellclass || ''
        var cellid = contentarray[i].cellid || ''
        var celltype = contentarray[i].type || 'value'
        var cellvalue = contentarray[i].value
        var choices = contentarray[i].choices || []

// Act depending on type of cell
        var textvalue = 'empty';
        switch (celltype) {
            case "text": // text is an entry field
                var element1 = document.createElement("input");
                element1.className = cellclass;
                element1.type = "text";
                newcell.appendChild(element1);
                element1.value = cellvalue;
                break;
            case "checkbox":
                var element1 = document.createElement("input");
                element1.className = cellclass;
                element1.type = "checkbox";
                newcell.appendChild(element1);

                if (cellvalue == 1) {
                    element1.checked = true;
                    element1.value = true;
                }
                else if (cellvalue == 0) {
                    element1.checked = false;
                    element1.value = false;
                }
                break;
            case "select-one":
                addInput(newcell, choices, cellclass, cellid);
                newcell.firstChild.firstChild.value = cellvalue;
                break;
            case "value": // value is not editable
                var element1 = document.createElement("div");
                element1.className = cellclass;
                newcell.appendChild(element1);
                element1.innerHTML = cellvalue;

                break;
            case "boolean":
                if (cellvalue == 1) {
                    textvalue = "T";
                }
                else if (cellvalue == 0) {
                    textvalue = "F";
                }
                else {
                    textvalue = "Error";
                    alert('Error: ' + cellvalue + ' ' + cellclass)
                }
                newcell.innerHTML = textvalue;
                newcell.className = cellclass;

                break;
            case "onoff":
                if (cellvalue == 1) {
                    textvalue = "On";
                }
                else if (cellvalue == 0) {
                    textvalue = "Off";
                }
                else {
                    textvalue = "Error";
                }
                var element1 = document.createElement("div");
                element1.className = cellclass;
                newcell.appendChild(element1);
                element1.innerHTML = textvalue;
                break;
            case "button":
                newcell.innerHTML = '<button class="' + cellclass + '">' + cellvalue + '</button>';
                break;
        }	// end switch
//alert('type= ' + contentarray[i][2] + '. value in= ' + contentarray[i][0] + '. value out= ' + textvalue)
    } // end for
}
function clearTable(tableid, headerrows) {
    var table = document.getElementById(tableid);
    if (table.rows.length > 0) {
        for (var i = table.rows.length - 1; i > headerrows - 1; i--) {
            table.deleteRow(i);
        }
    }
}

////////////////////////////////////////////////////////
// Authentication

function checkauth(authlevel, reqauthlevel, callback, messagearg) {
    var stdmessage = "you are not authorized for this function"
// Handle custom message or lack thereof
    var message = messagearg || stdmessage;
    if (authlevel >= reqauthlevel) {
        callback();
    }
    else {
        alert(message);
    }
}
function partial(func /*, 0..n args */) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        var allArguments = args.concat(Array.prototype.slice.call(arguments));
        return func.apply(this, allArguments);
    };
}
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


//////////////////////////////////////////////////
// WSGI Data Retrieval

function wsgiCallbackTableData (actionobj) {
    //console.log('i am executing callbacktabledata')
	// Get the data
    actionobj.action = 'gettabledata';
    if (!actionobj.hasOwnProperty('start')){
        actionobj.start = 0;
    }
    var starttime = new Date().getTime();
    var callback = actionobj.callback || logdone;
    // Need to delete method or ajax will execute
    delete actionobj.callback;
    //console.log('my action is ' + actionobj.action)
	$.ajax({
		url: "/wsgireadonly",
		type: "post",
		datatype:"json",
        tiemout:2000,
		data: actionobj,
		success: function(response, textStatus, xhr){
			// Execute our callback function
            response = response || {};
            var now = new Date().getTime();
            response.responsetime = now - starttime;
            if (response.hasOwnProperty('etag')){
                actionobj.etag = response.etag;
            }
            //console.log(callback)
            actionobj.callback = callback;
            callback(response, actionobj, xhr);
		},
        error: function(xhr, textstatus, errorthrown){
            console.log('error function: ' + errorthrown)
            actionobj.callback = callback;
            callback({}, actionobj, xhr);
        },
        complete: function(){
            //console.log('complete function')
        }
	});
}
function wsgiCallbackMultTableData (actionobj) {

    // Get the data
    // We do this because the wsgi acts funny with things we say are
    // arrays and send in arrays of less than 2 items. So we send in two extra elements
    // and then prune them off in the response.

    actionobj.tablenames = ['', ''].concat(actionobj.tablenames);
    actionobj.action = 'gettabledata';
    if (!actionobj.hasOwnProperty('start')) {
        actionobj.start =  0;
    }
    if (!actionobj.hasOwnProperty('starts')) {
        actionobj.start = -1; // default is to start at end.
    }
    var starttime = new Date().getTime();
    var callback = actionobj.callback || logdone;

    // Need to delete method or ajax will execute
    delete actionobj.callback;

    if (actionobj.hasOwnProperty('auxcallback')) {
        var auxcallback = actionobj.auxcallback;
        delete actionobj.auxcallback;
    }

	$.ajax({
		url: "/wsgireadonly",
		type: "post",
		datatype:"json",
		data: actionobj,
		success: function(response, textstatus, xhr){

			//alert("I worked");
			// Execute our callback function
            response = response || {};

            // response might be 304 not modified. Need to consider this down the line as well
            if (response.hasOwnProperty('data')) {
                 response.data=response.data.slice(2);
            }
            actionobj.tablenames=actionobj.tablenames.slice(2);

            var now = new Date().getTime();
            response.responsetime = now - starttime;
            if (response.hasOwnProperty('etag')){
                actionobj.etag = response.etag;
            }
            actionobj.callback = callback;
            if (typeof auxcallback !== 'undefined') {
                actionobj.auxcallback = auxcallback;
            }
            callback(response, actionobj, xhr);

		},
        error: function(xhr, textstatus, errorthrown){


        },
        complete: function(){console.log('complete function')}
	});
}
function wsgiGetTableNames (actionobj) {
    actionobj.action = 'gettablenames';
     var starttime = new Date().getTime();
    callback = actionobj.callback || logdone;

    // Need to delete method or ajax will execute
    delete actionobj.callback;
	$.ajax({
		url: "/wsgireadonly",
		type: "post",
		datatype:"json",
		data: actionobj,
		success: function(response, textStatus, xhr){
			// Execute our callback function
            response = response || {};
            var now = new Date().getTime();
            response.responsetime = now - starttime;
            if (response.hasOwnProperty('etag')){
                actionobj.etag = response.etag;
            }
            callback(response, actionobj, xhr);
            actionobj.callback = callback;
		}
	});
}
function wsgiSwapTableRows(database, arguments, callback, callbackoptions) {
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype: "json",
        data: {'database': database, 'table': arguments.tablename, 'specialaction': 'switchtablerows', 'row1': arguments.row1, 'row2': arguments.row2, 'uniqueindex': arguments.uniqueindex},
        success: function (response) {
            //alert("I worked");
            // Execute our callback function
            callback(response, callbackoptions);
        }
    });
}
function wsgiExecuteCallbackQuery(database, query, callback) {
// Get the data
    callback = callback || logdone;
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype: "json",
        data: {'database': database, 'query': query},
        success: function (response) {
            callback(response)
        }
    });
}
function wsgiExecuteQuery(database, query, callback) {
// Get the data
    callback = callback || logdone;
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype: "json",
        data: {'database': database, 'query': query},
        success: function (response) {
//alert("I worked");
            callback(response);
        }
    });
}
function wsgiExecuteQueryArray(database, queryarray, callback) {
// Get the data
    callback = callback || logdone;
    $.ajax({
        url: "/wsgisqlitequery",
        type: "post",
        datatype: "json",
        data: {'database': database, 'queryarray': queryarray},
        success: function (response) {
            //alert("I worked");
            callback(response)
        }
    });
}

function runwsgiActions(actionobj, callback){
//    var callback = actionobj.callback || logdone;
    $.ajax({
        url: '/wsgiactions',
        type: 'post',
        datatype: 'json',
        data: actionobj,
        success: function(response){
            callback(response,actionobj);
        }
   });

}
// this is a retrofit.

function UpdateControl(actionobj, callback) {
    runwsgiActions(actionobj, callback)
}

///////////////////////////////////////////////////////////////////////////////////////////////
// Data Rendering
///////////////////////////////////////////////////////////////////////////////////////////////

// Dummy function for callback notification
function logdone(data) {
    console.log('done');
// console.log(data)
}

////////////////////////////////////////////////////////
// Widgets!

// Jquerymobile render of toggles into lamps
// Still haven't successfully removed hover behaviors

//function togglestolamps() {
//    var $justalamp = $('.justalamp');
//    $('.justalamp .ui-slider-label-a').css('text-indent', '0');
//    $('.justalamp .ui-slider-label-b').css('text-indent', '0');
//    $('.justalamp .ui-slider-inneroffset').html('');
//    $('.justalamp .ui-slider').unbind();
//    $justalamp.removeClass('ui-state-hover');
//    $justalamp.removeClass('ui-state-focus');
//}
function noclicky() {
    $('.noclicky').unbind();
}

// These are the base renderers for widgets, used by the
// table-to-widget renders below

function setWidgetValues(baseclass, value, options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;
    var onoffvalue = booleanBinaryToOnOff(value);
    value = value || 0;
    var text = String(value) || '';


// alert(' set widget values')
    $(baseclass).html(text);
    $(baseclass + 'onoff').html(onoffvalue);
    $(baseclass + 'text').val(text);
    $(baseclass + 'select').val(value);
    $(baseclass + 'checkbox').attr("checked", booleanBinaryToTrueFalse(value));

    // in jqmpages, we set this value to be true to enable rendering of
    // jqmobile widgets. Otherwise, these methods will not be understood by the
    // browser, as jqmobile has not been loaded

    if (jqmpage) {
        // note change from slider to flipswitch in jQuery 1.4+
        $(baseclass + 'toggle').val(booleanBinaryToOnOff(value)).flipswitch("refresh");
        $(baseclass + 'flipswitch').val(booleanBinaryToOnOff(value)).flipswitch("refresh");
        $(baseclass + 'automantoggle').val(value).slider("refresh");
        $(baseclass + 'slider').val(value).slider("refresh");
        setjqmSelectByClass(baseclass + 'jqmselect', value);
    }
    togglestolamps();
}
function setjqmSelectByClass(classname, value) {
    $(classname).each(function () {
        var $thisid = $('#' + this.id);
        if ($thisid.length > 0) {
// alert(this.id + ' set to ' + value)
            $thisid.val(value);
            $thisid.selectmenu("refresh");
        }
    });
}
function setWidgetActions(options) {
    var callback = options.callback || logdone;
    var updatetimeout = options.updatetimeout || 500;
    var jqmpage = options.jqmpage || false;
    var baseclass = options.baseclass;
    var actionobj = {'action': 'setvalue', 'database': options.database, 'table': options.tablename, 'valuename': options.key};


    if (options.condition !== undefined) {
        actionobj.condition = options.condition;
        //alert('i have a condition: ' + args.condition)
    }
    var $selectclasses = $(baseclass + 'select');
    $selectclasses.off('change.update');
    $selectclasses.on('change.update', function (event) {
        //var data = event.data
        actionobj.value = $(this).val();
        // invoke ajax query with callback to update the interface when it's done
        setTimeout(function () {
            UpdateControl(actionobj, callback);
        }, updatetimeout);
    });
    var $checkboxclasses = $(baseclass + 'checkbox');
    $checkboxclasses.off('click.update');
    $checkboxclasses.on('click.update', function (event) {
        //var data = event.data
        if ($(this).attr('checked')) {
            actionobj.value = 1
        }
        else {
            actionobj.value = 0;
        }

        // invoke ajax query with callback to update the interface when it's done
        setTimeout(function () {
            UpdateControl(actionobj, callback);
        }, updatetimeout);
    });

    // set actions for update buttons on text fields
    var $updatetextclasses = $(baseclass + 'textupdate')
    $updatetextclasses.unbind('click');
    $updatetextclasses.click(function (event) {
        alert('yo')
        // Need to switch value to text field on this one
        actionobj.value = $(baseclass + 'text').val();
        alert(actionobj.value)
        // invoke ajax query with callback to update the interface when it's done
        UpdateControl(actionobj, callback);
        var updateoncomplete = true;
        if (updateoncomplete) {
            //alert('update on complete!')
            setTimeout(function () {
                setWidgetValues(baseclass, actionobj.value, options)
            }, updatetimeout);
        }
    });

    // Actions for jqm objects. We pass the jqmpage boolean so that we don't
    // attempt to use methods/properties that don't exist if we haven't loaded jqm

    // This changed from slidestop options to toggle options for flipswitch

    if (jqmpage) {
        var $toggleclasses = $(baseclass + 'toggle');
        $toggleclasses.off('change');
        $toggleclasses.on('change', function (event) {
            //var data = event.data;
            actionobj.value = booleansToIntegerString($(this).val());
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $amtoggleclasses = $(baseclass + 'automantoggle');
        $amtoggleclasses.off('change');
        $amtoggleclasses.on('change', function (event) {
            //var data = event.data;
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $slideclasses = $(baseclass + 'slider');
        $slideclasses.off('change.update')
        $slideclasses.off('slidestop.update')
        $slideclasses.off('focus.update')
        // include change for input field and slidestop for slider
        $slideclasses.on('focus.update', function () {
            $slideclasses.on('change.update', function () {
                actionobj.value = $(this).val();
                // invoke ajax query with callback to update the interface when it's done
                setTimeout(function () {
                    UpdateControl(actionobj, callback);
                }, updatetimeout);
            });
        });

        $slideclasses.off('slidestop.update');
        $slideclasses.on('slidestop.update', function () {
// var data = event.data
            actionobj.value = $(this).val();
// invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $jqmselectclasses = $(baseclass + 'jqmselect')
        $jqmselectclasses.unbind('change.update');
        $jqmselectclasses.on('change.update', function (event) {
            // var data = event.data
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
            $('#' + this.id).selectmenu('refresh');
        });

        // this class updates a field based on the same name
        // baseclasstextupdate updates baseclass field using
        // the value found in baseclasstext

        var $jqmupdatetextclasses = $(baseclass + 'textupdate')
        $jqmupdatetextclasses.unbind('click');
        $jqmupdatetextclasses.click(function (event) {
            // Need to switch value to text field on this one
            actionobj.value = $(baseclass + 'text').val();
            // invoke ajax query with callback to update the interface when it's done
            UpdateControl(actionobj, callback);
            var updateoncomplete = true;
            if (updateoncomplete) {
                //alert('update on complete!')
                setTimeout(function () {
                    setWidgetValues(baseclass, actionobj.value, options)
                }, updatetimeout);
            }
        });
    }
}

// This are the generic rendering algorithms. These are used for the more specific table
// renderers. There are three types of tables dealt with here and several types of widgets
//
// Flat table - use renderWidgets
// Columns are item names, values are values. One table row
// classnames : tablename + columnname + widget type (optional)
// example : systemstatuslastpicontrolfreqslider

// Array table - use renderWidgetsFromArray
// Columns are item names, values are values, multiple tablerows
// classnames : tablename + columname + index (1 indexed)
// example : channelssetpointvalue1 (first row channelsetpointvalue)

// Unique key table - use renderWidgetsFromArrayByUniqueKey
// See functions below

// This works for a flat table only

// Can substitute a custom baseclass in for tablename if so desired.
// For example, when rendering the datamap, we'll throw in something like
// datadescription

function RenderWidgets(database, tablename, data, options) {
    var jqmpage = options.jqmpage || false;
    var callback = options.callback || logdone;
    var usedbname = options.usedbname || false;
    var setactions = options.setactions || true;
    var basebaseclass = 'emptyclass'
    if (usedbname) {
        basebaseclass = '.' + getNameFromPath(database) + tablename
    }
    else {
        basebaseclass = '.' + tablename
    }
    $.each(data, function (key, value) {
        // Set each possibility
        var baseclass = basebaseclass + key;
//        console.log('rendering baseclass: ' + baseclass)
        setWidgetValues(baseclass, value, options);
        if (setactions) {
            setWidgetActions({baseclass: baseclass, 'database': database, 'tablename': tablename, 'key': key, 'callback': callback, 'jqmpage': jqmpage});
        }
    });
//    togglestolamps();
}

// This works for a table with multiple rows, where we take zero-indexed
// rows, increment them by one and append to the value.
function RenderWidgetsFromArray(database, tablename, data, options) {
    var jqmpage = options.jqmpage || false;
    var callback = options.callback || logdone;
    var usedbname = options.usedbname || false;
    var setactions = options.setactions || true;
// alert('render widgets from array on ' + tablename + ' is ' + jqmpage)

    for (var i = 0; i < data.length; i++) {
        var index = i + 1;
        if (usedbname) {
            var basebaseclass = '.' + getNameFromPath(database) + tablename
        }
        else {
            var basebaseclass = '.' + tablename
        }
        $.each(data[i], function (key, value) {
            var baseclass = basebaseclass + key + index;
            console.log('rendering: ' + baseclass)
            setWidgetValues(baseclass, value, options);
            if (setactions) {
                setWidgetActions({'baseclass': baseclass, 'database': database, 'tablename': tablename, 'key': key, 'condition': 'rowid=' + index, 'callback': callback, 'jqmpage': jqmpage});
            }
        })
    }
//    togglestolamps();
}

// So here we take a table with multiple rows and render widgets based on a unique key
// Say the unique key is 'item' and the table is 'metadata'
// Say the first row has items 'item1' and fields 'field1' and 'field2' with 'field1value1' and 'field2value2', etc.

// Class names would be metadataitem1field1, metdataitem1field2, etc.

// this needs to be updated before it is used to be consistent with arguments

function renderWidgetsFromArrayByUniqueKey(data, args) {
    var callback = args.callback || logdone;
    var uniquekeyname = args.uniquekeyname || 'parameter';
    var updatetimeout = 500; // ms to wait to avoid duplicate events
//    console.log(data)

    for (var i = 0; i < data.length; i++) {
        // Set each possibility
        var uniquekey = data[i][uniquekeyname];
        $.each(data[i], function (key, value) {
            var baseclass = '.' + args.tablename + uniquekeyname + uniquekey + key;
//            console.log('rendering ' + baseclass + key);
            setWidgetValues(baseclass, value, args);
            setWidgetActions({'baseclass': baseclass, 'database': args.database, 'tablename': args.tablename, 'key': key, 'condition': uniquekeyname + '=' + uniquekey});
        })
    }
//    togglestolamps();
}

function testFunction(someoptions) {
    someoptions = someoptions || {};
    if (someoptions.option > 0) {
        alert(someoptions.option);
    }
// console.log('still printing');
}

function togglestolamps(){
  var $justalamp = $('.justalamp');
  $('.justalamp .ui-flipswitch .ui-btn').css({'width':'0','border-width':'0'});
  $('.justalamp .ui-flipswitch .ui-flipswitch-on').css('text-indent','-2em');
  $('.justalamp .ui-flipswitch .ui-flipswitch-off').css('text-indent','2em');
  //$('.justalamp .ui-slider-label-b').css('text-indent','0');
  //$('.justalamp .ui-slider-inneroffset').html('');
  //$('.justalamp .ui-flipswitch').unbind();
  $justalamp.removeClass('ui-state-hover');
  $justalamp.removeClass('ui-state-focus');
}

////////////////////////////////////////////////////////////////////////////
// Rendering database data to views

// these first functions don't do any table creation.
// they just load data into appropriately named fields

// We're going to create a generic function here that will deprecate all of the specific
// rendering functions below. We are going to render with the generic format for baseclass:
// tablename + value

// This will create conflicts if multiple databases have the same tablenames. To avoid this,
// either use different table names between databases, or set option.usedbname = true
// This will change the rendering to databasename + tablename + value. This has not been extensively tested

function GetAndRenderTableData(options) {
    $('.statusmessage').html('Updating..')
    var callback = RenderTableData;
//    console.log(options.database)
//    console.log(options.tablename)
    wsgiCallbackTableData(options.database, options.tablename, callback, options)
}
function RenderTableData(datatable, options) {
//    console.log(datatable)
    options = options || {};

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            GetAndRenderTableData(options)
        }, options.timeout);
    }

    // Render selector items if instructed to.
    if (options.hasOwnProperty('selectorclass')) {
        var selectoritems = [];
        var selectortableitem = options.selectortableitem || 'name';

        if (options.hasOwnProperty('selectorhasnoneitem')) {
            selectoritems.push('none')
        }
        for (var i = 0; i < datatable.length; i++) {
            selectoritems.push(datatable[i][selectortableitem]);
        }
// console.log(selectoritems)
        $('.' + options.selectorclass).each(function () {
            if ($('#' + this.id).length > 0) {
                UpdateSelect(this.id, selectoritems);
            }
        });
    }
    // If we want to render a flat table, we have to pass index 1
    // Otherwise, it will be rendered with the index of 1 in the classnames
    if (options.hasOwnProperty('index')) {
        RenderWidgets(options.database, options.tablename, datatable[options.index - 1], options);
        if (options.hasOwnProperty('auxcallback')) {
            options.auxcallback(channelsdata[options.index - 1])
        }
    }
    else if (options.hasOwnProperty('indexselector')) {
        // We pass an index selector id and get the selected index value.
        // we get the row based on the value of the selector
        var selectedindex = $('#' + options.indexselector).prop('selectedIndex');
        RenderWidgets(options.database, options.tablename, datatable[selectedindex], options)
        if (options.hasOwnProperty('auxcallback')) {
            options.auxcallback(tabledata[selectedindex])
        }
    }
    else {
        // include index in class render name
        RenderWidgetsFromArray(options.database, options.tablename, datatable, options)
        if (options.hasOwnProperty('auxcallback')) {
            options.auxcallback(tabledata)
        }
    }
    $('.statusmessage').html('')
}


//// Tables Data
function UpdateTableNamesData(options) {
    var callback = RenderTableNamesData;
    if (!options.hasOwnProperty('database')) {
        options.database = controldatabase;
    }
    wsgiGetTableNames(options.database, callback, options)
}
function RenderTableNamesData(tablenames, options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout = options.timeout;
    }
    else {
        timeout = 0;
    }

    if (options.timeout > 0) {
        setTimeout(function () {
            UpdateTableNamesData(options)
        }, options.timeout);
    }
// console.log(tablenames)
    $('.' + options.database + 'tableselect').each(function () {
        if ($('#' + this.id).length > 0) {
            UpdateSelect(this.id, tablenames);
        }
    });
    $('.' + options.database + 'tablejqmselect').each(function () {
        if ($('#' + this.id).length > 0) {
            UpdateSelect(this.id, tablenames);
            $('#' + this.id).selectmenu("refresh");
        }
    });
}


//// Columns Data
// With database and table, update named selectors
// with all available columns. This is used for offering all
// database fields as criteria.

// So for the database controldata, table channels, the selector would be
// constroldatachannelscolumnselect. Add that class and it will be rendered

function updateColumnsData(options) {
    var callback = RenderColumnsData;
    if (!options.hasOwnProperty('database')) {
        options.database = controldatabase;
    }

    if (!options.hasOwnProperty('table')) {
        options.table = 'datamap';
    }
    wsgiCallbackTableData(options.database, options.table, callback, options)
}
function RenderColumnsData(data, options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout = options.timeout;
    }
    else {
        timeout = 0;
    }
    if (options.timeout > 0) {
        setTimeout(function () {
            updateColumnsData(options)
        }, options.timeout);
    }

    // Get the name of each column
    var columnnames = [];
    $.each(data[0], function (key, value) {
        columnnames.push(key);
    })
    var cleandbname = getNameFromPath(options.database)
//    console.log('.' + cleandbname + options.table + 'columnselect')
    $('.' + cleandbname + options.table + 'columnselect').each(function () {
        if ($('#' + this.id).length > 0) {
            UpdateSelect(this.id, columnnames);
        }
    });
    $('.' + cleandbname + options.table + 'columnjqmselect').each(function () {
        if ($('#' + this.id).length > 0) {
            UpdateSelect(this.id, columnnames);
            $('#' + this.id).selectmenu("refresh");
        }
    });

    // we can pass a custom list of clasess to update
    if (options.hasOwnProperty('classes')) {
        for (var i = 0; i < options.classes.length; i++) {
            $('.' + options.classes[i]).each(function () {
                if ($('#' + this.id).length > 0) {
                    UpdateSelect(this.id, columnnames);
                    if (jqmpage) {
                        $('#' + this.id).selectmenu("refresh");
                    }
                }
            })
        }
    }
}

// Rows data. This is for the case where we want to render all values of a particular column
// into, for example, a selector. For datamap, we could have a field datadescription1, whose value describes the data.
// So we get all possible values of the datadescription1 field name for the user to select

function updateRowsData(options) {
    var callback = renderRowsData;
    if (!options.hasOwnProperty('database')) {
        options.database = controldatabase;
    }

    if (!options.hasOwnProperty('table')) {
        options.table = 'datamap';
    }

    if (!options.hasOwnProperty('column')) {
        options.column = 'datadescription1';
    }
    wsgiCallbackTableData(options.database, options.table, callback, options)
}
function renderRowsData(data, options) {
    options = options || {};
    var usedbname = options.usedbname || false;
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    var timeout = 0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout = options.timeout;
    }

    if (timeout > 0) {
        setTimeout(function () {
            updateRowsData(options)
        }, timeout);
    }

    var rowvalues = [];
    var columname = options.column;
    $.each(data, function (index, value) {
        rowvalues.push(value[columname])
    })
//    console.log('yo')
//    console.log(rowvalues)

    if (usedbname) {
        var cleandbname = getNameFromPath(options.database);
        var selectors = $('.' + cleandbname + options.table + columname + 'select');
        var jqmselectors = $('.' + cleandbname + options.table + columname + 'jqmselect');
    }
    else {
        var selectors = $('.' + options.table + columname +  + 'select');
        var jqmselectors = $('.' + options.table + columname +  'jqmselect');
    }
    var thisid = $('#' + this.id);
    selectors.each(function () {
        if (thisid.length > 0) {
            UpdateSelect(this.id, rowvalues);
        }
    });
    jqmselectors.each(function () {
        if (thisid.length > 0) {
            UpdateSelect(this.id, rowvalues);
            $('#' + this.id).selectmenu("refresh");
        }
    });

    // we can pass a custom list of clasess to update
    if (options.hasOwnProperty('classes')) {
        for (var i = 0; i < options.classes.length; i++) {
            $('.' + options.classes[i]).each(function () {
                if ($('#' + this.id).length > 0) {
                    UpdateSelect(this.id, rowvalues);
                    if (jqmpage) {
                        $('#' + this.id).selectmenu("refresh");
                    }
                }
            })
        }
    }
}

// Generic Unique Key Render
function UpdateUniqueKeyData(options) {
    var callback = renderWidgetsFromArrayByUniqueKey
    wsgiCallbackTableData(options.database, options.tablename, callback, options);
}

///////////////////////////////////////////////////////////////////////////////////
// Sqlite table functions
///////////////////////////////////////////////////////////////////////////////////

function dropTable(database, tablename) {
    var query = 'drop table \"' + tablename + '\"';
    wsgiExecuteQuery(database, query, callback);
}
function deleteRow(database, table, callback, identifier, value) {
    var query = 'delete from \"' + table + '\" where \"' + identifier + '\"=\"' + value + '\"';
    wsgiExecuteQuery(database, query, callback);
}
function addDBRow(database, table, callback, valuenames, values) {
    var valuenames = valuenames || [];
    var values = values || [];
    var query = 'insert into \"' + table + '\"'
    if (values.length == valuenames.length && values.length > 0 && valuenames.length > 0) {
        query += '('
        for (var i = 0; i < valuenames.length; i++) {
            query += '\"' + valuenames[i] + '\"';
            if (i < valuenames.length - 1) {
                query += ','
            }
        }
        query += ') values (';
        for (var i = 0; i < values.length; i++) {
            query += '\"' + values[i].toString() + '\"';
            if (i < values.length - 1) {
                query += ','
            }
        }
        query += ')'
    }
    else if (values.length > 0) {
        query += ') + values ('
        for (var i = 0; i < values.length; i++) {
            query += '\"' + values[i].toString() + '\"';
            if (i < values.length - 1) {
                query += ','
            }
        }
        query += ')'
    }
    else {
        query += ' default values';
    }
// console.log(query)
    wsgiExecuteQuery(database, query, callback);
}