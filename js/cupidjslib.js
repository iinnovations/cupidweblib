// JavaScript Document

// Set static variables for controlstatus query
			
controldatabase='/var/www/data/controldata.db'
recipedatabase='/var/www/data/recipedata.db'
logdatabase='/var/www/data/logdata.db'
infodatabase='/var/www/data/deviceinfo.db'
systemdatabase='/var/www/data/systemdata.db'

// Define all the globals

var inputs=[]
var outputs=[]
var controlalgorithms=[]
var controlrecipes=[]

// 
function logdone(data){
	console.log('done')
}
// Generic jquerymobile render 

function togglestolamps(){
  $('.justalamp .ui-slider-label-a').css('text-indent','0')
  $('.justalamp .ui-slider-label-b').css('text-indent','0')
  $('.justalamp .ui-slider-inneroffset').html('')
  $('.justalamp .ui-slider').unbind()
}

function noclicky(){
	$('.noclicky').unbind()
}



// This are the generic rendering algorithms. These are used for the more specific table
// renderers. There are three types of tables dealth with here and several types of widgets
// 
// Flat table - use RenderWidgets
//   Columns are item names, values are values. One table row
//   classnames : tablename + columnname + widget type (optional)
//   example : systemstatuslastpicontrolfreqslider

// Array table - use RenderWidgetsFromArray
//   Columns are item names, values are values, multiple tablerows
//   classnames : tablename + columname + index (zero indexed)
//   example : channelssetpointvalue0

// Unique key table - use RenderWidgetsFromArrayByUniqueKey
//   See function below

function setWidgetValues(baseclass,value) {
	$(baseclass).html(value)
	$(baseclass + 'toggle').val(booleanbinarytoonoff(value)).slider("refresh")
	$(baseclass + 'automantoggle').val(value).slider("refresh")
	$(baseclass + 'slider').val(value).slider("refresh")
	$(baseclass + 'select').val(value)
}
function setWidgetActions(args){
  callback = args.callback || logdone
  updatetimeout=500
  var actionobj={'action':'setvalue','database':args.database,'table':args.tablename,'valuename':args.key}
  
  if ( args.condition !== undefined) {  
  	actionobj.condition=args.condition
	//alert('i have a condition: ' + args.condition)
  }
  
  //console.log(args)
  $(baseclass + 'toggle').unbind('slidestop')
  $(baseclass + 'toggle').on( 'slidestop', function( event ) { 
	var data=event.data
	value=$(this).val()
	//alert(value)
	actionobj.value=BooleansToIntegerString(value)
	// invoke ajax query with callback to update the interface when it's done
	
	setTimeout(function(){
		//console.log(actionobj)
		UpdateControl(actionobj,callback)
		
		},updatetimeout)
  });
  
  $(baseclass + 'automantoggle').unbind('slidestop')
  $(baseclass + 'automantoggle').on( 'slidestop', function( event ) { 
	var data=event.data
	value=$(this).val()
	//alert(value)
	actionobj.value=value
	// invoke ajax query with callback to update the interface when it's done
	setTimeout(function(){UpdateControl(actionobj,callback)},updatetimeout)
  });
  
  $(baseclass + 'slider').unbind('slidestop')
  $(baseclass + 'slider,  .ui-slider-input').unbind('change')
  // include change for text field and slidestop for slider
  $(baseclass + 'slider, .ui-slider-input').on('change', function( event ) {
	value=$(this).val()
	actionobj.value=value
	// invoke ajax query with callback to update the interface when it's done
	setTimeout(function(){UpdateControl(actionobj,callback)},updatetimeout)
  })
  $(baseclass + 'slider').on('slidestop', function( event ) { 
  var data=event.data
  value=$(this).val()
  actionobj.value=value
  // invoke ajax query with callback to update the interface when it's done
  setTimeout(function(){UpdateControl(actionobj,callback)},updatetimeout)
  });
  $(baseclass + 'select').unbind('change')
  $(baseclass + 'select').on( 'change', function( event ) { 
  var data=event.data
  value=$(this).val()
  //alert(value)
  actionobj.value=value
  // invoke ajax query with callback to update the interface when it's done
  setTimeout(function(){UpdateControl(actionobj,callback)},updatetimeout)
  });
}


