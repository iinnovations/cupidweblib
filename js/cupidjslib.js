// JavaScript Document

// Set static variables for controlstatus query
			
controldatabase='/var/www/data/controldata.db';
recipedatabase='/var/www/data/recipedata.db';
logdatabase='/var/www/data/logdata.db';
infodatabase='/var/www/data/deviceinfo.db';
systemdatabase='/var/www/data/systemdata.db';
authdatabase='/var/www/data/authlog.db';

// Set a function to translate aliases
function dbAliasToPath(alias) {
    switch (alias)
    {
        case 'controldata':
            path = controldatabase;
            break;
        case 'recipedata':
            path = recipedatabase;
            break;
        case 'systemdata':
            path = systemdatabase;
            break;
        case 'logdata':
            path = logdatabase;
            break;
        case 'authlog':
            path = authdatabase;
            break;
    }
    return path

}

// Define all the globals
var inputs=[];
var outputs=[];
var controlalgorithms=[];
var controlrecipes=[];

//////////////////////////////////////////////////////
// Auth functions

function handleUserAuths() {
    // Define our usr for access control of features:
    var username = "<?php if (!empty($_SESSION['user']['name'])) { echo $_SESSION['user']['name'];} ?>";
    var sessionid = "<?php if (!empty($_SESSION['user']['sessionid'])) {echo $_SESSION['user']['sessionid'];} ?>";
    var appip =  "<?php if (!empty($_SESSION['user']['appip'])) {echo $_SESSION['user']['appip'];} ?>";
    var realip =  "<?php if (!empty($_SESSION['user']['realip'])) {echo $_SESSION['user']['realip'];} ?>";

    // Set IP of current session
    if (username == 'viewer') {
        authlevel=1
    }
    else if (username == 'controller') {
        authlevel=2
    }
    else if (username == 'administrator') {
        authlevel=3
    }
    else if (username == 'colin') {
        authlevel=4
    }
    else {
        authlevel=0
    }
}
function logUserAuths() {
    if (authlevel > 0){
        //alert(appip + realip)
        $.ajax({
                url: "/wsgisessioncontrol",
                type: "post",
                datatype:"json",
                data: {'sessionid':sessionid,'event':'access','username':username,'realIP':realip,'apparentIP':appip},
                success: function(response){
                    //alert("I logged access");
                }
        });
    }
}

// Database table manipulation
function dropTable(database,tablename) {
    var query='drop table \"' + tablename  + '\"';
    wsgiExecuteQuery (database,query, callback);
}
function deleteRow(database,table,callback,identifier,value){
    var query='delete from \"' + table + '\" where \"' + identifier + '\"=\"' + value + '\"';
    wsgiExecuteQuery (database,query,callback);
}
function addRow(database,table, callback, valuenames,values) {
    var valuenames=valuenames || [];
    var values=values || [];
    var query='insert into \"' + table + '\"'
    if (values.length == valuenames.length && values.length>0 && valuenames.length>0) {
        query+='('
        for (var i=0;i<valuenames.length;i++) {
            query+='\"' + valuenames[i] + '\"';
            if (i<valuenames.length-1){
                query+=','
            }
        }
        query+=') values (';
        for (var i=0;i<values.length;i++) {
            query+='\"' + values[i].toString() + '\"';
            if (i<values.length-1){
                query+=','
            }
        }
        query+=')'
    }
    else if (values.length>0) {
        query+=') + values ('
        for (var i=0;i<values.length;i++) {
            query+='\"' + values[i].toString() + '\"';
            if (i<values.length-1){
                query+=','
            }
        }
        query+=')'
    }
    else {
        query+=' default values';
    }
    console.log(query)
    wsgiExecuteQuery (database,query, callback);
}
function addChannel(channelname, callback){
    addRow(controldatabase,'channels',callback, ['name'],[channelname])
}
function addAction(name, callback){
    addRow(controldatabase,'actions',callback, ['name'],[name])
}
function deleteChannel(channelname, callback){
    deleteRow(controldatabase,'channels',callback,'name',channelname);
}
function deleteAction(name, callback){
    deleteRow(controldatabase,'channels',callback,'name',name);
}
function deleteLog(logname, callback){
    dropTable(logdatabase,logname);
}

// Dummy function for callback notification
function logdone(data){
	console.log('done');
    console.log(data)
}

