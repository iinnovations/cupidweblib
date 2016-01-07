// JavaScript Document

// Set static variables for controlstatus query

function updateBrewPanelIndexData(options) {
    //console.log('i am updating brewdata')
    $('.statusmessage').html('Updating..')
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'channels';

    // THis is all stuff we don't use here.
    // This searches fields for values. So in this case we may search 'dataclasses' for 'index'
    // This way we can add the value 'index' to dataclasses and it will render values.

    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    options.callback = renderBrewPanelIndexData;
    wsgiCallbackTableData(options)
}

function renderBrewPanelIndexData(response, options, xhr) {
    console.log(response);
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateBrewPanelIndexData(options)
        }, options.timeout);
    }
    if (response.hasOwnProperty('data')) {
        var data = response.data;
        var string = ''
        for (var i = 0; i < data.length; i++) {
            string += data[i].name + ':' + data[i].controlvalue;
            if (i < data.length -1 ) {
                string += ',';
            }
        }
        console.log(string);
        $('#brewpanelindexaside').html(string);
    }
}

function updateTanksIndexData(options) {
    //console.log('i am updating brewdata')
    $('.statusmessage').html('Updating..')
    options = options || {}
    options.database = controldatabase;
    options.tablename = 'channels';

    // THis is all stuff we don't use here.
    // This searches fields for values. So in this case we may search 'dataclasses' for 'index'
    // This way we can add the value 'index' to dataclasses and it will render values.

    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    options.callback = renderTanksIndexData;
    wsgiCallbackTableData(options)
}

function renderTanksIndexData(response, options, xhr) {
    console.log(response);
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateTanksIndexData(options)
        }, options.timeout);
    }
    if (response.hasOwnProperty('data')) {
        var data = response.data;
        var string = data.length + ' Tanks Online'

        $('#tanksindexaside').html(string);
    }
}
function updateTanksPanel(options){
    options = options || {};
    options.renderid = options.renderid || "tankslist";
    options.doLCDDisplays = true;
    options.database = controldatabase;
    options.tablename = 'channels';
    options.likecriterion = 'dataclasses';
    options.likecriterionvalue = 'tankspanel';

    options = addConditionsFromCriterion(options);
    options.callback = renderTanksPanel;
    wsgiCallbackTableData(options)
}

