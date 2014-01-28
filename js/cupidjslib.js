// JavaScript Document

// Set static variables for controlstatus query
			
controldatabase='/var/www/data/controldata.db';
recipedatabase='/var/www/data/recipedata.db';
logdatabase='/var/www/data/logdata.db';
infodatabase='/var/www/data/deviceinfo.db';
systemdatabase='/var/www/data/systemdata.db';

// Define all the globals

var inputs=[];
var outputs=[];
var controlalgorithms=[];
var controlrecipes=[];

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
function setWidgetValues(baseclass,value) {
    var jqmpageval = jqmpage || false;
    value = value || 0;

    $(baseclass).html(value);
    $(baseclass + 'text').val(value);
    $(baseclass + 'select').val(value);
    $(baseclass + 'checkbox').attr("checked",booleanBinaryToTrueFalse(value));

    //console.log(baseclass)
    // in jqmpages, we set this value to be true to enable rendering of
    // jqmobile widgets. Otherwise, these methods will not be understood by the
    // browser, as jqmobile has not been loaded

    if (jqmpageval) {
        $(baseclass + 'toggle').val(booleanBinaryToOnOff(value)).slider("refresh");
        $(baseclass + 'automantoggle').val(value).slider("refresh");
        $(baseclass + 'slider').val(value).slider("refresh");
        setjqmSelectByClass(baseclass + 'jqmselect',value);
    }
}
function setjqmSelectByClass(classname,value) {
    $(classname).each(function(){
        var $thisclass=$('#' + this.id);
        if ($thisclass.length > 0) {
            //alert(this.id + '   ' + $('#' + this.id).val() + '    ' + value)
            $thisclass.val(value);
            $thisclass.selectmenu("refresh");
        }
    });
}
function setWidgetActions(args){
    var callback = args.callback || logdone;
    var updateTimeout=500;
    var actionobj={'action':'setvalue','database':args.database,'table':args.tablename,'valuename':args.key};
    var baseclass = args.baseclass;

    if ( args.condition !== undefined) {
        actionobj.condition=args.condition;
        //alert('i have a condition: ' + args.condition)
    }
    var $selectclasses= $(baseclass + 'select');
    $selectclasses.unbind('change');
    $selectclasses.on('change', function (event) {
        //var data = event.data
        actionobj.value = $(this).val();
        // invoke ajax query with callback to update the interface when it's done
        setTimeout(function () {
            UpdateControl(actionobj, callback);
        }, updatetimeout);
    });
    if (jqmpage) {
        var $toggleclasses = $(baseclass + 'toggle');
        $toggleclasses.unbind('slidestop');
        $toggleclasses.on('slidestop', function (event) {
            //var data = event.data;
            actionobj.value = booleansToIntegerString($(this).val());
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updateTimeout);
        });

        var $amtoggleclasses=$(baseclass + 'automantoggle');
        $amtoggleclasses.unbind('slidestop');
        $amtoggleclasses.on('slidestop', function (event) {
            //var data = event.data;
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $slideclasses=$(baseclass + 'slider');
        $slideclasses.unbind('slidestop');
        $slideclasses.filter('.ui-slider-input').unbind('change');
        // include change for input field and slidestop for slider
        $slideclasses.filter('.ui-slider-input').on('change', function (event) {
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        $slideclasses.on('slidestop', function (event) {
            //var data = event.data
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
        });

        var $jqmselectclasses=$(baseclass + 'jqmselect')
        $jqmselectclasses.unbind('change');
        $jqmselectclasses.on('change', function (event) {
            // var data = event.data
            actionobj.value = $(this).val();
            // invoke ajax query with callback to update the interface when it's done
            setTimeout(function () {
                UpdateControl(actionobj, callback);
            }, updatetimeout);
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
                    setWidgetValues(baseclass,actionobj.value)
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
function RenderWidgets(database,tablename,data,callbackarg) {
  var callback = callbackarg || logdone;
  $.each(data,function(key,value){
	  //console.log('key: ' + key + ' value: ' + value + ' element: ' + '.' + key + i)
	  // Set each possibility
	  var baseclass='.' + tablename + key;
	  setWidgetValues(baseclass,value);
	  setWidgetActions({'baseclass':baseclass,'database':database,'tablename':tablename,'key':key,'callback':callback});
  });
  togglestolamps();
}

// This works for a table with multiple rows, where we take zero-indexed
// rows, increment them by one and append to the value.
function RenderWidgetsFromArray(database,tablename,data,callbackarg) {
  var callback = callbackarg || logdone;
  for (var i=0; i<data.length;i++){
	  var index=i+1;
	  $.each(data[i],function(key,value){
    	  var baseclass='.' + tablename + key + index;
		  setWidgetValues(baseclass,value);
	      setWidgetActions({'baseclass':baseclass,'database':database,'tablename':tablename,'key':key,'condition':'rowid='+index,'callback':callback});
	  })
  }
  togglestolamps();
}

// So here we take a table with multiple rows and render widgets based on a unique key
// Say the unique key is 'item' and the table is 'metadata'
// Say the first row has items 'item1' and fields 'field1' and 'field2' with 'field1value1' and 'field2value2', etc.

// Class names would be metadataitem1field1, metdataitem1field2, etc.

function RenderWidgetsFromArrayByUniqueKey(args,data) {
  var callback = args.callbackarg || logdone;
  var uniquekeyname=args.uniquekey || 'parameter';
  var updatetimeout=500; // ms to wait to avoid duplicate events
  for (var i=0; i<data.length;i++){
	  // Set each possibility
	  var uniquekey=data[i].uniquekeyname;
	  $.each(data[i],function(key,value){
		var baseclass='.' + tablename + uniquekeyname + key;
		setWidgetValues(baseclass,data.valuename);
		setWidgetActions({'baseclass':baseclass,'database':args.database,'tablename':args.tablename,'key':args.key,'condition':uniquekeyname+'='+uniquekey});
	  })
  }
  togglestolamps();
}

function testFunction(someoptionsarg) {
	var someoptions = someoptionsarg || {};
	if (someoptions.option > 0){
	    alert(someoptions.option);
    }
    console.log('still printing');
}

////////////////////////////////////////////////////////////////////////////
// Rendering database data to views

// Version and about data
function UpdateVersionsData(callbackoptions) {
   var callback=RenderVersionsData;
   wsgiCallbackTableData(systemdatabase,'versions',callback,callbackoptions)
}
function RenderVersionsData (versionsdata,callbackoptionsarg){
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
  if (callbackoptions.timeout>0) {
	  setTimeout(function(){UpdateVersionsData(callbackoptions)},timeout);
  }
  // Render the widgets. The RenderVersionsData callback is for setting widget actions,
  // so that it renders right after the value gets set
  RenderWidgetsFromArray(systemdatabase,'versions',versionsdata,RenderVersionsData)
}

// Metadata
function UpdateMetadata(callbackoptions) {
	 var callback=RenderMetadata;
	 wsgiCallbackTableData(systemdatabase,'metadata',callback,callbackoptions)
}
function RenderMetadata (metadata,callbackoptionsarg){
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateMetadata(callbackoptions)},timeout);
	}
	// Manually done here. Only a couple items.
    $('.metadatadevicename').html(metadata[0].devicename);
	$('.metadatagroupname').html(metadata[0].groupname);
	
}

//// Control Algorithms
function UpdateControlAlgorithms(callbackoptions) {
	  var callback=RenderControlAlgorithms;
	  wsgiCallbackTableData(controldatabase,'controlalgorithms',callback,callbackoptions);
}
function RenderControlAlgorithms(algorithmstable,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }

	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateControlAlgorithms(callbackoptions)},callbackoptions.timeout);
	}
	var controlalgorithms=[];
	for (var i=0; i<algorithmstable.length;i++){
		controlalgorithms[i]=algorithmstable[i].name;
	}
	$('.controlalgorithmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlalgorithms);
		}
	});
}