// Jquerymobile render of toggles into lamps
// Still haven't successfully removed hover behaviors

function togglestolamps(){
  var $justalamp = $('.justalamp');
  $('.justalamp .ui-slider-label-a').css('text-indent','0');
  $('.justalamp .ui-slider-label-b').css('text-indent','0');
  $('.justalamp .ui-slider-inneroffset').html('');
  $('.justalamp .ui-slider').unbind();
  $justalamp.removeClass('ui-state-hover');
  $justalamp.removeClass('ui-state-focus');
}
function noclicky(){
	$('.noclicky').unbind();
}

// These are the base renderers for widgets, used by the
// table-to-widget renders below
function setWidgetValues(baseclass,value,options) {
    var jqmpage = options.jqmpage || false;
    value = value || 0;

//    alert(' set widget values')

    $(baseclass).html(value);
    $(baseclass + 'text').val(value);
    $(baseclass + 'select').val(value);
    $(baseclass + 'checkbox').attr("checked",booleanBinaryToTrueFalse(value));

    // in jqmpages, we set this value to be true to enable rendering of
    // jqmobile widgets. Otherwise, these methods will not be understood by the
    // browser, as jqmobile has not been loaded

    if (jqmpage) {
        $(baseclass + 'toggle').val(booleanBinaryToOnOff(value)).slider("refresh");
        $(baseclass + 'automantoggle').val(value).slider("refresh");
        $(baseclass + 'slider').val(value).slider("refresh");
        setjqmSelectByClass(baseclass + 'jqmselect',value);
    }
}
function setjqmSelectByClass(classname,value) {
    $(classname).each(function(){
        var $thisid=$('#' + this.id);
        if ($thisid.length > 0) {
//           alert(this.id + '   set to    ' + value)
            $thisid.val(value);
            $thisid.selectmenu("refresh");
        }
    });
}
function setWidgetActions(options){
    var callback = options.callback || logdone;
    var updateTimeout=500;
    var jqmpage = options.jqmpage || false;
    var baseclass = options.baseclass;
    var actionobj={'action':'setvalue','database':options.database,'table':options.tablename,'valuename':options.key};


    if ( options.condition !== undefined) {
        actionobj.condition=options.condition;
        //alert('i have a condition: ' + args.condition)
    }
    var $selectclasses= $(baseclass + 'select');
    $selectclasses.off('change.update');
    $selectclasses.on('change.update', function (event) {
        //var data = event.data
        actionobj.value = $(this).val();
        // invoke ajax query with callback to update the interface when it's done
        setTimeout(function () {
            UpdateControl(actionobj, callback);
        }, updatetimeout);
    });
    var $checkboxclasses= $(baseclass + 'checkbox');
    $checkboxclasses.off('click.update');
    $checkboxclasses.on('click.update', function (event) {
        //var data = event.data
        if( $(this).attr('checked')) {
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

    // Actions for jqm objects. We pass the jqmpage boolean so that we don't
    // attempt to use methods/properties that don't exist if we haven't loaded jqm
    if (jqmpage) {
        var $toggleclasses = $(baseclass + 'toggle');
        $toggleclasses.off('slidestop.update');
        $toggleclasses.on('slidestop.update', function (event) {
            //var data = event.data;
            actionobj.value = booleansToIntegerString($(this).val());
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updateTimeout);
        });

        var $amtoggleclasses=$(baseclass + 'automantoggle');
        $amtoggleclasses.off('slidestop');
        $amtoggleclasses.on('slidestop', function (event) {
            //var data = event.data;
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $slideclasses=$(baseclass + 'slider');
        $slideclasses.off('change.update')
        $slideclasses.off('slidestop.update')
        $slideclasses.off('focus.update')
         // include change for input field and slidestop for slider
        $slideclasses.on('focus.update',function(){
            $slideclasses.on('change.update', function () {
                actionobj.value = $(this).val();
    //            invoke ajax query with callback to update the interface when it's done
                setTimeout(function () {
                    UpdateControl(actionobj, callback);
                }, updatetimeout);
            });
        });

        $slideclasses.off('slidestop.update');
        $slideclasses.on('slidestop.update', function () {
//            var data = event.data
            actionobj.value = $(this).val();
//            invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $jqmselectclasses=$(baseclass + 'jqmselect')
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

        var $jqmupdatetextclasses=$(baseclass + 'textupdate')
        $jqmupdatetextclasses.unbind('click');
        $jqmupdatetextclasses.click(function (event) {
            // Need to switch value to text field on this one
            actionobj.value = $(baseclass + 'text').val();
            // invoke ajax query with callback to update the interface when it's done
            UpdateControl(actionobj, callback);
            var updateoncomplete = true;
            if (updateoncomplete){
                //alert('update on complete!')
                setTimeout(function () {
                    setWidgetValues(baseclass,actionobj.value,options)
                }, updatetimeout);
            }
        });
    }
}

// This are the generic rendering algorithms. These are used for the more specific table
// renderers. There are three types of tables dealt with here and several types of widgets
// 
// Flat table - use RenderWidgets
//   Columns are item names, values are values. One table row
//   classnames : tablename + columnname + widget type (optional)
//   example : systemstatuslastpicontrolfreqslider

// Array table - use RenderWidgetsFromArray
//   Columns are item names, values are values, multiple tablerows
//   classnames : tablename + columname + index (1 indexed)
//   example : channelssetpointvalue1 (first row channelsetpointvalue)

// Unique key table - use RenderWidgetsFromArrayByUniqueKey
//   See functions below

// This works for a flat table only
function RenderWidgets(database,tablename,data,options) {
    var jqmpage = options.jqmpage || false;
    var callback = options.callback || logdone;
//    alert('render widgets on ' + tablename + ' is ' + jqmpage)

    $.each(data,function(key,value){
      //console.log('key: ' + key + ' value: ' + value + ' element: ' + '.' + key + i)
      // Set each possibility
      var baseclass='.' + tablename + key;
      setWidgetValues(baseclass,value,options);
      setWidgetActions({'baseclass':baseclass,'database':database,'tablename':tablename,'key':key,'callback':callback,'jqmpage':jqmpage});
    });
    togglestolamps();
}

// This works for a table with multiple rows, where we take zero-indexed
// rows, increment them by one and append to the value.
function RenderWidgetsFromArray(database,tablename,data,options) {
    var jqmpage = options.jqmpage || false;
    var callback = options.callback || logdone;
//    alert('render widgets from array on ' + tablename + ' is ' + jqmpage)

    for (var i=0; i<data.length;i++){
        var index=i+1;
        $.each(data[i],function(key,value){
            var baseclass='.' + tablename + key + index;
            setWidgetValues(baseclass,value,options);
            setWidgetActions({'baseclass':baseclass,'database':database,'tablename':tablename,'key':key,'condition':'rowid='+index,'callback':callback,'jqmpage':jqmpage});
        })
    }
    togglestolamps();
}

// So here we take a table with multiple rows and render widgets based on a unique key
// Say the unique key is 'item' and the table is 'metadata'
// Say the first row has items 'item1' and fields 'field1' and 'field2' with 'field1value1' and 'field2value2', etc.

// Class names would be metadataitem1field1, metdataitem1field2, etc.

// this needs to be updated before it is used to be consistent with arguments

function RenderWidgetsFromArrayByUniqueKey(args,data) {
    var callback = args.callback || logdone;
    var uniquekeyname=args.uniquekey || 'parameter';
    var updatetimeout=500; // ms to wait to avoid duplicate events
    for (var i=0; i<data.length;i++){
        // Set each possibility
        var uniquekey=data[i].uniquekeyname;
        $.each(data[i],function(key,value){
            var baseclass='.' + tablename + uniquekeyname + key;
            setWidgetValues(baseclass,data.valuename,options);
            setWidgetActions({'baseclass':baseclass,'database':args.database,'tablename':args.tablename,'key':args.key,'condition':uniquekeyname+'='+uniquekey});
        })
    }
    togglestolamps();
}

function testFunction(someoptions) {
	someoptions = someoptions || {};
	if (someoptions.option > 0){
	    alert(someoptions.option);
    }
    console.log('still printing');
}

////////////////////////////////////////////////////////////////////////////
// Rendering database data to views

// these first functions don't do any table creation.
// they just load data into appropriately named fields

// Version and about data
function UpdateVersionsData(options) {
    var callback=RenderVersionsData;
    wsgiCallbackTableData(systemdatabase,'versions',callback,options)
}
function RenderVersionsData (versionsdata,options){
    options = options || {};

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
    if (options.timeout>0) {
        setTimeout(function(){UpdateVersionsData(options)},timeout);
    }
    // Render the widgets. The RenderVersionsData callback is for setting widget actions,
    // so that it renders right after the value gets set
    RenderWidgetsFromArray(systemdatabase,'versions',versionsdata,options)
}

// Metadata
function UpdateMetadata(options) {
	 var callback=RenderMetadata;
	 wsgiCallbackTableData(systemdatabase,'metadata',callback,options)
}
function RenderMetadata (metadata,options){
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateMetadata(options)},timeout);
	}
	// Manually done here. Only a couple items.
    $('.metadatadevicename').html(metadata[0].devicename);
	$('.metadatagroupname').html(metadata[0].groupname);
	
}

//// Tables Data
function UpdateTablesData(options) {
	var callback=RenderTablesData;
    if (! options.hasOwnProperty('database')){
        options.database = 'controldata';
    }
    options.dbpath = dbAliasToPath(options.database)
    wsgiGetTableNames (options.dbpath,callback,options)
}
function RenderTablesData(tablenames,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }

	if (options.timeout>0) {
		setTimeout(function(){UpdateTablesData(options)},options.timeout);
	}
//	console.log(tablenames)
	$('.' + options.database + 'tableselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, tablenames);
		}
	});
    $('.' + options.database + 'tablejqmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, tablenames);
            $('#' + this.id).selectmenu("refresh");
		}
	});
}