function renderTanksPanel(response, options, xhr) {
    options = options || {}
    var selector = $('#' + options.renderid);
    //$('#' + options.renderid).html('');

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateTanksPanel(options)
        }, options.timeout);
    }

    if (response.hasOwnProperty('data')) {
        var data = response.data;
        selector.html('');
        for (var i = 0; i < data.length; i++) {
            var channelname = data[i].name;
            var cleanchannelname = data[i].name.replace(/ /g,'_');
            var htmlstring = '';
            htmlstring += '<li>' +
                '<a style="line-height:1.2em" data-rel="popup" href="#' + cleanchannelname + 'svpopup">' +
                '<img src="img/tiles/brewtank.png" class="ui-li-thumb" >' +
                '<h2 class="tiletitle">' + channelname + '</h2>' +
                '<div align="right">' +
                    '<p style="line-height:1.2em; margin:0">' +
                    '<span class="subheadtext pvtext">PV: <canvas id="' + cleanchannelname + 'pvdisplay" width="120" height="30"></canvas><br />SV: <canvas id="' + cleanchannelname + 'svdisplay" width="120" height="30"></canvas></span>' +
                    '<span class="subheadjusttext" >PV: <span class="' + cleanchannelname + 'pvjusttext" >?</span>&nbsp;  SV: <span class="' + cleanchannelname + 'svjusttext">?</span></span>' +
                    '</p>' +
                '</div>' +
                '<p class="ui-li-aside ' + cleanchannelname + 'runmodecontainer">Mode:<span class="' + cleanchannelname + 'runmode">?</span></p>' +
                '</a>' +
            '</li>' +
            '<div data-role="popup" id="' + cleanchannelname + 'svpopup" data-overlay-theme="a" data-theme="a" data-dismissible="true" style="max-width:400px;" class="ui-corner-all">' +
                '<div data-role="header" data-theme="a" class="ui-corner-top ui-dialog-header">' +
                    '<h3>Setpoint for  ' + cleanchannelname + ' </h3>' +
                '</div>' +
                '<div data-role="content" data-theme="a" class="ui-corner-bottom ui-dialog-content" style="padding:15px">' +
                    '<h3 class="ui-title">Set new value for ' + cleanchannelname + '</h3>' +
                    '<input type="range" name="' +  cleanchannelname + 'setpointvalueslider" id="' + cleanchannelname + 'setpointvalueslider" value="' + data[i].setpointvalue + '" min="32" max="212" />' +
                    '<a style="margin-top:25px" data-role="button" data-icon="check" data-theme="f" id="set' + cleanchannelname + 'setpointvalueconfirm">Set</a>' +
                '</div>' +
            '</div>'
            selector.append(htmlstring);
            $('#set' + cleanchannelname + 'setpointvalueconfirm').on('click',{i:i, cleanchannelname:cleanchannelname},function(event){
                var cleanchannelname = event.data.cleanchannelname;
                var setpointvalue = $('#' + cleanchannelname + 'setpointvalueslider').val();
                //alert("You chose to set the value for channel " + channelname + ", with value " + setpointvalue)
                runwsgiActions({action:'setvalue',database:controldatabase, table:'channels', valuename:'setpointvalue', value:setpointvalue, condition:'name=\"' + cleanchannelname.replace(/_/g,' ') + '\"'})
                $('#' + cleanchannelname + 'svpopup').popup('close');
            });
            if (options.doLCDDisplays) {
                doLCD({displayid:cleanchannelname + 'pvdisplay', value: data[i].controlvalue})
                doLCD({displayid:cleanchannelname + 'svdisplay', value: data[i].setpointvalue})


                $('.'+ cleanchannelname +'pvjusttext').text(zeropad(data[i].controlvalue,2,1)  + '    ')
                //console.log(data[i].controlvalue)
                //console.log(zeropad(data[i].controlvalue,2,1))
                $('.'+ cleanchannelname +'svjusttext').text(zeropad(data[i].setpointvalue,2,1))
                //console.log(channelname + 'pvdisplay')
            }
            if (data[i].data != '') {
                //console.log('there is json data')
                var parseddata = jsonstringparser(data[i].data)
                if (parseddata.run == '0') {
                    //console.log('stop mode  for .' + channelname + 'runmode')
                    $('.' + cleanchannelname + 'runmode').text('Stop');
                    $('.' + cleanchannelname + 'runmodecontainer').css('background-color', 'red');
                }
                else if (parseddata.run == '1') {
                    //console.log('run mode  for .' + channelname + 'runmode')
                    $('.' + cleanchannelname + 'runmode').text('Run');
                    $('.' + cleanchannelname + 'runmodecontainer').css('background-color', 'green');
                }
            }
        }
        selector.trigger('create');
        selector.listview('refresh');

    }
    else {
        console.log('no new data.')
    }
}

function updateTanksPanelData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'channels';
    options.callback = renderTanksPanelData;
    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    wsgiCallbackTableData(options)
}

function renderTanksPanelData(response, options, xhr) {
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateTanksPanelData(options)
        }, options.timeout);
    }

    if (response.hasOwnProperty('data')) {
        var data = response.data;
        var doLCDDisplays = options.doLCDDisplays || false;
        var channelnames = [];
        for (var i = 0; i < data.length; i++) {
            var channelname = data[i].name.replace(/ /g, '_');
            channelnames.push(channelname);
            setWidgetValues(channelname + 'pv', data[i].controlvalue, {jqmpage: true});
            setWidgetValues(channelname + 'sv', data[i].setpointvalue, {jqmpage: true});
            //console.log('rendering ' + channelname + ' with ' + data[i].controlvalue + ' and ' + data[i].setpointvalue)
            if (doLCDDisplays) {
                doLCD({displayid: channelname + 'pvdisplay', value: data[i].controlvalue})
                doLCD({displayid: channelname + 'svdisplay', value: data[i].setpointvalue})

                $('.' + channelname + 'pvjusttext').text(zeropad(data[i].controlvalue, 2, 1) + '    ')
                //console.log(data[i].controlvalue)
                //console.log(zeropad(data[i].controlvalue,2,1))
                $('.' + channelname + 'svjusttext').text(zeropad(data[i].setpointvalue, 2, 1))
                //console.log(channelname + 'pvdisplay')
            }
            if (data[i].data != '') {
                //console.log('there is json data')
                var parseddata = jsonstringparser(data[i].data)
                if (parseddata.run == '0') {
                    //console.log('stop mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Stop');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'red');
                }
                else if (parseddata.run == '1') {
                    //console.log('run mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Run');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'green');
                }
            }
            else {
                console.log('no json data')
            }
        }
        tanksdata = data;
    }

}

