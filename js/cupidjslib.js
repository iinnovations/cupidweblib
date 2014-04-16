// JavaScript Document

// Set static variables for controlstatus query
			
controldatabase='/var/www/data/controldata.db';
recipedatabase='/var/www/data/recipedata.db';
logdatabase='/var/www/data/logdata.db';
infodatabase='/var/www/data/deviceinfo.db';
systemdatabase='/var/www/data/systemdata.db';
authdatabase='/var/www/data/authlog.db';
safedatabase='/var/wwwsafe/safedata.db'

// Define all the globals.
// We define these globally so that when we render tables that need them
// they can grab them if they have already been defined. This way we don't need
// to refetch selector data every time we build a table from scratch.

var inputnames=[];
var outputnames=[];
var controlalgorithmnames=[];
var controlrecipenames=[];
var algorithmtypes=[]
var modes=['auto','manual'];

//////////////////////////////////////////////////////
// Auth functions

function handleUserAuths(sessiondata) {
    // Define our usr for access control of features:
    sessiondata = sessiondata || {}
    var authlevel=0

    // Set IP of current session
    if (sessiondata.username == 'viewer') {
        authlevel=1
    }
    else if (sessiondata.username == 'controller') {
        authlevel=2
    }
    else if (sessiondata.username == 'administrator') {
        authlevel=3
    }
    else if (sessiondata.username == 'colin') {
        authlevel=4
    }
    else {
        authlevel=0
    }
    return authlevel
}
function logUserAuths(sessiondata) {
    if (sessiondata.authlevel > 0){
        //alert(appip + realip)
        $.ajax({
                url: "/wsgisessioncontrol",
                type: "post",
                datatype:"json",
                data: {'sessionid':sessiondata.sessionid,'event':'access','username':sessiondata.username,'realIP':sessiondata.realip,'apparentIP':sessiondata.appip},
                success: function(response){
                    //alert("I logged access");
                }
        });
    }
}

//////////////////////////////////////////////////////
// Database table manipulation
function dropTable(database,tablename) {
    var query='drop table \"' + tablename  + '\"';
    wsgiExecuteQuery (database,query, callback);
}
function deleteRow(database,table,callback,identifier,value){
    var query='delete from \"' + table + '\" where \"' + identifier + '\"=\"' + value + '\"';
    wsgiExecuteQuery (database,query,callback);
}
function addRow(database, table, callback, valuenames,values) {
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
//    console.log(query)
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
    deleteRow(controldatabase,'actions',callback,'name',name);
}
function deleteLog(logname, callback){
    dropTable(logdatabase,logname);
}

// Dummy function for callback notification
function logdone(data){
	console.log('done');
//    console.log(data)
}

////////////////////////////////////////////////////////
// Widgets!

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
    var onoffvalue = booleanBinaryToOnOff(value);
    value = value || 0;
    var text = String(value) || '';


//    alert(' set widget values')
    $(baseclass).html(text);
    $(baseclass + 'onoff').html(onoffvalue);
    $(baseclass + 'text').val(text);
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
    var updatetimeout = options.updatetimeout || 500;
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

    // set actions for update buttons on text fields
    var $updatetextclasses=$(baseclass + 'textupdate')
    $updatetextclasses.unbind('click');
    $updatetextclasses.click(function (event) {
        // Need to switch value to text field on this one
        actionobj.value = $(baseclass + 'text').val();
        alert(actionobj.value)
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
            }, updatetimeout);
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
//            console.log(baseclass)
        })
    }
    togglestolamps();
}

// So here we take a table with multiple rows and render widgets based on a unique key
// Say the unique key is 'item' and the table is 'metadata'
// Say the first row has items 'item1' and fields 'field1' and 'field2' with 'field1value1' and 'field2value2', etc.

// Class names would be metadataitem1field1, metdataitem1field2, etc.

// this needs to be updated before it is used to be consistent with arguments

function RenderWidgetsFromArrayByUniqueKey(data,args) {
    var callback = args.callback || logdone;
    var uniquekeyname=args.uniquekeyname || 'parameter';
    var updatetimeout=500; // ms to wait to avoid duplicate events
            console.log(data)

    for (var i=0; i<data.length;i++){
        // Set each possibility
        var uniquekey = data[i][uniquekeyname];
        $.each(data[i],function(key,value){
            var baseclass='.' + args.tablename + uniquekeyname + uniquekey;
            console.log('rendering ' + baseclass);
            setWidgetValues(baseclass,data.valuename, args);
            setWidgetActions({'baseclass':baseclass,'database':args.database,'tablename':args.tablename,'key':key,'condition':uniquekeyname+'='+uniquekey});
        })
    }
    togglestolamps();
}

