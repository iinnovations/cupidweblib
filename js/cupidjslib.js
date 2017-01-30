// JavaScript Document

// Set static variables for controlstatus query
// These are aliases to be interpreted on the server.
var controldatabase='controldb';
var recipedatabase='recipedatadb';
var logdatabase='logdatadb';
var infodatabase='deviceinfodb';
var systemdatabase='systemdatadb';
var authdatabase='authlogdb';
var safedatabase='safedatadb'
var usersdatabase='usersdb'
var motesdatabase='motesdb'

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

function cupidjslibtest() {
    return true;
}
//////////////////////////////////////////////////////
//   Utility functions
//

function isvalidname(name) {
    if (name == '') {
        var returnval = false;
    }
    else {
        var returnval = true;
    }
    return returnval
}

function parseLogTableName(logtablename) {
    logtablename = logtablename || '';
    var result = {}
    var splitarray = logtablename.split("_")

    var type = 'unknown'
    var subtype = 'unknown'
    if (splitarray[0] == 'input') {
        type = 'input'
    }
    else if (splitarray[0] == 'channel') {
        type = 'channel'
    }
    if (splitarray.length > 1) {
        if (splitarray[1].indexOf('GPIO') >= 0) {
            subtype = 'GPIO'
        }
        else if (splitarray[1].indexOf('1wire') >= 0 || splitarray[1].indexOf('1wire')  >= 0) {
            subtype = '1Wire'
        }
    }
    result.tablename = logtablename;
    result.id = splitarray.slice(1,-1).join("_");
    result.type = type;
    result.subtype = subtype;
    return result

}

function processmodbusaddress(address) {
    var returndata = {}
    var mbaddress = parseInt(address)
    console.log(mbaddress)
    if (1 <= mbaddress <= 65536 || 100001 <= mbaddress <= 165536 || 300001 <= mbaddress <= 365536 || 400001 <= mbaddress <= 465536) {
        returndata.validaddress = true;
        if (1 <= mbaddress <= 65536 || 400001 <= mbaddress <= 465536) {
            returndata.mode = 'readwrite';
        }
        else {
            returndata.mode = 'read';
        }
        if (1 <= mbaddress <= 65536 || 100001 <= mbaddress <= 165536) {
            returndata.datasize = 'bit';
        }
        else {
            returndata.datasize = 'word'
        }
    }
    else {
       returndata.validaddress = false;
    }

    return returndata
}
//////////////////////////////////////////////////////
// Auth and user functions

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

function userDelete(options) {
    // Need to pass : usertodelete, session username, session hpass
    var options = options || {};
    options.usertodelete = options.usertodelete || '';
    options.sessionuserhpass = options.sessionuserhpass || '';
    options.sessionusername = options.sessionusername || '';
    options.action = 'userdelete'
    runwsgiActions(options)
}
function userAdd(options) {
    // Need to pass : usertodelete, session username, session hpass
    var options = options || {};
    options.usertoadd = options.usertoadd || '';
    options.sessionuserhpass = options.sessionuserhpass || '';
    options.sessionusername = options.sessionusername || '';
    options.action = 'useradd'
    runwsgiActions(options)
}

function userModify(options) {
    // Need to pass : usertodelete, session username, session hpass
    var options = options || {};
    options.usertomodify = options.usertomodify || ''
    options.sessionuserhpass = options.sessionuserhpass || '';
    options.sessionusername = options.sessionusername || '';
    options.action = 'usermodify'
    runwsgiActions(options)
}

//////////////////////////////////////////////////////
// Database table manipulation