//// Columns Data
function UpdateColumnsData(options) {
	var callback=RenderColumnsData;
    if (! options.hasOwnProperty('database')){
        options.database = 'controldata';
    }
    options.dbpath = dbAliasToPath(options.database)

    if (! options.hasOwnProperty('table')){
        options.table = 'channels';
    }
    wsgiCallbackTableData(options.dbpath,options.table,callback,options)
}
function RenderColumnsData(data,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateColumnsData(options)},options.timeout);
	}
    var columnnames=[];
    $.each(data[0],function(key,value){
        columnnames.push(key);
    })
//	console.log(columnnames)
	$('.' + options.database + options.table + 'columnselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, columnnames);
		}
	});
    $('.' + options.database + options.table + 'columnjqmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, columnnames);
            $('#' + this.id).selectmenu("refresh");
		}
	});

    // we can pass a custom list of clasess to update
    if (options.hasOwnProperty('classes')){
        for (var i=0;i<options.classes.length;i++){
            $('.' + options.classes[i]).each(function(){
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

//// Control Algorithms
function UpdateControlAlgorithms(options) {
	  var callback=RenderControlAlgorithms;
	  wsgiCallbackTableData(controldatabase,'controlalgorithms',callback,options);
}
function RenderControlAlgorithms(algorithmstable,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }

	if (options.timeout>0) {
		setTimeout(function(){UpdateControlAlgorithms(options)},options.timeout);
	}
	var controlalgorithms=[];
	for (var i=0; i<algorithmstable.length;i++){
		controlalgorithms.push(algorithmstable[i].name);
	}
	$('.controlalgorithmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlalgorithms);
		}
	});
}

//// Channels Data
function UpdateChannelsData(options) {
	var callback=RenderChannelsData;
	wsgiCallbackTableData(controldatabase,'channels',callback,options)
}
function RenderChannelsData(channelsdata,options) {

    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Populate channel selector. We do this first because
    // if we have an indexselector of channelselect, not having a
    // value will cause an error

    var channelnames=[];
	for (var i=0;i<channelsdata.length;i++) {
		channelnames.push(channelsdata[i].name);
	}
	$('.channelselect').each(function(){
		if ($('#' + this.id).length > 0) {
			UpdateSelect(this.id, channelnames);
		}
	});

    var timeout=0;
//    console.log(channelsdata)
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    if (options.timeout>0) {
        setTimeout(function(){UpdateChannelsData(options)},options.timeout)
    }

	// Grab only a single channel if we pass that option
    // This first option grabs an element by the passed index
	if (options.hasOwnProperty('index')) {
		RenderWidgets(controldatabase,'channels',channelsdata[options.index-1],options);
        if (options.hasOwnProperty('auxcallback')){
            options.auxcallback(channelsdata[options.index-1])
        }
	}
	else if (options.hasOwnProperty('indexselector')) {
        // We pass an index selector id and get the selected index value.
        // we get the channel based on the value of the selector
        var selectedindex=$('#'+options.indexselector).prop('selectedIndex');
		RenderWidgets(controldatabase,'channels',channelsdata[selectedindex],options)
        if (options.hasOwnProperty('auxcallback')){
            options.auxcallback(channelsdata[selectedindex])
        }
    }
	else {
        RenderWidgetsFromArray(controldatabase,'channels',channelsdata,options)
        if (options.hasOwnProperty('auxcallback')){
            options.auxcallback(channelsdata)
        }
	}


}

//// Control Recipes
function UpdateControlRecipeNames(options) {
	  var callback=RenderControlRecipeNames;
	  wsgiGetTableNames(recipedatabase,callback,options)
}
function RenderControlRecipeNames(recipenames,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	var renderrecipenames=['none'];
	renderrecipenames.push(recipenames);
	if (options.timeout>0) {
		setTimeout(function(){UpdateControlRecipeNames(options)},options.timeout)
	}

	$('.controlrecipeselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, renderrecipenames)
		}
	});
}