function testFunction(someoptions) {
	someoptions = someoptions || {};
	if (someoptions.option > 0){
	    alert(someoptions.option);
    }
//    console.log('still printing');
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
        options.database = controldatabase;
    }
    wsgiGetTableNames (options.database,callback,options)
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
// With database and table, update named selectors
// with all available columns. This is used for offering all
// database fields as criteria.

// So for the database controldata, table channels, the selector would be
// constroldatachannelscolumnselect. Add that class and it will be rendered

function UpdateColumnsData(options) {
	var callback=RenderColumnsData;
    if (! options.hasOwnProperty('database')){
        options.database = controldatabase;
    }

    if (! options.hasOwnProperty('table')){
        options.table = 'channels';
    }
    wsgiCallbackTableData(options.database,options.table,callback,options)
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
	var cleandbname = getNameFromPath(options.database)
    console.log('.' + cleandbname + options.table + 'columnselect')
	$('.' + cleandbname + options.table + 'columnselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, columnnames);
		}
	});
    $('.' + cleandbname + options.table + 'columnjqmselect').each(function(){
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

// Generic Unique Key Render

function UpdateUniqueKeyData(options) {
	  var callback = RenderWidgetsFromArrayByUniqueKey
	  wsgiCallbackTableData(options.database,options.tablename,callback,options);
}

//// Control Algorithms
function UpdateControlAlgorithmsData(options) {
	  var callback=RenderControlAlgorithmsData;
	  wsgiCallbackTableData(controldatabase,'controlalgorithms',callback,options);
}
function RenderControlAlgorithmsData(datatable,options) {
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
		setTimeout(function(){UpdateControlAlgorithmsData(options)},options.timeout);
	}
	controlalgorithmnames=['none'];
	for (var i=0; i<datatable.length;i++){
		controlalgorithmnames.push(datatable[i].name);
	}
	$('.controlalgorithmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlalgorithmnames);
		}
	});
}

//// Control Algorithm Types
function UpdateControlAlgorithmTypesData(options) {
	  var callback=RenderControlAlgorithmTypesData;
	  wsgiCallbackTableData(controldatabase,'algorithmtypes',callback,options);
}
function RenderControlAlgorithmTypesData(datatable,options) {
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
		setTimeout(function(){UpdateControlAlgorithmTypesData(options)},options.timeout);
	}
	algorithmtypes=['none'];
	for (var i=0; i<datatable.length;i++){
		algorithmtypes.push(datatable[i].name);
	}
	$('.algorithmtypeselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, algorithmtypes);
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

    channelnames=[];
	for (var i=0;i<channelsdata.length;i++) {
		channelnames.push(channelsdata[i].name);
	}
	$('.channelselect').each(function(){
		if ($('#' + this.id).length > 0) {
			UpdateSelect(this.id, channelnames);
		}
	});

    var timeout=0;
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
function UpdateControlRecipeData(options) {
	  var callback=RenderControlRecipeData;
	  wsgiGetTableNames(recipedatabase,callback,options)
}
function RenderControlRecipeData(recipenames,options) {
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
	controlrecipenames=['none'];
	controlrecipenames.push(recipenames);
//    console.log(controlrecipenames)
	if (options.timeout>0) {
		setTimeout(function(){UpdateControlRecipeData(options)},options.timeout)
	}

	$('.controlrecipeselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlrecipenames)
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
	outputnames=['none'];
	for (var i=0; i<outputstable.length;i++){
		outputnames.push(outputstable[i].name);
	}
    RenderWidgetsFromArray(controldatabase,'outputs',outputstable,options)
	$('.outputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, outputnames);
		}
	});	
}