//// Channels Data
function UpdateChannelsData(callbackoptions) {
	  var callback=RenderChannelsData;
	  wsgiCallbackTableData(controldatabase,'channels',callback,callbackoptions)
}
function RenderChannelsData(channelsdata,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }

	// Grab only a single channel if we pass that option
    // This first option grabs an element by the passed index
	if (callbackoptions.hasOwnProperty('index')) {
		RenderWidgets(controldatabase,'channels',channelsdata[callbackoptions.index-1])
	}
	else if (callbackoptions.hasOwnProperty('indexselector')) {
        // We pass an index selector id and get the selected index value.
        // we get the channel based on the value of the selector
		RenderWidgets(controldatabase,'channels',channelsdata[$('#'+callbackoptions.indexselector).prop('selectedIndex')])
	}
	else {
	  RenderWidgetsFromArray(controldatabase,'channels',channelsdata)
	}
	var channelnames=[];
	for (var i=0;i<channelsdata.length;i++) {
		channelnames.push(channelsdata[i].name);
	}
	  $('.channelselect').each(function(){
		if ($('#' + this.id).length > 0) {
			UpdateSelect(this.id, channelnames);
		}
	});
}

//// Control Recipes
function UpdateControlRecipeNames(callbackoptions) {
	  var callback=RenderControlRecipeNames;
	  wsgiGetTableNames(recipedatabase,callback,callbackoptions)
}
function RenderControlRecipeNames(recipenames,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	var renderrecipenames=['none'];
	renderrecipenames.push(recipenames);
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateControlRecipeNames(callbackoptions)},callbackoptions.timeout)
	}

	$('.controlrecipeselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, renderrecipenames)
		}
	});
}