//// Outputs
function UpdateOutputsData(options) {
	var callback=RenderOutputsData;
	wsgiCallbackTableData(controldatabase,'outputs',callback,options)
}
function RenderOutputsData(outputstable,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;
//    alert('rendering outputs IS ' + jqmpage)
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateOutputsData(options)},options.timeout);
	}
	var outputs=['none'];
	for (var i=0; i<outputstable.length;i++){
		outputs.push(outputstable[i].name);
	}
    RenderWidgetsFromArray(controldatabase,'outputs',outputstable,options)
	$('.outputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, outputs);
		}
	});	
}

//// Inputs
function UpdateInputsData(options) {
	var callback = RenderInputsData;
	wsgiCallbackTableData(controldatabase,'inputsdata',callback,options)
}
function RenderInputsData(inputstable,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateInputsData(options)},options.timeout)
	}
	var inputs=['none'];
	for (var i=0; i<inputstable.length;i++){
		inputs.push(inputstable[i].id);
	}
    RenderWidgetsFromArray(controldatabase,'inputsdata',inputstable,options)
	$('.inputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, inputs);
			//console.log(inputs)
		}
	});	
}

//// Indicators
function UpdateIndicatorsData(options) {
	var callback=RenderIndicators;
	wsgiCallbackTableData(controldatabase,'indicators',callback,options);
}
function RenderIndicators(indicatorsdata,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateIndicatorsData(options)},options.timeout);
	}