// This works for a flat table only
function RenderWidgets(database,tablename,data,callbackarg) {
	  callback = callbackarg || logdone
	  var updatetimeout=500 // ms to wait to avoid duplicate events
	  $.each(data,function(key,value){
		  //console.log('key: ' + key + ' value: ' + value + ' element: ' + '.' + key + i)
		  // Set each possibility
		  baseclass='.' + tablename + key
		  setWidgetValues(baseclass,value)		  
		  setWidgetActions({baseclass:baseclass,database:database,tablename:tablename,key:key,callback:callback})
	  })
	  togglestolamps()
	  // callback
}

function RenderWidgetsFromArray(database,tablename,data,callbackarg) {
  callback = callbackarg || logdone
  var updatetimeout=500 // ms to wait to avoid duplicate events
  for (var i=0; i<data.length;i++){
	  index=i+1  
	  $.each(data[i],function(key,value){
    	  baseclass='.' + tablename + key + index
		  setWidgetValues(baseclass,value)
	      setWidgetActions({baseclass:baseclass,database:database,tablename:tablename,key:key,condition:'rowid='+index})
	  })
  }
  togglestolamps()
}

// So here we take a table with multiple rows and render widgets based on a unique key
// Say the unique key is 'item' and the table is 'metadata'
// Say the first row has items 'item1' and fields 'field1' and 'field2' with 'field1value1' and 'field2value2', etc.

// Class names would be metadataitem1field1, metdataitem1field2, etc.

function RenderWidgetsFromArrayByUniqueKey(args,data) {
  callback = args.callbackarg || logdone
  uniquekeyname=args.uniquekey || 'parameter'
  
  var updatetimeout=500 // ms to wait to avoid duplicate events
  for (var i=0; i<data.length;i++){
	  // Set each possibility
	  uniquekey=data[i].uniquekeyname
	  $.each(data[i],function(key,value){
		value=data.valuename
		baseclass='.' + tablename + uniquekeyname + key
		setWidgetValues(baseclass,value)
		setWidgetActions({baseclass:baseclass,database:args.database,tablename:args.tablename,key:args.key,condition:uniquekeyname+'='+uniquekey})
	  })
  }
  togglestolamps()
}


////////////////////////////////////////////////////////////////////////////
// Rendering database data to views

// Version and about data
function UpdateVersionsData(callbackoptions) {
	 var callback=RenderVersionsData
	 wsgiCallbackTableData(systemdatabase,'versions',callback,callbackoptions)
}
function RenderVersionsData (versionsdata,callbackoptions){
//set interval function if timeout value is passed and valid
    timeout=callbackoptions.timeout || 0
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateVersionsData(callbackoptions)},callbackoptions.timeout)
	}
	// Render the widgets. The RenderVersionsData callback is for setting widget actions,
	// so that it renders right after the value gets set
	RenderWidgetsFromArray(systemdatabase,'versions',versionsdata,RenderVersionsData)
}

// Metadata
function UpdateMetadata(callbackoptions) {
	 var callback=RenderMetadata
	 wsgiCallbackTableData(systemdatabase,'metadata',callback,callbackoptions)
}
function RenderMetadata (metadata,callbackoptions){
//set interval function if timeout value is passed and valid
    timeout=callbackoptions.timeout || 0
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateMetadata(callbackoptions)},callbackoptions.timeout)
	}
	// Manually done here. Only a couple items.
	$('.metadatadevicename').html(metadata[0].devicename)
	$('.metadatagroupname').html(metadata[0].groupname)
	
}

//// Control Algorithms
function UpdateControlAlgorithms(callbackoptions) {
	  var callback=RenderControlAlgorithms
	  wsgiCallbackTableData(controldatabase,'controlalgorithms',callback,callbackoptions)
}
function RenderControlAlgorithms(algorithmstable,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateControlAlgorithms(callbackoptions)},callbackoptions.timeout)
	}
	controlalgorithms=[]
	for (var i=0; i<algorithmstable.length;i++){
		controlalgorithms[i]=algorithmstable[i].name
	}
	$('.controlalgorithmselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, controlalgorithms)
		}
	});
}