//// Outputs
function UpdateOutputsData(callbackoptions) {
	var callback=RenderOutputsData;
	wsgiCallbackTableData(controldatabase,'outputs',callback,callbackoptions)
}
function RenderOutputsData(outputstable,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateOutputsData(callbackoptions)},callbackoptions.timeout);
	}
	var outputs=['none'];
	for (var i=0; i<outputstable.length;i++){
		outputs.push(outputstable[i].name);
	}
    RenderWidgetsFromArray(controldatabase,'outputs',outputstable)
	$('.outputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, outputs);
		}
	});	
}

//// Inputs
function UpdateInputsData(callbackoptions) {
	var callback = RenderInputsData;
	wsgiCallbackTableData(controldatabase,'inputsdata',callback,callbackoptions)
}
function RenderInputsData(inputstable,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateInputsData(callbackoptions)},callbackoptions.timeout)
	}
	var inputs=['none'];
	for (var i=0; i<inputstable.length;i++){
		inputs.push(inputstable[i].id);
	}
    RenderWidgetsFromArray(controldatabase,'inputsdata',inputstable)
	$('.inputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, inputs);
			//console.log(inputs)
		}
	});	
}

//// Indicators This is not written yet!
function UpdateIndicatorsData(callbackoptions) {
	var callback=RenderIndicators;
	wsgiCallbackTableData(controldatabase,'indicators',callback,callbackoptions);
}
function RenderIndicators(indicatorsdata,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateIndicatorsData(callbackoptions)},callbackoptions.timeout);
	}
	console.log('time to render')
    RenderWidgetsFromArray(controldatabase,'indicators',indicatorsdata);
}

//// System Status
function UpdateSystemStatusData(callbackoptions) {
	var callback=RenderSystemStatusData;
	wsgiCallbackTableData(controldatabase,'systemstatus',callback,callbackoptions);
}
function RenderSystemStatusData(systemstatusdatalist,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (timeout>0) {
		setTimeout(function(){UpdateSystemStatusData(callbackoptions)},timeout);
	}
	// Option for controls (as opposed to indicators (not implemented yet
    // var updatesliders = callbackoptions.updatesliders || true;
	var systemstatusdata=systemstatusdatalist[0];
	RenderWidgets(controldatabase, 'systemstatus', systemstatusdata);
}