//	console.log('time to render')
    RenderWidgetsFromArray(controldatabase,'indicators',indicatorsdata,options);
}

//// Actions
function UpdateActionsData(options) {
	var callback=RenderActions;
	wsgiCallbackTableData(controldatabase,'actions',callback,options);
}
function RenderActions(actionsdata,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (options.timeout>0) {
		setTimeout(function(){UpdateActionsData(options)},options.timeout);
	}
	console.log('time to render')
    RenderWidgetsFromArray(controldatabase,'actions',actionsdata,options);
}

//// System Status
function UpdateSystemStatusData(options) {
	var callback=RenderSystemStatusData;
	wsgiCallbackTableData(controldatabase,'systemstatus',callback,options);
}
function RenderSystemStatusData(systemstatusdatalist,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (timeout>0) {
		setTimeout(function(){UpdateSystemStatusData(options)},timeout);
	}
	// Option for controls (as opposed to indicators (not implemented yet
    // var updatesliders = options.updatesliders || true;
	var systemstatusdata=systemstatusdatalist[0];
	RenderWidgets(controldatabase, 'systemstatus', systemstatusdata,options);
}

//// Metadata
function UpdatePlotMetadata(options) {
	var callback=RenderPlotMetadata;
	wsgiCallbackTableData(logdatabase,'metadata',callback,options);
}
function RenderPlotMetadata(metadata,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (timeout>0) {
		setTimeout(function(){UpdatePlotMetadata(options)},timeout);
	}
	for (var i=0;i<metadata.length;i++){
        //$('.' + metadata[i].name.replace(' ','_') + 'points').html(88);
		$('.' + metadata[i].name.replace(/ /g,'_') + 'points').html(metadata[i].numpoints);
	    //alert('.' + metadata[i].name.replace(' ','_') + 'points')
	}
}


// These guys create tables and table elements and then render them using the above
// functions, or not.