function addChannel(channelname, callback){
    addDBRow(controldatabase,'channels',callback, ['name'],[channelname])
}
function addAction(name, callback){
    addDBRow(controldatabase,'actions',callback, ['name','operator'],[name,'greater'])
}
function addInterface(name, callback){
    addDBRow(controldatabase,'interfaces',callback, ['name'],[name,])
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

function addModbusIO(channelname, channeldata, callback){
    var propnames = ['interfaceid', 'register', 'length', 'mode', 'bigendian', 'reversebyte','format','options']
    var propvalues = [channeldata.interfaceid, channeldata.register, channeldata.length, channeldata.mode, channeldata.bigendian, channeldata.reversebyte, channeldata.format, channeldata.options]
    console.log(propvalues)
    // database, table, callback, valuenames,values
    if (propnames.length == propvalues.length) {
        addDBRow(controldatabase, 'modbustcp', callback, propnames, propvalues)
    }
    else {
        console.log('error: mismatch between value names and length. add not executed')
    }
}

//// These are functions that use the base get and render algorithms.
//// They are here to provide default options and make the
//// html a bit cleaner. Also makes it easy to refactor

/// These use generic GetAndRender Function

// Render as arrays

// Version and about data
function UpdateVersionsData(options) {
    options = options || {};
    options.database = systemdatabase;
    options.tablename = 'versions';
    getAndRenderTableData(options)
}

//// Control Algorithms
function updateControlAlgorithmsData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'controlalgorithms';
    options.selectorclass = 'controlalgorithmselect';
    getAndRenderTableData(options)
}

//// Control Algorithm Types
function UpdateControlAlgorithmTypesData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'algorithmtypes';
    options.selectorclass = 'algorithmtypeselect';
    getAndRenderTableData(options)
}

//// Channels Data
function updateChannelsData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'channels';
    options.selectorclass = 'channelselect';
    getAndRenderTableData(options)
}

function updateChannelIndicesData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'channels';
    options.selectortableitem = 'channelindex';
    options.selectorclass = 'channelindexselect';
    getAndRenderTableData(options)
}

//// Outputs
function updateOutputsData(options) {
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'outputs';
    options.selectorclass = 'outputselect';
    options.selectorhasnoneitem = true;
//    options.selectortableitem = 'id';
    getAndRenderTableData(options)
}

//// Inputs
function updateInputsData(options) {
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'inputs';
    options.selectorclass = 'inputselect';
    options.selectorhasnoneitem = true;
//    options.selectortableitem = 'id';
    getAndRenderTableData(options)
}

//// Interfaces
function updateInterfacesData(options) {
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'interfaces';
    options.selectorclass = 'interfaceselect';
    options.selectorhasnoneitem = true;
//    options.selectortableitem = 'id';
    getAndRenderTableData(options)
}

//// motes
function updateMotesData(options) {
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'remotes';
    options.selectorclass = 'remotesselect';
    options.selectorhasnoneitem = true;
//    options.selectortableitem = 'id';
    getAndRenderTableData(options)
}

//// MBTCP
function updateMBTCPData(options) {
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'modbustcp';
    options.selectorclass = 'mbtcpselect';
    options.selectorhasnoneitem = true;
//    options.selectortableitem = 'id';
    getAndRenderTableData(options)
}

//// Indicators
function updateIndicatorsData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'indicators';
    options.selectorclass = 'indicatorselect';
    options.selectortableitem = 'name';
    getAndRenderTableData(options)
}

//// Actions
function updateActionsData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'actions';
    options.selectorclass = 'actionselect';
    options.selectortableitem = 'name';
    getAndRenderTableData(options)
}

/// Single table row
// System Status
function updateSystemStatusData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'systemstatus';
    options.index = 1;
    getAndRenderTableData(options)
}

//// Network Status
function updateNetStatusData(options) {
    options = options || {};
    options.database = systemdatabase;
    options.tablename = 'netstatus';
    options.index = 1;
    getAndRenderTableData(options)
}

//// Netauths Data
function updateNetAuthsData(options) {
    options = options || {};
    options.database = safedatabase;
    options.tablename = 'wireless';
    options.selectorclass = 'ssidselect';
    options.selectorhasnoneitem = true;
    options.selectortableitem = 'SSID'
    getAndRenderTableData(options)
}

//// Netauths Data
function updateUsersData(options) {
    options = options || {};
    options.database = usersdatabase;
    options.tablename = 'users';
    getAndRenderTableData(options)
}

//// Netconfig Status
function updateNetConfigData(options) {
    options = options || {};
    options.database = systemdatabase;
    options.tablename = 'netconfig';
    options.index = 1;
    getAndRenderTableData(options)
}

// Metadata
function updateMetadata(options) {
    options = options || {};
    options.database = systemdatabase;
    options.tablename = 'metadata';
    options.index = 1;
    getAndRenderTableData(options)
}