//// Inputs
function UpdateInputsData(options) {
	var callback = RenderInputsData;
	wsgiCallbackTableData(controldatabase,'inputs',callback,options)
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
	inputnames=['none'];
	for (var i=0; i<inputstable.length;i++){
		inputnames.push(inputstable[i].id);
	}

    RenderWidgetsFromArray(controldatabase,'inputs',inputstable,options)
	$('.inputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, inputnames);
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
//	console.log('time to render')
    RenderWidgetsFromArray(controldatabase,'actions',actionsdata,options);
}

//// System Status
function UpdateSystemStatusData(options) {
	var callback=RenderSystemStatusData;
	wsgiCallbackTableData(controldatabase,'systemstatus',callback,options);
}
function RenderSystemStatusData(datatable,options) {
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
	RenderWidgets(controldatabase, 'systemstatus', datatable[0], options);
}

//// Network Status
function UpdateNetStatusData(options) {
	var callback=RenderNetStatusData;
	wsgiCallbackTableData(systemdatabase,'netstatus',callback,options);
}
function RenderNetStatusData(datatable,options) {
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
		setTimeout(function(){UpdateNetStatusData(options)},timeout);
	}
	// Option for controls (as opposed to indicators (not implemented yet
    // var updatesliders = options.updatesliders || true;
	RenderWidgets(controldatabase, 'netstatus', datatable[0], options);
}

//// Netauths Data
function UpdateNetAuthsData(options) {
	var callback=RenderNetAuthsData;
    options.table = options.table || 'wireless'
	wsgiCallbackTableData(safedatabase,options.table,callback,options);
}
function RenderNetAuthsData(datatable,options) {
    options = options || {};
    var jqmpage = options.jqmpage || false;

    // populate selectors
    ssids=[];
	for (var i=0; i<datatable.length;i++){
		ssids.push(datatable[i].SSID);
	}
	$('.ssidselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, ssids);
		}
	});
    console.log(ssids)
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
		setTimeout(function(){UpdateNetAuthsData(options)},timeout);
	}
	// Option for controls (as opposed to indicators (not implemented yet
    // var updatesliders = options.updatesliders || true;
    RenderWidgetsFromArray(safedatabase, options.table, datatable, options)
}

//// Netconfig Status
function UpdateNetConfigData(options) {
	var callback=RenderNetConfigData;
	wsgiCallbackTableData(systemdatabase,'netconfig',callback,options);
}
function RenderNetConfigData(datatable,options) {
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
		setTimeout(function(){UpdateNetConfigData(options)},timeout);
	}
	// Option for controls (as opposed to indicators (not implemented yet
    // var updatesliders = options.updatesliders || true;
	RenderWidgets(systemdatabase, 'netconfig', datatable[0], options);
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
// functions, or not. The key part is creating table elements that can be automatically
// rendered. Eventually this will be a generic 'render table' function, but custom displays
// will always be necessary, as we don't want to render EVERYTHING at all times, and we also
// want to render things like text entry fields and selects


//// Control Inputs - also do ROM display table at same time
function UpdateInputsTable(options) {
	var callback=RenderInputsTable
    options=options || {}
    options.tablename='inputs';
    options.database=controldatabase;
	wsgiCallbackTableData(options.database,options.tablename,callback,options)
}
function RenderInputsTable (datatable,options) {
    var tableid = options.tableid || 'inputstable'
    var tablerowstart = options.tablerowstart || 1;
    var dbrowstart = options.dbrowstart || 0;
    var numdbrows = options.numdbrows || 999;

    // populate selectors
    inputnames=['none'];
	for (var i=0; i<datatable.length;i++){
		inputnames.push(datatable[i].name);
	}
	$('.inputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, inputnames);
		}
	});

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
		setTimeout(function(){UpdateinputsTable(options)},timeout);
	}

    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }
    clearTable(tableid, tablerowstart);
    for (var j=dbrowstart;j<numrowstoget;j++)
    {
        addTableRow(tableid,[{value:datatable[j].name, cellclass:options.tablename + "name" + String(j+1) + 'text',type:"value"},
            {value:datatable[j].id, cellclass:options.tablename + "id" + String(j+1),type:"value"},
            {value:datatable[j].interface, cellclass:options.tablename + "interface" + String(j+1),type:"value"},
            {value:datatable[j].type, cellclass:options.tablename + "type" + String(j+1),type:"value"},
            {value:datatable[j].address, cellclass:options.tablename + "address" + String(j+1),type:"value"},
            {value:datatable[j].value, cellclass:options.tablename + "text" + String(j+1),type:"value"},
            {value:datatable[j].polltime, cellclass:options.tablename + "polltime" + String(j+1) + "text",type:"value"}
        ]);
    }
//    RenderWidgetsFromArray(options.database,options.tablename,datatable,options)
}