function updateBrewPanel(options){
    options = options || {};
    options.renderid = options.renderid || "brewlist";
    options.doLCDDisplays = true;
    options.database = controldatabase;
    options.tablename = 'channels';
    options.likecriterion = 'dataclasses';
    options.likecriterionvalue = 'brewpanel';

    options = addConditionsFromCriterion(options);
    options.callback = renderBrewPanel;
    wsgiCallbackTableData(options)
}

function renderBrewPanel(response, options, xhr) {
    options = options || {}
    var selector = $('#' + options.renderid);
    //$('#' + options.renderid).html('');

    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateBrewPanel(options)
        }, options.timeout);
    }

    if (response.hasOwnProperty('data')) {
        var data = response.data;
        selector.html('');
        for (var i = 0; i < data.length; i++) {
            var channelname = data[i].name.replace(/ /g,'_');
            var htmlstring = '';
            htmlstring += '<li>' +
                '<a style="line-height:1.2em" data-rel="popup" href="#' + channelname + 'svpopup">' +
                '<img src="img/tiles/brewtank.png" class="ui-li-thumb" >' +
                '<h2 class="tiletitle">' + channelname + '</h2>' +
                '<div align="right">' +
                    '<p style="line-height:1.2em; margin:0">' +
                    '<span class="subheadtext pvtext">PV: <canvas id="' + channelname + 'pvdisplay" width="120" height="30"></canvas><br />SV: <canvas id="' + channelname + 'svdisplay" width="120" height="30"></canvas></span>' +
                    '<span class="subheadjusttext" >PV: <span class="' + channelname + 'pvjusttext" >?</span>&nbsp;  SV: <span class="' + channelname + 'svjusttext">?</span></span>' +
                    '</p>' +
                '</div>' +
                '<p class="ui-li-aside ' + channelname + 'runmodecontainer">Mode:<span class="' + channelname + 'runmode">?</span></p>' +
                '</a>' +
            '</li>' +
            '<div data-role="popup" id="' + channelname + 'svpopup" data-overlay-theme="a" data-theme="a" data-dismissible="true" style="max-width:400px;" class="ui-corner-all">' +
                '<div data-role="header" data-theme="a" class="ui-corner-top ui-dialog-header">' +
                    '<h3>Setpoint for  ' + channelname + ' </h3>' +
                '</div>' +
                '<div data-role="content" data-theme="a" class="ui-corner-bottom ui-dialog-content" style="padding:15px">' +
                    '<h3 class="ui-title">Set new value for ' + channelname + '</h3>' +
                    '<input type="range" name="' + channelname + 'setpointvalueslider" id="' + channelname + 'setpointvalueslider" value="' + data[i].setpointvalue + '" min="32" max="212" />' +
                    '<a style="margin-top:25px" data-role="button" data-icon="check" data-theme="f" id="set' + channelname + 'setpointvalueconfirm">Set</a>' +
                '</div>' +
            '</div>'
            selector.append(htmlstring);
            $('#set' + channelname + 'setpointvalueconfirm').on('click',{i:i, channelname:channelname},function(event){
                var channelname = event.data.channelname;
                var setpointvalue = $('#' + channelname + 'setpointvalueslider').val();
                //alert("You chose to set the value for channel " + channelname + ", with value " + setpointvalue)
                runwsgiActions({action:'setvalue',database:controldatabase, table:'channels', valuename:'setpointvalue', value:setpointvalue, condition:'name=\"' + channelname.replace(/ /g,'_') + '\"'})
                $('#' + channelname + 'svpopup').popup('close');
            });
            if (options.doLCDDisplays) {
                doLCD({displayid:channelname + 'pvdisplay', value: data[i].controlvalue})
                doLCD({displayid:channelname + 'svdisplay', value: data[i].setpointvalue})


                $('.'+ channelname +'pvjusttext').text(zeropad(data[i].controlvalue,2,1)  + '    ')
                //console.log(data[i].controlvalue)
                //console.log(zeropad(data[i].controlvalue,2,1))
                $('.'+ channelname +'svjusttext').text(zeropad(data[i].setpointvalue,2,1))
                //console.log(channelname + 'pvdisplay')
            }
            if (data[i].data != '') {
                //console.log('there is json data')
                var parseddata = jsonstringparser(data[i].data)
                if (parseddata.run == '0') {
                    //console.log('stop mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Stop');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'red');
                }
                else if (parseddata.run == '1') {
                    //console.log('run mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Run');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'green');
                }
            }
        }
        selector.trigger('create');
        selector.listview('refresh');

    }
    else {
        console.log('no new data.')
    }
}