// Unique render functions
//// Metadata
function updatePlotMetadata(options) {
	options = options || {};
    options.callback = renderPlotMetadata;
    options.database=logdatabase;
    options.tablename='metadata';
	wsgiCallbackTableData(options);
}
function renderPlotMetadata(metadataresponse,options, xhr) {
    options = options || {};
    metadataresponse = metadataresponse || {};
    var metadata = metadataresponse.data || [];
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing

    var timeout=0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }
	if (timeout>0) {
		setTimeout(function(){updatePlotMetadata(options)},timeout);
	}
	for (var i=0;i<metadata.length;i++){
        //$('.' + metadata[i].name.replace(' ','_') + 'points').html(88);
		$('.' + metadata[i].name.replace(/ /g,'_') + 'points').html(metadata[i].numpoints);
        //console.log('rendering ' + '.' + metadata[i].name + 'points')
        //console.log(metadata[i].numpoints)
	    //alert('.' + metadata[i].name.replace(' ','_') + 'points')
	}
}

//// Control Recipes - uses table names
function updateControlRecipeData(options) {
	 options.callback=renderControlRecipeData;
      options.database=recipedatabase;
	  wsgiGetTableNames(options)
}
function renderControlRecipeData(reciperesponse,options) {
    reciperesponse = reciperesponse || {};

    options = options || {};
    var jqmpage = options.jqmpage || false;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    var timeout=0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
    }

//    console.log(controlrecipenames)
	if (options.timeout>0) {
		setTimeout(function(){updateControlRecipeData(options)},options.timeout)
	}

    // condition for 304
    if (reciperesponse.hasOwnProperty('data')) {
        console.log('i have recipe data')
        controlrecipenames=['none'];
        var recipenames = reciperesponse.data;
        controlrecipenames.push(recipenames);
        $('.controlrecipeselect').each(function () {
            if ($('#' + this.id).length > 0) {
                updateSelect(this.id, controlrecipenames)
            }
        });
    }
    else {
        console.log('i do not have recipe data')
    }
}


// These guys create tables and table elements and then render them using the above
// functions, or not. The key part is creating table elements that can be automatically
// rendered. Eventually this will be a generic 'render table' function, but custom displays
// will always be necessary, as we don't want to render EVERYTHING at all times, and we also
// want to render things like text entry fields and selects


//// Control Inputs - also do ROM display table at same time
function updateInputsTable(options) {
    options=options || {};
	options.callback=renderInputsTable;
    options.tablename='inputs';
    options.database=controldatabase;
	wsgiCallbackTableData(options)
}
function renderInputsTable (datatable,options) {
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
	    	updateSelect(this.id, inputnames);
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
//    renderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

function UpdateOutputsTable(options) {
    options=options || {};
    options.callback=RenderOutputsTable
    options.tablename='outputs';
    options.database=controldatabase;
	wsgiCallbackTableData(options)
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
	    	updateSelect(this.id, outputnames);
		}
	});

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    var timeout=0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
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
//    renderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

function UpdateIOInfoTable(options) {
    options=options || {}
    options.callback=RenderIOInfoTable
    options.tablename='ioinfo';
    options.database=controldatabase;
	wsgiCallbackTableData(options)
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
//    renderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

function UpdateChannelsTable(options) {
    options = options || {};
	options.callback=RenderChannelsTable
    options.tablename='channels';
    options.database=controldatabase;
	wsgiCallbackTableData(options)
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
	    	updateSelect(this.id, channelnames);
		}
	});


    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    var timeout = 0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        timeout=options.timeout;
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
//    renderWidgetsFromArray(options.database,options.tablename,datatable,options)

}

function UpdateControlAlgorithmsTable(options) {
    options=options || {};
    options.callback=RenderControlAlgorithmsTable;
    options.tablename='controlalgorithms';
    options.database=controldatabase;
	wsgiCallbackTableData(options)
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
	    	updateSelect(this.id, controlalgorithmnames);
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
//    renderWidgetsFromArray(options.database,options.tablename,datatable,options)
}

////////////////////////////////////////////////////////////////////////////
// Misc

// this function gets the current time and renders it to an html element


function UpdateTimestamps(passedoptions){
	//console.log(passedoptions.timeout);
	if (passedoptions.timeout>0) {
		setTimeout(function(){UpdateTimestamps(passedoptions)},passedoptions.timeout);
	}
	var logreadtime=getStringTime()
	for (var i=0;i<passedoptions.renderids.length;i++){
		$("#"+passedoptions.renderids[i]).html(logreadtime);
	}
}

