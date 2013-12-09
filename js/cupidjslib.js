// JavaScript Document

// Set static variables for controlstatus query
			
controldatabase='/var/www/data/controldata.db'
recipedatabase='/var/www/data/recipedata.db'
logdatabase='/var/www/data/logdata.db'
infodatabase='var/www/data/deviceinfo.db'

// Define all the globals

var inputs=[]
var outputs=[]
var controlalgorithms=[]
var controlrecipes=[]

// Generic jquerymobile render 

function togglestolamps(){
  $('.justalamp .ui-slider-label-a').css('text-indent','0')
  $('.justalamp .ui-slider-label-b').css('text-indent','0')
  $('.justalamp .ui-slider-inneroffset').html('')
  $('.justalamp .ui-slider').unbind()
}

function RenderWidgetsFromArray(data,prefix) {
  for (var i=0; i<data.length;i++){
	  $.each(data[i],function(key,value){
		  //console.log('key: ' + key + ' value: ' + value + ' element: ' + '.' + key + i)
		  // Set each possibility
		  $('.' + prefix + key + i).html(value)
		  $('.' + prefix + key + 'toggle' + i).val(booleanbinarytoonoff(value)).slider("refresh")
		  $('.' + prefix + key + 'automantoggle' + i).val(value).slider("refresh")
		  $('.' + prefix + key + 'slider' + i).val(value).slider("refresh")
		  $('.' + prefix + key + 'select' + i).val(value)	  
	  })
  }
  togglestolamps()
}

function RenderWidgets(data,prefix) {
	  $.each(data,function(key,value){
		  //console.log('key: ' + key + ' value: ' + value + ' element: ' + '.' + key + i)
		  // Set each possibility
		  $('.' + prefix + key).html(value)
		  $('.' + prefix + key + 'toggle').val(booleanbinarytoonoff(value)).slider("refresh")
		  $('.' + prefix + key + 'automantoggle').val(value).slider("refresh")
		  $('.' + prefix + key + 'slider').val(value).slider("refresh")
		  $('.' + prefix + key + 'select').val(value)
		  
		  //console.log('.' + prefix + key + ' : ' + value)
	  })
	  togglestolamps()
}


////////////////////////////////////////////////////////////////////////////
// Rendering database data to views

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
	$('.selectcontrolalgorithm').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateInput(this.id, controlalgorithms)
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
	RenderWidgetsFromArray(channelsdata,'channel')
}

//// Control Recipes
function UpdateControlRecipes(callbackoptions) {
	  var callback=RenderControlRecipes
	  wsgiCallbackTableData(controldatabase,'controlrecipes',callback,callbackoptions)
}
function RenderControlRecipes(recipestable,callbackoptions) {
	//set interval function if timeout value is passed and valid
	if (callbackoptions.timeout>0) {
		setTimeout(function(){UpdateControlRecipes(callbackoptions)},callbackoptions.timeout)
	}
	controlrecipes=[]
	for (var i=0; i<recipestable.length;i++){
		controlrecipes[i]=recipestable[i].name
	}
	$('.selectcontrolrecipe').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateInput(this.id, controlrecipes)
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
	$('.selectoutput').each(function(){
		if ($('#' + this.id).length > 0) {
	    	UpdateInput(this.id, outputs)
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
	    	UpdateInput(this.id, inputs)
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
	RenderWidgets(indicatorsdata,'indicators')
}

//// System Status
function UpdateSystemStatusData(callbackoptions) {
	var callback=RenderSystemData
	wsgiCallbackTableData(controldatabase,'systemstatus',callback,callbackoptions)
}
function RenderSystemData(systemdatalist,callbackoptions) {
	//set interval function if timeout value is passed and valid
	timeout=callbackoptions.timeout || 0
	if (timeout>0) {
		setTimeout(function(){UpdateSystemStatusData(callbackoptions)},timeout)
	}
	
	// Option for controls (as opposed to indicators (not implemented yet
    updatesliders = callbackoptions.updatesliders || true
	
	systemdata=systemdatalist[0]
	//set interval function if timeout value is passed and valid
	//console.log(systemdata)
	RenderWidgets(systemdata,'')
	//old way
	/*
	$(".picontrolenabledslider").val(booleanbinarytoonoff(systemdata.picontrolenabled)).slider("refresh")
	$(".picontrolstatusslider").val(booleanbinarytoonoff(systemdata.picontrolstatus)).slider("refresh")
	
	$(".outputsenabledstatusslider").val(booleanbinarytoonoff(systemdata.enableoutputs)).slider("refresh")
	$(".outputsenabledslider").val(booleanbinarytoonoff(systemdata.enableoutputs)).slider("refresh")
	
	$(".inputsreadenabledslider").val(booleanbinarytoonoff(systemdata.inputsreadenabled)).slider("refresh")
	$(".inputsreadstatusslider").val(booleanbinarytoonoff(systemdata.inputsreadstatus)).slider("refresh")
	
	$(".sessioncontrolenabledslider").val(booleanbinarytoonoff(systemdata.sessioncontrolenabled)).slider("refresh")
	$(".sessioncontrolstatusslider").val(booleanbinarytoonoff(systemdata.sessioncontrolstatus)).slider("refresh")
	
	$(".picontrolfreq").html(systemdata.picontrolfreq)
	$(".picontrolfreqslider").val(systemdata.picontrolfreq).slider("refresh")
	$(".lastpicontrolpoll").html(systemdata.lastpicontrolpoll)
	
	$(".inputsreadfreq").html(systemdata.inputsreadfreq)
	$(".inputsreadfreqslider").val(systemdata.inputsreadfreq).slider("refresh")
	$(".lastinputspoll").html(systemdata.lastinputspoll)
	*/		
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