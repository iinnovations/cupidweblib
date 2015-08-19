// JavaScript Document

// Set static variables for controlstatus query

//////////////////////////////////////////////
var boatname = 'Hull39'
//var dataroot = '/var/boatdata/controldata/'
var dataroot = '/var/www/vmsdemo/data/'
//////////////////////////////////////////////

controldatabase = dataroot + boatname + 'control.db';
datamapdatabase = dataroot + boatname + 'datamap.db';
datareadlogdatabase = dataroot + boatname + 'datareadlog.db';
logdatabase = dataroot + boatname + 'datalog.db';


// Define all the globals.
// We define these globally so that when we render tables that need them
// they can grab them if they have already been defined. This way we don't need
// to refetch selector data every time we build a table from scratch.

//// HVAC Data
function UpdateChannelsData(options) {
    options.database = datamapdatabase
    options.tablename = 'datamap'
    GetAndRenderTableData(options)
}

/// General Panel Update Function
function processDatamapData(datatable) {

    // We are going to use unitnames as an index for a list of objects with the properties we retrieve
    var datanames=[];
    var datavals=[];
    var datareadtimes=[];
    var unitindex=-1;
    var unitid = '';

    for (var i=0; i<datatable.length;i++){

        // get rid of spaces to make these class-friendly
        var dataname = datatable[i].datadescription1.split(' ').join('_').replace('(','').replace(')','');
        datanames.push(dataname);
        datavals.push(datatable[i].processedvalue );
        datareadtimes.push(datatable[i].valuereadtime);
    }
    return {datanames:datanames, datavals:datavals, datareadtimes:datareadtimes}
}
function updateDatamapPanelData(options) {
    //console.log('i am updating datamapdata')
    $('.statusmessage').html('Updating..')
    options = options || {}
    options.database = datamapdatabase;
    options.tablename = 'datamap';
    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    options.callback = renderDatamapPanelData;
    wsgiCallbackTableData(options)
}
function renderDatamapPanelData(response, options, xhr){

    // Set interval function. We either pass a class to retrieve it from,
        // a static value, or nothing
    var timeout = options.timeout || 0;
    if (options.hasOwnProperty('timeoutclass')) {
        timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    if (timeout > 0) {
        setTimeout(function () {
            updateDatamapPanelData(options)
        }, timeout);
    }
    if (xhr.status == "200") {
        var processeddata = processDatamapData(response.data);

        var datanames = processeddata.datanames;
        var datavalues = processeddata.datavals;
        var datareadtimes = processeddata.datareadtimes;


        //console.log(datanames)
        for (var i = 0; i < datanames.length; i++) {
                            //console.log(datanames[i] + ' : ' + datavalues[i])
                    //console.log('.' + datanames[i] + 'value')
            //        RenderWidgets('', datanames[i],datavalues[i])
            //        RenderWidgets('', datanames[i] + 'readtime',datareadtimes[i])
            setWidgetValues('.' + datanames[i] + 'value', datavalues[i], {jqmpage: true})
            setWidgetValues('.' + datanames[i] + 'readtime', datareadtimes[i], {jqmpage: true})
        }
    }
    else {
        console.log(xhr.status);
    }
    $('.statusmessage').html('')
}

/// probably unnecessary

function renderFlatTableData(datatable, options){

    var processeddata = datatable;
    console.log(processeddata)
    var datanames = processeddata.datanames;
    var datavalues = processeddata.datavals;
    var datareadtimes = processeddata.datareadtimes;

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    var timeout = options.timeout || 0;
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    if (timeout > 0) {
        setTimeout(function () {
            updateDatamapPanelData(options)
        }, timeout);
    }
    for (var i=0; i<datanames.length; i++) {
//                console.log(datanames[i] + ' : ' + datavalues[i])
        console.log('.' + datanames[i] + '_value')
        setWidgetValues('.' + datanames[i] + '_value', datavalues[i])
        setWidgetValues('.' + datanames[i] + '_readtime', datareadtimes[i])
    }
    $('.statusmessage').html('')
}

// Add a simple wrapper for system data
function updateSystemPanelData(options) {

    GetAndRenderTableData({database:controldatabase, tablename:'system', index:1, jqmpage:true})
}

//// Actions
function updateActionsData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'actions';
    options.selectorclass = 'actionselect';
    GetAndRenderTableData(options)
}

/// Database manipulation
function addAction(name, callback){
    addDBRow(controldatabase,'actions',callback, ['name'],[name])
}

// Populate