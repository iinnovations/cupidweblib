// JavaScript Document

// Set static variables for controlstatus query
function renderBrewTemplate(options){
    // This should be modeled after colorweb, which is done cleanly

    var usefooter = options.usefooter || false;
    var pagetitle = options.title || '';
    // var headerhtml = makeHeaderHTML({title:pagetitle});
    // console.log(headerhtml);
    var headertext = makeHeaderText(options);
    $('#headertext').html(headertext);
    var navpanelhtml = makeNavPanelHTML(options);
    $('#nav-panel').html(navpanelhtml).trigger('create');

    var settingspanelhtml = makeSettingsPanelHTML(options.sessiondata);
    //console.log(settingspanelhtml)
    $('#settingspanel').html(settingspanelhtml).trigger('create');
    if (usefooter) {
        $('.footertext').html('Copyright Interface Innovations LLC, 2017');
    }
    else {
        $('#footer').hide()
    }

    // $('.pathalias').html(sessiondata.pathalias);
    // console.log(sessiondata.pathalias)
    // if (sessiondata.pathalias != 'none') {
    //     $('#header_pathalias').html(' :: ' + sessiondata.pathalias)
    // }
    // else {
    //     $('#header_pathalias').html('')
    // }
}
function makeNavPanelHTML(options) {
    var navpanelhtml =
        '<ul data-role="listview" data-theme="a" data-divider-theme="a"  class="nav-search">' +
        // '<li data-icon="delete" style="background-color:#111;">' +
        // '<a href="#" data-rel="close">Close menu</a>' +
        // '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="index.html" data-ajax="false">Home</a>' +
        '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="brew.html" data-ajax="false">Brew</a>' +
        '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="tanks.html" data-ajax="false">Tanks</a>' +
        '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="breweryactions.html" data-ajax="false">Actions</a>' +
        '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="dataviewer.html" data-ajax="false">Data</a>' +
        '</li>' +
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
        '<a href="settings.html" data-ajax="false">Settings</a>' +
        '</li>' +

        ' </ul>';
    return navpanelhtml
}
function makeHeaderText(options) {
    var headertext = '';
    if (options.title != '') {
        headertext += 'Brewpanel :: ' + options.title
    }
    else {
        headertext += 'Brewpanel';
    }
    return headertext
}
function makeHeaderHTML(options) {
    var headerhtml = '';
    if (options.hasOwnProperty('title')) {
        if (options.title != '') {
             headerhtml += '<h1>Brewpanel :: ' + options.title + '</h1>'
        }
        else {
             headerhtml += '<h1>Brewpanel</h1>';
        }
    }
    headerhtml += '<a href="#nav-panel" data-icon="bars" data-theme="d" data-iconpos="notext">Menu</a>' +
        '<a href="#settings" data-icon="gear" data-theme="d" data-iconpos="notext">Add</a>';

    return headerhtml
}

function makeSettingsPanelHTML(sessiondata) {

    var panelhtml = '';
    panelhtml +=
    '<ul data-role="listview" data-theme="a" data-divider-theme="a" class="nav-search">' +
        '<li data-icon="delete" style="background-color:#111;">' +
            '<a href="#" data-rel="close">Close menu</a>' +
        '</li>';
    if (sessiondata.username) {
        panelhtml +=
            '<li><div class="ui-btn-text ui-btn-inner" style="text-align: center; font-size:12.5px; padding-top:0.7em">' + sessiondata.username + '</div></li>' +
            '<li><div class="ui-btn-text ui-btn-inner" style="text-align: center; font-size:12.5px; padding-top:0.7em">' + sessiondata.pathalias + '</div></li>' +
            '<li><a data-ajax="false" href="/auth/logoutmobile">Log out</a></li>';
    }
    else {
        panelhtml +=
            '<li><div class="ui-btn-text ui-btn-inner" style="text-align: center; font-size:12.5px; padding-top:0.7em">Not logged in</div></li>' +
            '<li><a data-ajax="false" href="/auth/loginmobile" style="padding-right:10px">Log in</a></li>';
    }
    panelhtml +=
        '<li data-filtertext="wai-aria voiceover accessibility screen reader">' +
            '<a href="auth/manage.php">Manage user</a>' +
        '</li>' +
        '</ul>';

    return panelhtml;
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
function notifyActionComplete() {
    alert('Action complete')
}