// JavaScript Document

// Set static variables for controlstatus query

function updateBrewIndexPanelData(options) {
    //console.log('i am updating brewdata')
    $('.statusmessage').html('Updating..')
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'channels';

    // THis is all stuff we don't use here.
    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    options.callback = renderBrewIndexPanelData;
    wsgiCallbackTableData(options)
}

function renderBrewIndexPanelData(response) {
    console.log('done');
}

function updateTanksPanelData(){
    console.log('nothing here')
}

function renderTanksPanelData(response) {
    console.log('done')
}