//// Control Inputs - also do ROM display table at same time
function UpdateInputsDataTable(options) {
	var callback=RenderControlInputsTable
	wsgiCallbackTableData(controldatabase,'inputsdata',callback,options)
}
function RenderControlInputsTable (datatable,options) {
    var tableid = options.tableid || 'inputsdatatable'
    var tablerowstart = options.tablerowstart || 1;
    var dbrowstart = options.dbrowstart || 0;
    var numdbrows = options.numdbrows || 999;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
    else {
        timeout=0;
    }
	if (timeout>0) {
		setTimeout(function(){UpdateInputsDataTable(options)},timeout);
	}

    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }
	inputids=[]
	for (var i=dbrowstart; i<numrowstoget;i++){
		inputids[i]=datatable[i].id
	}
    // currently vanilla javascript. we'll jquery this shortly.
    clearTable(tableid, tablerowstart);
    for (var j=0;j<numrowstoget;j++)
    {
        addTableRow(tableid,[[datatable[j].id,"id","value"],[datatable[j].interface,"interface","value"],[datatable[j].type,"type","value"],[datatable[j].value,"value","value"],[datatable[j].unit,"unit","value"],[datatable[j].polltime,"time","value"]]);
    }
}



////////////////////////////////////////////////////////////////////////////
// Misc

// this function gets the current time and renders it to an html element

function UpdateTimestamps(passedoptions){
	//console.log(passedoptions.timeout);
	if (passedoptions.timeout>0) {
		setTimeout(function(){UpdateTimestamps(passedoptions)},passedoptions.timeout);
	}
	var now = new Date();      
	var hours = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var year = now.getYear() + 1900;
	var month = now.getMonth() + 1;
	var date = now.getDate() ;
	var logreadtime= year + '-' + month + '-' + date + '  ' + hours + ":" + pad(minutes,2) + ":" + pad(seconds,2);
	for (var i=0;i<passedoptions.renderids.length;i++){
		$("#"+passedoptions.renderids[i]).html(logreadtime);
	}
}

/////////////////////////////////////////////////////
// Plot Stuff
//

var channelOptionsObj={
	legend: {
	  show: true,
	  location: 'sw',     // compass direction, nw, n, ne, e, se, s, sw, w.
	  xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
	  yoffset: 12        // pixel offset of the legend box from the y (or y2) axis.
	},
	axes:{
		xaxis:{
			renderer:$.jqplot.DateAxisRenderer,
			tickOptions:{mark:'inside'}
		},
		 
		yaxis:{
			tickOptions:{mark:'inside'},
            autoscale:true
		},  
		y2axis:{
		  min:-101, 
		  max:101, 
		  ticks:[-100,-50,0,50,100], 
		  tickOptions:{showGridline:false, mark:'inside'},
		  showTicks: false
		}
	},
	seriesDefaults:{
		 seriesColors: [ "#000000", "#ff0000", "#00ff00", "#0000ff", "#555555", "#958c12",
  "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc"], 
		show:true,
		lineWidth:2.5,
		showMarker :false
	},
	cursor:{
	  show: true,
	  zoom:true,
	  showTooltip:true
	},
	series:[
	  {label: 'Control Value'},
	  {label: 'Setpoint Value'},
	  {label: 'Action (%)',yaxis:'y2axis'} 
	],
    highlighter: {
        show: true,
        sizeAdjust: 7.5
    }
};
var largeChannelOptionsObj={
	legend: {
	  show: true,
	  location: 'sw',     // compass direction, nw, n, ne, e, se, s, sw, w.
	  xoffset: 30,        // pixel offset of the legend box from the x (or x2) axis.
	  yoffset: 30        // pixel offset of the legend box from the y (or y2) axis.
	},
	axes:{
		xaxis:{
			renderer:$.jqplot.DateAxisRenderer,
			tickOptions:{mark:'inside'}
		},
		 
		yaxis:{autoscale:true,
			tickOptions:{mark:'inside'}
		},  
		y2axis:{
            autoscale: true,
		  min:-110,
		  max:110,
		  ticks:[-100,-50,0,50,100],
		  tickOptions:{showGridline:false, mark:'inside'},
		  showTicks: true
		}
	},
	seriesDefaults:{
		 seriesColors: [ "#000000", "#ff0000", "#00ff00", "#0000ff", "#555555", "#958c12",
  "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc"], 
		show:true,
		lineWidth:2.5,
		showMarker :false
	},
	cursor:{ 
	  show: true,
	  zoom:true, 
	  showTooltip:true
	},
	series:[
	  {label: 'Control Value'},
	  {label: 'Setpoint Value'},
	  {label: 'Action (%)',yaxis:'y2axis'} 
	]
};