//// Channels Data
function UpdateChannelsData(callbackoptions) {
	  var callback=RenderChannelsData
	  wsgiCallbackTableData(controldatabase,'channels',callback,callbackoptions)
}
function RenderChannelsData(channelsdata,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateChannelsData(callbackoptions)},callbackoptions.timeout)
	}
	RenderWidgetsFromArray(controldatabase,'channels',channelsdata)
}

//// Control Recipes
function UpdateControlRecipeNames(callbackoptions) {
	  var callback=RenderControlRecipeNames
	  wsgiGetTableNames(recipedatabase,callback,callbackoptions)
}
function RenderControlRecipeNames(recipenames,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateControlRecipeNames(callbackoptions)},callbackoptions.timeout)
	}
	$('.controlrecipeselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, recipenames)
		}
	});
}

//// Outputs
function UpdateOutputs(callbackoptions) {
	var callback=RenderOutputs
	wsgiCallbackTableData(controldatabase,'outputs',callback,callbackoptions)
}
function RenderOutputs(outputstable,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateOutputs(callbackoptions)},callbackoptions.timeout)
	}
	outputs=['none']
	for (var i=0; i<outputstable.length;i++){
		outputs.push(outputstable[i].name)
	}
	$('.outputselect').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, outputs)
		}
	});	
}

//// Inputs
function UpdateInputs(callbackoptions) {
	var callback=RenderInputs
	wsgiCallbackTableData(controldatabase,'inputsinfo',callback,callbackoptions)
}
function RenderInputs(inputstable,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateInputs(callbackoptions)},callbackoptions.timeout)
	}
	inputs=['none']
	for (var i=0; i<inputstable.length;i++){
		inputs.push(inputstable[i].id)
	}
	$('.selectinput').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateSelect(this.id, inputs)
		}
	});	
}

//// Indicators
function UpdateIndicators(callbackoptions) {
	var callback=RenderIndicators
	wsgiCallbackTableData(controldatabase,'indicators',callback,callbackoptions)
}
function RenderIndicators(indicatorsdata,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateInputs(callbackoptions)},callbackoptions.timeout)
	}
	// Database, tablename, data
	RenderWidgets(controldatabase,'indicators',indicatorsdata)
}

//// System Status
function UpdateSystemStatusData(callbackoptions) {
	var callback=RenderSystemStatusData
	wsgiCallbackTableData(controldatabase,'systemstatus',callback,callbackoptions)
}
function RenderSystemStatusData(systemstatusdatalist,callbackoptions) {
	//set interval function if timeout value is passed and valid
	timeout=callbackoptions.timeout || 0
	if (timeout>0) {
		setTimeout(function(){UpdateSystemStatusData(callbackoptions)},timeout)
	}
	
	// Option for controls (as opposed to indicators (not implemented yet
    updatesliders = callbackoptions.updatesliders || true
	systemstatusdata=systemstatusdatalist[0]
	RenderWidgets(controldatabase, 'systemstatus', systemstatusdata)
}

//// Metadata
function UpdatePlotMetadata(callbackoptions) {
	var callback=RenderPlotMetadata
	wsgiCallbackTableData(logdatabase,'metadata',callback,callbackoptions)
}
function RenderPlotMetadata(metadata,callbackoptions) {
	//set interval function if timeout value is passed and valid
	timeout=callbackoptions.timeout || 0
	if (timeout>0) {
		setTimeout(function(){UpdatePlotMetadata(callbackoptions)},timeout)
	}
	for (i=0;i<metadata.length;i++){
		$('.' + metadata[i].name.replace(' ','_') + 'points').html(metadata[i].numpoints)
		//alert('.' + metadata[i].name.replace(' ','_') + 'points')
	}
	//for (var i=0;i<tablenames.length;i++)
	//{
	//	//query.push('\'select ROM from ' + tablenames[i] + ' order by time limit 1\'')
	//	queryarray.push("select count(*) from \'" + tablenames[i] + "\'")
	//	queryarray.push("select time from \'" + tablenames[i] + "\' order by time limit 1")
	//}
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
            	callback(response)
            }
       });
};