//// Metadata
function UpdatePlotMetadata(callbackoptions) {
	var callback=RenderPlotMetadata;
	wsgiCallbackTableData(logdatabase,'metadata',callback,callbackoptions);
}
function RenderPlotMetadata(metadata,callbackoptionsarg) {
    var callbackoptions = callbackoptionsarg || {};
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (callbackoptions.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + callbackoptions.timeoutclass).val()*1000;
    }
    else if (callbackoptions.hasOwnProperty('timeout')) {
        timeout=callbackoptions.timeout;
    }
    else {
        timeout=0;
    }
	if (timeout>0) {
		setTimeout(function(){UpdatePlotMetadata(callbackoptions)},timeout);
	}
	for (var i=0;i<metadata.length;i++){
        //$('.' + metadata[i].name.replace(' ','_') + 'points').html(88);
		$('.' + metadata[i].name.replace(/ /g,'_') + 'points').html(metadata[i].numpoints);
	    //alert('.' + metadata[i].name.replace(' ','_') + 'points')
	}
}

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
		 
		yaxis:{min:30, max:450,
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

function GetAndRenderLogData(callbackoptions){
	var callback=RenderLogData;
    // This section lets the timeout function get an updated value for the table
    // it should be retrieving. We can do it by channel or tablename, as long as we
    // keep the naming convention the same!

    if (callbackoptions.hasOwnProperty('tablenameid')) {
        callbackoptions.logtablename=$('#' + callbackoptions.tablenameid).val()
    }
    else if (callbackoptions.hasOwnProperty('channelnameid')) {
        callbackoptions.logtablename=$('#' + callbackoptions.channelnameid).val() + '_log'
    }
	wsgiCallbackTableData (logdatabase,callbackoptions.logtablename,callback,callbackoptions);
}
function GetAndRenderMultLogsData(logdatabase,callbackoptions){
    var callback=RenderMultLogsData;
    wsgiCallbackMultTableData(logdatabase,callbackoptions.tablenames,callback,callbackoptions)
}
function RenderMultLogsData(returnedlogdata,callbackoptions){

    // This function operates on multiple returned log tables
    // This means that the log data and seriesnames have an additional dimension
    // The plotids and results, however, do not.

    // We give this function [[seriesnames]] to get and [plotids]
    // to render to, as properties of the callbackoptions argument
    // We then use these to parse the passed datatable

    // We have l tables that we are getting data from
    // We get i series from each table
    // Each series is j points long.
    // We then render to k plotids

    //console.log(returnedlogdata)
    if (callbackoptions.timeout>0) {
        setTimeout(function(){GetAndRenderMultLogsData(callbackoptions)},callbackoptions.timeout);
    }
    for (i=0;i<callbackoptions.renderplotids.length;i++) {
        $('#' + callbackoptions.renderplotids[i]).html('');
    }
    var plotseriesarray=[];
    // For each log table
    var totalseriescount=0;
    for (var l=0;l<returnedlogdata.length;l++){
        // For the i-th series in hte l-th table
        for (var i=0;i<callbackoptions.seriesnames[l].length;i++){
            var currentseries=[];
            var seriesname=callbackoptions.seriesnames[l][i];
            for(var j=0;j<returnedlogdata[l].length;j++){
                currentseries.push([returnedlogdata[l][j].time,returnedlogdata[l][j][seriesname]]);
                for (var k=0;k<callbackoptions.renderplotids.length;k++){
                    // For now the options reside in the html. Probably most flexible this way.
                    // callbackoptions.renderplotoptions[k].series[totalseriescount].label=callbackoptions.logtablename + ' : ' + callbackoptions.seriesnames[l][i];
                }
            }
            plotseriesarray.push(currentseries);
            totalseriescount+=1;
        }
    }

    for (var i=0;i<callbackoptions.renderplotids.length;i++){
        $.jqplot(callbackoptions.renderplotids[i], plotseriesarray, callbackoptions.renderplotoptions[i]);
    }
}
function RenderLogData (returnedlogdata,callbackoptions) {
    // This function operates on a single returned log table
    //console.log(returnedlogdata)
    // We give this function [seriesnames] and [plotids]
    // to render to, as properties of the callbackoptions argument
	// We then use these to parse the passed datatable

	if (callbackoptions.timeout>0) {
		setTimeout(function(){GetAndRenderLogData(callbackoptions)},callbackoptions.timeout);
	}
	for (i=0;i<callbackoptions.renderplotids.length;i++) {
		$('#' + callbackoptions.renderplotids[i]).html('');
	}

	// for each seriesname, iterate over j data points,
    // then render to k plotids
    var plotseriesarray=[]
    for (var i=0;i<callbackoptions.seriesnames.length;i++){
        var currentseries=[]
        var seriesname=callbackoptions.seriesnames[i]
        for(var j=0;j<returnedlogdata.length;j++){
            currentseries.push([returnedlogdata[j].time,returnedlogdata[j][seriesname]])
            for (var k=0;k<callbackoptions.renderplotids.length;k++){
                callbackoptions.renderplotoptions[k].series[i].label=callbackoptions.logtablename + ' : ' + callbackoptions.seriesnames[i];
            }
        }
        plotseriesarray.push(currentseries)
        //console.log(currentseries)
    }
    for (i=0;i<callbackoptions.renderplotids.length;i++){
        $.jqplot(callbackoptions.renderplotids[i], plotseriesarray, callbackoptions.renderplotoptions[i]);
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