function UpdateOutputsTable(options) {
	var callback=RenderOutputsTable
    options=options || {}
    options.tablename='outputs';
    options.database=controldatabase;
	wsgiCallbackTableData(options.database,options.tablename,callback,options)
}
function RenderOutputsTable (datatable,options) {
    var tableid = options.tableid || 'outputstable'
    var tablerowstart = options.tablerowstart || 1;
    var dbrowstart = options.dbrowstart || 0;
    var numdbrows = options.numdbrows || 999;

     // populate selectors
    outputnames=['none'];
	for (var i=0; i<datatable.length;i++){
		outputnames.push(datatable[i].name);
	}
	$('.outputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, outputnames);
		}
	});

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
		setTimeout(function(){UpdateOutputsTable(options)},timeout);
	}

    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }

    clearTable(tableid, tablerowstart);
    for (var j=dbrowstart;j<numrowstoget;j++)
    {
        addTableRow(tableid,[{value:datatable[j].name, cellclass:options.tablename + "name" + String(j+1) + 'text',type:"value"},
            {value:datatable[j].id, cellclass:options.tablename + "id" + String(j+1),type:"value"},
            {value:datatable[j].interface, cellclass:options.tablename + "interface" + String(j+1),type:"value"},
            {value:datatable[j].type, cellclass:options.tablename + "type" + String(j+1),type:"value"},
            {value:datatable[j].address, cellclass:options.tablename + "address" + String(j+1),type:"value"},
            {value:datatable[j].value, cellclass:options.tablename + "value" + String(j+1),type:"value"},
            {value:datatable[j].polltime, cellclass:options.tablename + "polltime" + String(j+1) + "text",type:"value"}
        ])
    }
//    RenderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

function UpdateIOInfoTable(options) {
	var callback=RenderIOInfoTable
    options=options || {}
    options.tablename='ioinfo';
    options.database=controldatabase;
	wsgiCallbackTableData(options.database,options.tablename,callback,options)
}
function RenderIOInfoTable (datatable,options) {
    var tableid = options.tableid || 'ioinfotable'
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
		setTimeout(function(){UpdateIOInfoTable(options)},timeout);
	}

    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }

    // currently vanilla javascript. we'll jquery this shortly.
    clearTable(tableid, tablerowstart);
    for (var j=dbrowstart;j<numrowstoget;j++)
    {
        if (options.editmode){
           addTableRow(tableid,[
               {value:datatable[j].id,cellclass:options.tablename + "id" + String(j+1),type:"value"},
               {value:datatable[j].name,cellclass:options.tablename + "name" + String(j+1) + 'text',type:"text"},
               {value:'Update',cellclass:options.tablename + "name" + String(j+1) + 'textupdate',type:"button"}
           ]);
           //setWidgetActions({database:controldatabase,tablename:options.tablename,baseclass:'.' + options.tablename + "name" + String(j+1)})
        }
        else {
            addTableRow(tableid,[
                {value:datatable[j].id,cellclass:options.tablename + "id" + String(j+1),type:"value"},
                {value:datatable[j].name,cellclass:options.tablename + "name" + String(j+1),type:"value"}
            ]);
        }
    }
//    RenderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