function GetAndRenderLogData(options){
	var callback=RenderLogData;
    // This section lets the timeout function get an updated value for the table
    // it should be retrieving. We can do it by channel or tablename, as long as we
    // keep the naming convention the same!

    if (options.hasOwnProperty('tablenameid')) {
        options.logtablename=$('#' + options.tablenameid).val()
    }
    else if (options.hasOwnProperty('channelnameid')) {
        options.logtablename=$('#' + options.channelnameid).val() + '_log'
    }
	wsgiCallbackTableData (logdatabase,options.logtablename,callback,options);
}
function GetAndRenderMultLogsData(logdatabase,options){
    var callback=RenderMultLogsData;
    wsgiCallbackMultTableData(logdatabase,options.tablenames,callback,options)
}
function RenderMultLogsData(returnedlogdata,options){

    // This function operates on multiple returned log tables
    // This means that the log data and seriesnames have an additional dimension
    // The plotids and results, however, do not.

    // We give this function [[seriesnames]] to get and [plotids]
    // to render to, as properties of the options argument
    // We then use these to parse the passed datatable

    // We have l tables that we are getting data from
    // We get i series from each table
    // Each series is j points long.
    // We then render to k plotids

    //console.log(returnedlogdata)
    if (options.timeout>0) {
        setTimeout(function(){GetAndRenderMultLogsData(options)},options.timeout);
    }
    for (i=0;i<options.renderplotids.length;i++) {
        $('#' + options.renderplotids[i]).html('');
    }
    var plotseriesarray=[];
    // For each log table
    var totalseriescount=0;
    for (var l=0;l<returnedlogdata.length;l++){
        // For the i-th series in hte l-th table
        for (var i=0;i<options.seriesnames[l].length;i++){
            var currentseries=[];
            var seriesname=options.seriesnames[l][i];
            for(var j=0;j<returnedlogdata[l].length;j++){
                currentseries.push([returnedlogdata[l][j].time,returnedlogdata[l][j][seriesname]]);
                for (var k=0;k<options.renderplotids.length;k++){
                    // For now the options reside in the html. Probably most flexible this way.
                    // options.renderplotoptions[k].series[totalseriescount].label=options.logtablename + ' : ' + options.seriesnames[l][i];
                }
            }
            plotseriesarray.push(currentseries);
            totalseriescount+=1;
        }
    }

    for (var i=0;i<options.renderplotids.length;i++){
        $.jqplot(options.renderplotids[i], plotseriesarray, options.renderplotoptions[i]);
    }
}
function RenderLogData (returnedlogdata,options) {
    // This function operates on a single returned log table
    //console.log(returnedlogdata)
    // We give this function [seriesnames] and [plotids]
    // to render to, as properties of the options argument
	// We then use these to parse the passed datatable

	if (options.timeout>0) {
		setTimeout(function(){GetAndRenderLogData(options)},options.timeout);
	}
	for (i=0;i<options.renderplotids.length;i++) {
		$('#' + options.renderplotids[i]).html('');
	}

	// for each seriesname, iterate over j data points,
    // then render to k plotids
    var plotseriesarray=[]
    for (var i=0;i<options.seriesnames.length;i++){
        var currentseries=[]
        var seriesname=options.seriesnames[i]
        for(var j=0;j<returnedlogdata.length;j++){
            currentseries.push([returnedlogdata[j].time,returnedlogdata[j][seriesname]])
            for (var k=0;k<options.renderplotids.length;k++){
                options.renderplotoptions[k].series[i].label=options.logtablename + ' : ' + options.seriesnames[i];
            }
        }
        plotseriesarray.push(currentseries)
        //console.log(currentseries)
    }
    for (i=0;i<options.renderplotids.length;i++){
        $.jqplot(options.renderplotids[i], plotseriesarray, options.renderplotoptions[i]);
    }
}

////////////////////////////////////////////////////
// Modify database

function UpdateControl(actionobj,callback) {
        $.ajax({
        	url: "/wsgiupdatecontrol",
            type: "post",
            datatype:"json",
            data: actionobj,
            success: function(response){
            	callback(response);
            }
       });
}