/////////////////////////////////////////////////////
// Get stuff into DOM
//

function getAndRenderToDOM(options) {
    // need database, table, object
    options.callback = renderToDOM
    wsgiCallbackTableData(options)
}

function renderToDOM(dataresponse, options, xhr) {
    if (xhr.status == 200) {
        //console.log(dataresponse.data)
        window[options.objectname] = dataresponse.data;
    }
}

/////////////////////////////////////////////////////
// Plot Stuff
//

if (typeof $.jqplot !== "undefined"){

var channelOptionsObj={
	legend: {
	  show: true,
	  location: 'sw',     // compass direction, nw, n, ne, e, se, s, sw, w.
	  xoffset: 12,        // pixel offset of the legend box from the x (or x2) axis.
	  yoffset: 12,        // pixel offset of the legend box from the y (or y2) axis.
      fontSize: '18pt'
	},
	axes:{
		xaxis:{
			renderer:$.jqplot.DateAxisRenderer,
			tickOptions:{mark:'inside'}
		},
		 
		yaxis:{
            autoscale:true,
			tickOptions:{mark:'inside'}
		},
		y2axis:{
            autoscale: true,
		  min:-200,
		  max:200,
		  ticks:[-200,-100,0,100,200],
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
		 
		yaxis:{
            autoscale:true,
			tickOptions:{mark:'inside'}
		},  
		y2axis:{
            autoscale: true,
		  min:-200,
		  max:200,
		  ticks:[-200,-100,0,100,200],
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
	  {label: 'Control Value',yaxis:'yaxis'},
	  {label: 'Setpoint Value',yaxis:'yaxis'},
	  {label: 'Action (%)',yaxis:'y2axis'} 
	]
};

function getAndRenderLogData(options){
    // This section lets the timeout function get an updated value for the table
    // it should be retrieving. We can do it by channel or tablename, as long as we
    // keep the naming convention the same!
    options = options || {};
    console.log(options);
    if (options.hasOwnProperty('tablenameid')) {
        options.tablename=$('#' + options.tablenameid).val()
    }
    else if (options.hasOwnProperty('channelnameid')) {
        options.tablename='channel_' + $('#' + options.channelnameid).val() + '_log'
    }
    // length is passed in with options object
    options.database = logdatabase;
    //var callback=renderLogData;
    options.callback = renderLogData;
	wsgiCallbackTableData(options);
}

function renderLogData (dataresponse,options) {
    //console.log('Rendering: ' + options.logtablename);

    if (options.timeout>0) {
		setTimeout(function(){getAndRenderLogData(options)},options.timeout);
    }

    if (dataresponse.hasOwnProperty('data')) {
        var returnedlogdata = dataresponse.data;
        // This function operates on a single returned log table

        // We give this function [seriesnames] and [plotids]
        // to render to, as properties of the options argument
        // We then use these to parse the passed datatable


        for (i = 0; i < options.renderplotids.length; i++) {
            $('#' + options.renderplotids[i]).html('');
        }
        if (!options.hasOwnProperty('serieslabels')) {
            options.serieslabels = [];
            for (var i = 0; i < options.seriesnames.length; i++) {
                options.serieslabels.push('')
            }
        }
        // for each valuename, iterate over j data points,
        // then render to k plotids
        var plotseriesarray = [];
        for (var i = 0; i < options.seriesnames.length; i++) {

            var currentseries = [];
            var seriesname = options.seriesnames[i];
            var serieslabel = options.serieslabels[i];
            for (var j = 0; j < returnedlogdata.length; j++) {
                currentseries.push([returnedlogdata[j].time, returnedlogdata[j][seriesname]]);
                for (var k = 0; k < options.renderplotids.length; k++) {
                    options.renderplotoptions[k].series[i].label = serieslabel + ' : ' + seriesname;
                }
            }
            plotseriesarray.push(currentseries);
            //console.log(currentseries)
        }
        for (i = 0; i < options.renderplotids.length; i++) {
            $.jqplot(options.renderplotids[i], plotseriesarray, options.renderplotoptions[i]);
        }
    }
    else {
        console.log('no data returned, so no plot modification.')
    }
}

function getAndRenderMultLogsData(options){
    options = options || {};
    options.callback=renderMultLogsData;
    //options.callback=logdone;
    options.database = logdatabase;
    wsgiCallbackMultTableData(options)
}

function renderMultLogsData(returnedlogdataresponse,options, xhr){
    options=options || {};
    returnedlogdataresponse = returnedlogdataresponse || {};
    var returnedlogdata = returnedlogdataresponse.data || [];
    console.log(options.serieslabels)

    //[datatable, datatable, datatable]

    // This function operates on multiple returned log tables
    // This means that the log data and seriesnames have an additional dimension
    // The plotids and results, however, do not.

    // We give this function [[seriesnames]] to get and [plotids]
    // to render to, as properties of the options argument
    // We then use these to parse the passed datatable

    // logdata[series][points][name of series element]

    // if we want to render labels, options.serieslabels, value specified by
    // options.labelincludevalue, options.labelvalueprecision

    var timeout =0;
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout=$('.' + options.timeoutclass).val()*1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        var timeout=options.timeout;
    }

    if (options.hasOwnProperty('auxcallback')) {
        if (timeout>0) {
            //console.log('i am an auxcallback!')
            setTimeout(options.auxcallback, timeout);
        }
        // one-off callback (this is unnecessary syntax, but here to remind us of what we're doing
        else{
            options.auxcallback()
        }
	}
    // If no data (could be 304 not modified), do absolutely nothing with plots
    //console.log(returnedlogdata)
    if (returnedlogdata.length > 0) {
        options.renderplotids = options.renderplotids || [];
        for (i=0;i<options.renderplotids.length;i++) {
            $('#' + options.renderplotids[i]).html('');
        }
        var plotseriesarray=[];

        // there are l tables, each containing i points
        // The returned data is flattened, so we use a total series count to get through it
        // The series names are nested
        //     k is a series group
        //     l is a series within a group
        var totalseriescount = 0;
        for (var k=0;k<options.serieslabels.length;k++) {
            console.log('length: ' + returnedlogdata.length)
            // For the s-th series in the l-th dataset

            console.log(options.serieslabels[k].length)

            for (var l = 0; l < options.serieslabels[k].length; l++) {
                var currentseries = [];
                var seriesname = options.seriesnames[k][l];
                console.log(seriesname)

                var serieslabel = options.serieslabels[k][l];
                var seriesaxis = options.seriesaxes[k][l] || 'yaxis';
                var numpoints = returnedlogdata[totalseriescount].length;

                if (options.labelincludevalue) {
                    //                get last point, and round with set precision
                    //console.log(returnedlogdata[totalseriescount])
                    console.log(options.includelabelvalueprecision)
                    serieslabel += ': ' + Math.round(returnedlogdata[l][0][seriesname] * Math.pow(10, options.includelabelvalueprecision)) / Math.pow(10, options.includelabelvalueprecision)
                    //                serieslabel += ': ' + Math.round(returnedlogdata[l][serieslength-1][seriesname])
                }
                // squirt in the data
                console.log(numpoints)
                for (var p=0;p<numpoints;p++) {
                    currentseries.push([returnedlogdata[totalseriescount][p].time, returnedlogdata[totalseriescount][p][seriesname]]);
                }
                console.log(returnedlogdata[totalseriescount])
                console.log(currentseries)
                for (var m = 0; m < options.renderplotids.length; m++) {
                    // For now the options reside in the html. Probably most flexible this way.
                    //                    options.renderplotoptions[k].series[totalseriescount].label=options.serieslabels[l][i];
                    options.renderplotoptions[m].series[totalseriescount].label = serieslabel;
                    options.renderplotoptions[m].series[totalseriescount].yaxis = seriesaxis;
                    //console.log('assigning ' + seriesaxis + ' to ' + serieslabel)
                }
                plotseriesarray.push(currentseries);

                totalseriescount += 1;
            }
        }
        for (var i = 0; i < options.renderplotids.length; i++) {
            $.jqplot(options.renderplotids[i], plotseriesarray, options.renderplotoptions[i]);
            globaldata = plotseriesarray;
        }
    }
    else {
        //console.log('No data returned, so no plot modification. Status: ' + xhr.status)
    }
}

} // if jqplot

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


function setUserAuths(args){
    actionobj=args;
    args.action='usermodify'
    // put some more stuff in here.
}