function updateBrewPanelData(options) {
    options = options || {};
    options.database = controldatabase;
    options.tablename = 'channels';
    options.callback = renderBrewPanelData;
    options.likecriterion = 'dataclasses';
    options.likecriterionvalue = 'brewpanel';
    options.doLCDDisplays = true;
    options = addConditionsFromCriterion(options);

    wsgiCallbackTableData(options)
}

function renderBrewPanelData(response, options, xhr) {
    // Set interval function. We either pass a class to retrieve it from,
    // a static value, or nothing
    if (options.hasOwnProperty('timeoutclass')) {
        var timeout = $('.' + options.timeoutclass).val() * 1000;
    }
    else if (options.hasOwnProperty('timeout')) {
        setTimeout(function () {
            updateBrewPanelData(options)
        }, options.timeout);
    }
    if (response.hasOwnProperty('data')) {
        var data = response.data;
        var doLCDDisplays = options.doLCDDisplays || false;
        var channelnames = [];
        for (var i = 0; i < data.length; i++) {
            var channelname = data[i].name.replace(/ /g, '_');
            channelnames.push(channelname);
            setWidgetValues(channelname + 'pv', data[i].controlvalue, {jqmpage: true});
            setWidgetValues(channelname + 'sv', data[i].setpointvalue, {jqmpage: true});
            if (doLCDDisplays) {
                doLCD({displayid:channelname + 'pvdisplay', value: data[i].controlvalue})
                doLCD({displayid:channelname + 'svdisplay', value: data[i].setpointvalue})

                $('.'+ channelname +'pvjusttext').text(zeropad(data[i].controlvalue,2,1)  + '    ')
                //console.log(data[i].controlvalue)
                //console.log(zeropad(data[i].controlvalue,2,1))
                $('.'+ channelname +'svjusttext').text(zeropad(data[i].setpointvalue,2,1))
                //console.log(channelname + 'pvdisplay')
            }
            if (data[i].data != '') {
                //console.log('there is json data')
                var parseddata = jsonstringparser(data[i].data)
                if (parseddata.run == '0') {
                    //console.log('stop mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Stop');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'red');
                }
                else if (parseddata.run == '1') {
                    //console.log('run mode  for .' + channelname + 'runmode')
                    $('.' + channelname + 'runmode').text('Run');
                    $('.' + channelname + 'runmodecontainer').css('background-color', 'green');
                }
            }
            else {
                console.log('no json data')
            }
        }

    }
    else {
        console.log('no new data')
    }
    // a catchall in global data. probably (hopefully) unneeded
    brewdata = data;
}

function LCDDisplayFactory(options) {
    var displayid = options.displayid || '';
    options = options || {};
    var objectname = options.objectname || displayid + '_display';
    //console.log(displayid)
    //console.log(objectname)
    //console.log('objectname')
    //console.log(objectname)
    window[objectname] = new SegmentDisplay(displayid);
    //console.log('format ' + options.format)
    window[objectname].pattern = options.format;
    //window[objectname].pattern = "###.##";
    window[objectname].displayAngle = 6;
    window[objectname].digitHeight = 28;
    window[objectname].digitWidth = 17;
    window[objectname].digitDistance = 4.4;
    window[objectname].segmentWidth = 3.4;
    window[objectname].segmentDistance = 1.3;
    window[objectname].segmentCount = 7;
    window[objectname].cornerType = 3;
    window[objectname].colorOn = "#24dd22";
    window[objectname].colorOff = "#1b4105";
    window[objectname].draw();
    return window[displayid + '_display']
}

function doLCD(options) {
    var options = options || {};
    var precision = options.precision || 1;
    var value = options.value || 0;
    var vallog = Math.floor(Math.log10(value));
    //console.log('vallog ' + vallog)
    options.format = '#';
    for (var i=0;i<vallog;i++) {
        options.format += '#'
    }
    options.format += '.';
    for (var i=0;i<precision;i++) {
        options.format +='#'
    }

    var displayobject = LCDDisplayFactory(options);
    var thevalue = zeropad(value,vallog,precision);
    //console.log(thevalue);
    displayobject.setValue(thevalue);

}

function addConditionsFromCriterion(options) {
    if (options.hasOwnProperty('likecriterion') && options.hasOwnProperty('likecriterionvalue')) {
        options.condition = '\"' + options.likecriterion + '\" like \'%' + options.likecriterionvalue + '%\''
    }
    if (options.hasOwnProperty('criterion') && options.hasOwnProperty('criterionvalue')) {
        options.condition = '\"' + options.criterion + '\"=\'' + options.criterionvalue + '\''
    }
    return options;
}