function UpdateChannelsTable(options) {
	var callback=RenderChannelsTable
    options=options || {}
    options.tablename='channels';
    options.database=controldatabase;
	wsgiCallbackTableData(options.database,options.tablename,callback,options)
}
function RenderChannelsTable (datatable,options) {
    var tableid = options.tableid || 'channelstable';
    var tablerowstart = options.tablerowstart || 1;
    var dbrowstart = options.dbrowstart || 0;
    var numdbrows = options.numdbrows || 999;
    var editable = options.editable || false;

    // populate selectors
    var channelnames=[];
	for (var i=0; i<datatable.length;i++){
		channelnames.push(datatable[i].name);
	}
	$('.channelselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, channelnames);
		}
	});

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
		setTimeout(function(){UpdateChannelsTable(options)},timeout);
	}

    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }
    clearTable(tableid, tablerowstart);
    for (var j=dbrowstart;j<numrowstoget;j++)
    {
        if (editable){
            addTableRow(tableid,[
                {value:datatable[j].channelindex, cellclass:options.tablename + "channelindex" + String(j+1),type:"value"},
                {value:datatable[j].name, cellclass:options.tablename + "name" + String(j+1),type:"text"},
                {value:datatable[j].controlinput, cellclass:options.tablename + "controlinput" + String(j+1) + 'select inputselect',cellid:options.tablename + "controlinput" + String(j+1) + 'select',type:"select-one",choices:inputnames},
                {value:datatable[j].enabled, cellclass:options.tablename + "enabled" + String(j+1) + 'checkbox',type:"checkbox"},
                {value:datatable[j].outputsenabled, cellclass:options.tablename + "outputsenabled" + String(j+1) + 'checkbox',type:"checkbox"},
                {value:datatable[j].controlalgorithm, cellclass:options.tablename + "controlalgorithm" + String(j+1) + 'select controlalgorithmselect',cellid:options.tablename + "controlalgorithm" + String(j+1) +'select', type:"select-one",choices:controlalgorithmnames},
                {value:datatable[j].controlrecipe, cellclass:options.tablename + "controlrecipe" + String(j+1) + 'select controlrecipeselect',cellid:options.tablename + "controlrecipe" + String(j+1) + 'select',type:"select-one",choices:controlrecipenames},
                {value:datatable[j].controlvalue, cellclass:options.tablename + "controlvalue" + String(j+1),type:"value"},
                {value:datatable[j].setpointvalue, cellclass:options.tablename + "setpointvalue" + String(j+1),type:"value"},
                {value:datatable[j].positiveoutput, cellclass:options.tablename + "positiveoutput" + String(j+1) + 'select outputselect',cellid:options.tablename + "positiveoutput" + String(j+1) + 'select',type:"select-one",choices:outputnames},
                {value:datatable[j].negativeoutput, cellclass:options.tablename + "negativeoutput" + String(j+1) + 'select outputselect',cellid:options.tablename + "negativeoutput" + String(j+1) + 'select',type:"select-one",choices:outputnames}
            ]);
        }
        else{
            addTableRow(tableid,[
                {value:datatable[j].channelindex, cellclass:options.tablename + "channelindex" + String(j+1),type:"value"},
                {value:datatable[j].name, cellclass:options.tablename + "name" + String(j+1),type:"value"},
                {value:datatable[j].controlinput, cellclass:options.tablename + "controlinput" + String(j+1),cellid:options.tablename + "controlinput" + String(j+1),type:"value"},
                {value:datatable[j].enabled, cellclass:options.tablename + "enabled" + String(j+1) + 'checkbox',type:"checkbox"},
                {value:datatable[j].outputsenabled, cellclass:options.tablename + "outputsenabled" + String(j+1) + 'checkbox',type:"checkbox"},
                {value:datatable[j].controlalgorithm, cellclass:options.tablename + "controlalgorithm" + String(j+1),cellid:options.tablename + "controlalgorithm" + String(j+1), type:"value"},
                {value:datatable[j].controlrecipe, cellclass:options.tablename + "controlrecipe" + String(j+1),cellid:options.tablename + "controlrecipe" + String(j+1),type:"value"},
                {value:datatable[j].controlvalue, cellclass:options.tablename + "controlvalue" + String(j+1),type:"value"},
                {value:datatable[j].setpointvalue, cellclass:options.tablename + "setpointvalue" + String(j+1),type:"value"},
                {value:datatable[j].positiveoutput, cellclass:options.tablename + "positiveoutput" + String(j+1),cellid:options.tablename + "positiveoutput" + String(j+1),type:"value"},
                {value:datatable[j].negativeoutput, cellclass:options.tablename + "negativeoutput" + String(j+1),cellid:options.tablename + "negativeoutput" + String(j+1),type:"value"}
            ]);
        }
    }
    // I don't think this is necessary.
//    RenderWidgetsFromArray(options.database,options.tablename,datatable,options)

}

function UpdateControlAlgorithmsTable(options) {
	var callback=RenderControlAlgorithmsTable
    options=options || {}
    options.tablename='controlalgorithms';
    options.database=controldatabase;
	wsgiCallbackTableData(options.database,options.tablename,callback,options)
}
function RenderControlAlgorithmsTable (datatable,options) {
    var tableid = options.tableid || 'controlalgorithmstable'
    var tablerowstart = options.tablerowstart || 1;
    var dbrowstart = options.dbrowstart || 0;
    var numdbrows = options.numdbrows || 999;
    var editable = options.editable || false;

     // populate selectors
    controlalgorithmnames=[];
	for (var i=0; i<datatable.length;i++){
		controlalgorithmnames.push(datatable[i].name);
	}
	$('.controlalgorithmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlalgorithmnames);
		}
	});

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
		setTimeout(function(){UpdateControlAlgorithmsTable(options)},timeout);
	}
    if (datatable.length > numdbrows) {
        var numrowstoget = numdbrows;
    }
    else {
        var numrowstoget = datatable.length;
    }

    clearTable(tableid, tablerowstart);
    for (var j=dbrowstart;j<numrowstoget;j++)
    {
       if (editable) {
           addTableRow(tableid,[{value:datatable[j].name,cellclass:options.tablename + "name" + String(j+1),type:"text"},
                {value:datatable[j].type,cellclass:options.tablename + "type" + String(j+1) + 'text',type:"value"},
                {value:datatable[j].proportional,cellclass:options.tablename + "proportional" + String(j+1),type:"text"},
                {value:datatable[j].integral,cellclass:options.tablename + "integral" + String(j+1),type:"text"},
                {value:datatable[j].derivative,cellclass:options.tablename + "derivative" + String(j+1),type:"text"},
                {value:datatable[j].deadbandhigh,cellclass:options.tablename + "deadbandhigh" + String(j+1),type:"text"},
                {value:datatable[j].deadbandlow,cellclass:options.tablename + "deadbandlow" + String(j+1),type:"text"},
                {value:datatable[j].dutypercent,cellclass:options.tablename + "dutypercent" + String(j+1),type:"text"},
                {value:datatable[j].dutyperiod,cellclass:options.tablename + "dutyperiod" + String(j+1),type:"text"}
           ]);
       }
       else{
           addTableRow(tableid,[{value:datatable[j].name,cellclass:options.tablename + "name" + String(j+1) + "text",type:"value"},
                {value:datatable[j].type,cellclass:options.tablename + "type" + String(j+1) + 'text',type:"value"},
                {value:datatable[j].proportional,cellclass:options.tablename + "proportional" + String(j+1),type:"value"},
                {value:datatable[j].integral,cellclass:options.tablename + "integral" + String(j+1),type:"value"},
                {value:datatable[j].derivative,cellclass:options.tablename + "derivative" + String(j+1),type:"value"},
                {value:datatable[j].deadbandhigh,cellclass:options.tablename + "deadbandhigh" + String(j+1),type:"value"},
                {value:datatable[j].deadbandlow,cellclass:options.tablename + "deadbandlow" + String(j+1),type:"value"},
                {value:datatable[j].dutypercent,cellclass:options.tablename + "dutypercent" + String(j+1),type:"value"},
                {value:datatable[j].dutyperiod,cellclass:options.tablename + "dutyperiod" + String(j+1),type:"value"}
           ]);
       }
    }
//    RenderWidgetsFromArray(options.database,options.tablename,datatable,options)
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

/////////////////////////////////////////////////////////
// Map Stuff
function makeUserServerMap(locations,labels,content) {
    var options =
    {
        zoom: 4,
        center: new google.maps.LatLng(locations[0][0],locations[0][1]),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions:
        {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            poistion: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.TERRAIN,
              google.maps.MapTypeId.HYBRID,
              google.maps.MapTypeId.SATELLITE]
        },
        navigationControl: true,
        navigationControlOptions:
        {
            style: google.maps.NavigationControlStyle.ZOOM_PAN
        },
        scaleControl: true,
        disableDoubleClickZoom: false,
        draggable: true,
        streetViewControl: true,
        draggableCursor: 'move'
    };
                map = new google.maps.Map(document.getElementById("map"), options);
                // Add Marker and Listener

                var userlatlng = new google.maps.LatLng(locations[1][0],locations[1][1]);
                var serverlatlng = new google.maps.LatLng(locations[0][0],locations[0][1]);
                var usermarker = new google.maps.Marker
                (
                    {
                        position: userlatlng,
                        map: map,
                        title: labels[0]
                    }
                );
                var servermarker = new google.maps.Marker
                (
                    {
                        position: serverlatlng,
                        map: map,
                        title: labels[1]
                    }
                );
    var serverwindow = new google.maps.InfoWindow({
        content: content[0]
    });
    var userwindow = new google.maps.InfoWindow({
        content: content[1]
    });
    google.maps.event.addListener(servermarker, 'click', function () {
        // Calling the open method of the infoWindow
        serverwindow.open(map, servermarker);
    });
        google.maps.event.addListener(usermarker, 'click', function () {
        // Calling the open method of the infoWindow
        userwindow.open(map, usermarker);
    });
}

////////////////////////////////////////////////////
// Modify database

// should probably do some documentation here on what the
// possible actions are

function UpdateControl(actionobj,callback) {
        callback = callback || logdone;
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

