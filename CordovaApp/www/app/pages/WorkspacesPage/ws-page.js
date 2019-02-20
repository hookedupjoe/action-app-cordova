/*
Author: Joseph Francis
License: MIT
*/
//---  WorkspacesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName: "WorkspacesPage",
        pageTitle: "WS Designer",
        pageNamespace: 'ws',
        navOptions: {
            icon: 'table',
            topLink: true,
            sideLink: true
        },
        //linkDisplayOption:'both',
        appModule: AppModule
    };

    //--- Define page templates that should load when the page is activated
    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/WorkspacesPage/tpl',
        //-- Page to lookup : name to call it when pulling
        //---  Good to "namespace" your templates with the page prefix to avoid name conflicts
        templateMap: {
            "page-west.html": thisPageSpecs.pageNamespace + ":page-west",
            "page-east.html": thisPageSpecs.pageNamespace + ":page-east",
            "page-header.html": thisPageSpecs.pageNamespace + ":page-header",
            "page-body.html": thisPageSpecs.pageNamespace + ":page-body",
            "page-footer.html": thisPageSpecs.pageNamespace + ":page-footer"
        }
    }

    //--- Define this applications layouts
    thisPageSpecs.layoutOptions = {
        templates: {
            "west": thisPageSpecs.pageNamespace + ":" + "page-west",
            "east": thisPageSpecs.pageNamespace + ":" + "page-east",
            "north": thisPageSpecs.pageNamespace + ":" + "page-header",
            "center": thisPageSpecs.pageNamespace + ":" + "page-body",
            "south": thisPageSpecs.pageNamespace + ":" + "page-footer"
        },
        facetPrefix: thisPageSpecs.pageNamespace,
        north: true,
        west: true,
        east: true
    }

    //--- Customize default layout configuration
    //--- See http://layout.jquery-dev.com/documentation.cfm for details
    thisPageSpecs.layoutConfig = {
        east__size: "30%",
        west__size: "10%",
        west__size: "10%"
        , west__togglerTip_open: "Close West Pane"
        , west__togglerTip_closed: "Open West Pane"
        , west__resizerTip_open: "Resize West Pane"
        , west__slideTrigger_open: "click" 	// default
        , west__initClosed: false
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);
    var me = ThisPage;

    ThisPage.showWestSidebar = function () {
        ThisPage.layout.toggle('west');
    }
    ThisPage.showEastSidebar = function () {
        ThisPage.layout.toggle('east');
    }    
    ThisPage.openThisWorkspace = function(theAction,theTarget){
        //alert("theTarget was " + typeof(theTarget))
        var tmpEl = $(theTarget);
        //console.log("tmpEl",tmpEl);
        var tmpID = tmpEl.attr('ws_id');
        //console.log("tmpID",tmpID);
        openWorkspaceByID(tmpID);
        ThisApp.hideCommonDialog();
        
        

    }

    ThisPage.newWorkspace = function(){
        resetWorkspaceUI();
    }
    function resetWorkspaceUI(){
        ThisPage.currentWS = {
            id: '',
            title: "(Untitled)"
        }
        ThisPage.loadFacet('ws:open-title','(Untitled)');
        ThisPage.loadFacet('ws:control-selected-title','');
        ThisPage.loadFacet('ws:control-selected-states','');
        ThisPage.openWS.clear();
    }

    ThisPage.turnDesignModeOn = function(){
        ThisPage.openWS.setDesignMode(true);
    }
    ThisPage.turnDesignModeOff = function(){
        ThisPage.openWS.setDesignMode(false);
    }
    function openWorkspaceByID(theID){
        var tmpID = theID;
        resetWorkspaceUI();

        ThisPage._om.getObject(getDS(), tmpID).then(function (theDoc) {
            if (theDoc._error) {
                ThisApp.appMessage("Error loading workspace", "e", { show: true });
            } else {
                try {
                    ThisPage.currentWS.id = tmpID;
                    ThisPage.currentWS.title = theDoc.title;
                    ThisPage.loadFacet('ws:open-title', '[' + tmpID + '] - ' + theDoc.title);
                    ThisPage.openWS.loadFromObject(theDoc.data).then(
                        function(){
                            ThisPage.openWS.refreshUI();

                        }
                    );
                    
                } catch(ex){
                    console.error("Error ",ex);
                }
            }
        });
    }

    ThisPage.openWorkspace = function(){
        var tmpHTML = [];
        tmpHTML.push('');
        if( loadedSpaces.keys.length < 1){
            alert("Nothing to load");
            return;
        }
        tmpHTML.push('<div class="ui divided selection list">');
        for (let index = 0; index < loadedSpaces.keys.length; index++) {
            var tmpID = loadedSpaces.keys[index];
            var tmpTitle = loadedSpaces[tmpID].title;
            tmpHTML.push('  <a action="ws:openThisWorkspace" ws_id="' + tmpID + '" class="item">');
            tmpHTML.push('    <div class="ui blue horizontal label">' + tmpID + '</div>');
            tmpHTML.push(tmpTitle);
            tmpHTML.push('  </a>');
            }

        tmpHTML.push('</div>');


                       ThisApp.showCommonDialog({ 
                           header: "Select workspace to open",
                           closeText: "Cancel Open",
                           content: tmpHTML.join('')         
                        });
    }    
    
    ThisPage.showOptions = function(){

    }
    

    ThisPage.hasBeenSetup = false;
    ThisPage.usingRemote = false;


    var loadedSpaces = {index:{},keys:[]};
    function addSpace(theID, theWS, theNoSaveFlag){
        if( !(loadedSpaces[theID])){
            loadedSpaces.keys.push(theID);
        }
        //--- Load stuff we want in this index
        loadedSpaces[theID] = {title: theWS.title};

        //--- Auto save usually (?when not?)
        if( theNoSaveFlag !== true ){
            return saveLoadedSpaces();
        }
        return true;
        
    }
    


    ThisPage.removeControl = function(){
        var tmpID = ThisPage.selectedControl.oid;
        ThisPage.openWS.removeControl(tmpID);
    }
    ThisPage.setControlState = function(theAction,theTarget){
        
        var tmpEl = $(theTarget)
        var tmpState = tmpEl.attr('state');
        var tmpVal = ThisPage.getByAttr$({state:tmpState, appuse:"ws:state-control"}).val();
        var tmpStateSpec = ThisPage.selectedControl.specs.states[tmpState];
        if( tmpStateSpec.type === 'boolean'){
            if( tmpVal === '' ){
                tmpVal = tmpStateSpec.default || false;
            } else {
                tmpVal = (tmpVal === 'true');
            }

        }
        ThisPage.selectedControl.setState(tmpState, tmpVal, true);

    }

    
    function saveLoadedSpaces(){
        return ThisPage._om.putObject(getDS(), 'wsIndex', loadedSpaces);
    }

    function initLoadedSpaces(){
        //ToDo: Return promise and load before showing full UI    
        ThisPage._om.getObject(getDS(), 'wsIndex').then(function (theDoc) {
            if (typeof (theDoc._error) === 'object') {
                if (theDoc._error.status == 404) {
                    ThisApp.appMessage("No workspaces, add on eo tget started", "i", { show: true });
                } else {
                    ThisApp.appMessage("Error getting setup document", "e", { show: true });
                    showPreviewJson(theDoc);
                }
            } else {
                if (theDoc){
                    loadedSpaces = theDoc;
                    if( loadedSpaces && loadedSpaces.keys ){
                        ThisApp.appMessage("Loaded " + loadedSpaces.keys.length + " entries", "i", { show: true });
                    }
                    
                }
            }
        });
        
    }
    function getDS(){
        if( ThisPage.usingRemote ){
            return ThisPage.remoteDataSource;
        }
        return ThisPage.localDataSource;

    }
    ThisPage.showOutLoading = showOutLoading;
    function showOutLoading() {
        ThisApp.loadFacet('ws:home-output', '', 'app:page-loading-spinner');
    }

    ThisPage.showPreviewLoading = showPreviewLoading;
    function showPreviewLoading() {
        ThisApp.loadFacet('ws:preview-area', '', 'app:page-loading-spinner');
    }
    ThisPage.showLoading = showLoading;
    function showLoading() {
        showPreviewLoading();
        showOutLoading();
    }

    ThisPage.showPreview = showPreview;
    function showPreview(theContent, theOptionalTemplateName) {
        ThisApp.loadFacet('ws:preview-area', theContent, theOptionalTemplateName);
    }

    ThisPage.showOut = showOut;
    function showOut(theContent, theOptionalTemplateName) {
        ThisApp.loadFacet('ws:home-output', theContent, theOptionalTemplateName);
    }

    ThisPage._onInit = function (theApp) {
        ThisPage._om = theApp.om;
        ThisPage._webctl = theApp.getComponent("plugin:WebControls");

        ThisPage.dt = theApp.getComponent("plugin:DataTables");
    }
    
    function loadSelctedControl(theObj){
        ThisPage.selectedControl = theObj;

        if( !(theObj.specs) ){
            console.error("No specs for object, not valid for ui");
            return;
        }
        var tmpSpecs = theObj.specs;
        //console.log("tmpSpecs",tmpSpecs);
        var tmpShowTitle = '[' + tmpSpecs.title + "] - " + theObj.oid;
        ThisPage.loadFacet('ws:control-selected-title', tmpShowTitle);

        var tmpHTML = [];
//        tmpHTML.push('<div class="ui middle aligned divided list">')

tmpHTML.push('<table class="ui compact table">')
tmpHTML.push('  <tbody>')


tmpHTML.push('<tr><td colspan="3">')
tmpHTML.push('<div class="ui button compact" action="ws:moveControl">Move</div>')
tmpHTML.push('<div class="ui button compact" action="ws:removeControl">Delete</div>')
tmpHTML.push('</td></tr>')









        var tmpStates = tmpSpecs.states || {};
        for( var aStateName in tmpStates ){
        //    console.log("aStateName",aStateName);
            var tmpState = tmpStates[aStateName];

            
tmpHTML.push('    <tr>')


        var tmpStateVal = theObj.getState(aStateName) || '';


        tmpHTML.push('<td>')
        tmpHTML.push('<label>' + tmpState.title + '</label>&#160;')
        tmpHTML.push('</td>')

        tmpHTML.push('<td><div class="ui input">')
        tmpHTML.push('<input state="' + aStateName + '" appuse="ws:state-control" type="text" value="' + tmpStateVal + '"></input>')
        tmpHTML.push('</div></td>')

        tmpHTML.push('<td>')
        tmpHTML.push('<div action="ws:setControlState" state="' + aStateName + '" class="ui button">Set</div>')
        tmpHTML.push('</td>')

tmpHTML.push('    </tr>')


        }

        tmpHTML.push('  </tbody>')
tmpHTML.push('</table>')


//        tmpHTML.push('</div>')



        ThisPage.loadFacet('ws:control-selected-states', tmpHTML.join(''))

        /*
        
        var tmpColor = theObj.getState('color');
            if(tmpColor == 'blue'){
                theObj.setState('color','green');
            } else {
                theObj.setState('color','blue');
            }
            theObj.refreshUI();
             */
    }

   
    ThisPage._onFirstActivate = function (theApp) {
        ThisPage._om = theApp.om;
        ThisPage.localDataSource = '_aad:ws';
        ThisPage.remoteDataSourceBase = 'data-store';
        ThisPage.remoteDataSource = ThisPage.remoteDataSourceBase + ':action-app-ws';

        ThisPage.openWSControlClick = function(thePubEvent, theObj, theWS, theClickEvent){
            console.log("wsc theWS,theClickEvent,theObj",theWS,theClickEvent,theObj);
            
            loadSelctedControl(theObj);
        }



        ThisPage.initOnFirstLoad().then(
            function () {

                             
                ThisPage.processingDialog = ThisPage.getByAttr$({ appuse: "ws:processing-dialog" }).modal('setting', 'closable', false);
                ThisPage.processingDialogShow = function () {
                    ThisPage.processingDialog.modal('show');
                }
                ThisPage.processingDialogHide = function () {
                    ThisPage.processingDialog.modal('hide');
                }
                ThisPage.promptDialog = ThisPage.getByAttr$({ appuse: "ws:prompt-dialog" }).modal();
                ThisPage.promptDialogTitle = ThisPage.getByAttr$({ appuse: "ws:prompt-dialog-title" });
                ThisPage.promptDialogText = ThisPage.getByAttr$({ appuse: "ws:prompt-dialog-text" });
                ThisPage.promptDialogOK = ThisPage.getByAttr$({ appuse: "ws:prompt-dialog-yes" });

                ThisPage.promptDialogShow = function (thePromptText, theTitle, theAction) {
                    ThisPage.promptDialogTitle.html(theTitle);
                    ThisPage.promptDialogText.html(thePromptText);
                    ThisPage.promptDialogOK.attr("action", theAction);
                    ThisPage.promptDialog.modal('show');
                }
                ThisPage.promptDialogHide = function () {
                    ThisPage.promptDialog.modal('hide');
                }

                ThisPage.btnSelectSearch = ThisPage.getByAttr$({ appuse: "ws:select-search" })

                var tmpTestAreaEl = ThisPage.getByAttr$({ facet: "ws:open-ws" });
                ThisPage.openWS = ThisPage._webctl.getNewPanel();
                ThisPage.openWS.init({ mom: tmpTestAreaEl[0]});
                ThisPage.openWS.subscribe('controlClick', ThisPage.openWSControlClick)
                initOpenWSControls();
                resetWorkspaceUI();
                ThisPage.openWS.setDesignMode(true);

                
                //ThisPage.footerWS.subscribe('controlClick', ThisPage.openFooterControlClick)


                
                var tmpFooterAreaEl = ThisPage.getByAttr$({ facet: "ws:footer-status-bar" });
                ThisPage.footerWS = ThisPage._webctl.getNewPanel();
                ThisPage.footerWS.init({ mom: tmpFooterAreaEl[0]});
                var tmpSpecsForWS = {
                    "objects": [
                      {
                        "cid": "sui-button-select",
                        "states": {
                          "size": "large",
                          "color": "green",
                          "list": "Test1,Test2,Test3,Test4",
                          "inverted": false,
                          "appuse": "test",
                          "floatDirection": "left"
                        }
                      },
                      {
                        "cid": "sui-button-select",
                        "states": {
                          "size": "large",
                          "color": "blue",
                          "list": "All,Q1,Q2,Q3,Q4",
                          "floatDirection": "left"
                        }
                      }
                    ]
                  }
            
                ThisPage.footerWS.loadFromObject(tmpSpecsForWS).then(
                    function(){
                        console.log("Done Loading");
                        ThisApp.refreshLayouts();
                    }
                )
                
                ThisPage._om.getObject(ThisPage.localDataSource, 'setup').then(function (theDoc) {
                    if (typeof (theDoc._error) === 'object') {
                        if (theDoc._error.status == 404) {
                            showWelcomeScreen();
                        } else {
                            ThisApp.appMessage("Error getting setup document", "e", { show: true });
                            showPreviewJson(theDoc);
                        }
                    } else {
                        if (theDoc && theDoc.name && theDoc.setup) {
                            ThisPage.hasBeenSetup = true;
                            ThisPage.usingRemote = true;
                            //ThisApp.appMessage("Loaded setup document", "i", { show: true });
                            ThisPage._om.putSourceHandler(ThisPage.remoteDataSourceBase, theDoc.setup);
                            showWorkspaces();
                        } else if (theDoc && theDoc.localOnly === true) {
                            ThisPage.hasBeenSetup = true;
                            showWorkspaces();
                        } else {
                            ThisApp.appMessage("Error - invalid setup document", "e", { show: true });
                            showPreviewJson(theDoc);
                        }
                        if( ThisPage.hasBeenSetup ){
                            initLoadedSpaces();
                        }
                    }
                });
            }
        );

    }


    function initOpenWSControls(){
        var tmpLoad = [];
        tmpLoad.push('<button class="ui button" action="ws:addIconControl">Icon</button>')
        tmpLoad.push('<button class="ui button" action="ws:addButtonSelectControl">Button Select</button>')
        ThisPage.loadFacet('ws:open-ws-controls', tmpLoad.join(''))
    }

    function getDialogFieldValues(theAppUse){
        var tmpFields = ThisApp.getByAttr$({appuse:theAppUse});
        var tmpFieldValues = {};
        var tmpFieldCount = tmpFields.length;
        if( tmpFieldCount > 0 ){
            for (let index = 0; index < tmpFields.length; index++) {
                var tmpFieldEl = $(tmpFields[index]);
                var tmpVal = tmpFieldEl.val();
                var tmpName = tmpFieldEl.attr('name');
                tmpFieldValues[tmpName] = tmpVal;
            }
        }
        return tmpFieldValues
    }

    ThisPage.saveWorkspaceSaveDetails = function(){
        var tmpFieldValues = getDialogFieldValues("ws:dialog-field");
        console.log("tmpFieldValues",tmpFieldValues);
        
        if( !(tmpFieldValues.ws_id && tmpFieldValues.ws_title) ){
            alert("Need both fields, use cancel to close without adding");
            return;
        }
        var tmpToSave = {
            id: tmpFieldValues.ws_id,
            title:tmpFieldValues.ws_title || tmpFieldValues.ws_id,
            data: ThisPage.openWS.getAsObject(),
            "!type":"ws"
        }
        ThisPage._om.putObject(getDS(), tmpToSave.id, tmpToSave).then(function (theDoc) {
            if (typeof (theDoc._error) === 'object') {
                console.error("Error saving ",theDoc);
                ThisApp.appMessage("Error saving setup document", "e", { show: true });
            } else {
                ThisApp.hideCommonDialog();
                addSpace(tmpToSave.id,tmpToSave);
                ThisApp.appMessage("Saved " + tmpToSave.id, "i", { show: true });
                openWorkspaceByID(tmpToSave.id);
            }
        });


    }

    ThisPage.saveWorkspace = function(){
        var tmpJson = ThisPage.openWS.getAsObject();
        //console.log("tmpJson",tmpJson);
        if( !(tmpJson && tmpJson.objects && tmpJson.objects.length > 0) ) {
            alert("Nothing to save, add controls before saving.");
            return;
        }

        // var tmpPromptSpec = {
        //     title: "Workspace Details",
        //     form: {
        //         content: [
        //             {type:"field",name:"ws_id", label: "Workspace ID"}
        //             ,{type:"field",name:"ws_title", label: "Workspace Title"}
        //         ]
        //     }
        // }
        var tmpHTML = [];
        tmpHTML.push('<div style="margin-right:20px">');

        tmpHTML.push('<form class="ui form">');
tmpHTML.push('  <div class="field">');
tmpHTML.push('    <label>Workspace ID</label>');
tmpHTML.push('    <input type="text" appuse="ws:dialog-field" name="ws_id" value="' + ThisPage.currentWS.id + '" placeholder="Unique ID">');
tmpHTML.push('  </div>');
tmpHTML.push('  <div class="field">');
tmpHTML.push('    <label>Workspace Title</label>');
tmpHTML.push('    <input type="text" appuse="ws:dialog-field" name="ws_title"  value="' + ThisPage.currentWS.title + '" placeholder="Short Title">');
tmpHTML.push('  </div>');
//tmpHTML.push('  <button class="ui button" type="submit">Submit</button>');
tmpHTML.push('</form>');

tmpHTML.push('</div>');

var tmpFooterHTML = '';
                       tmpFooterHTML += '<button action="ws:saveWorkspaceSaveDetails" class="ui button blue">Save Workspace</button>';
                       //Right Align if desired?
                       //tmpFooterHTML += '<div style="float:right;padding-right:5px;margin-bottom:5px;"><button class="ui button basic green">Testing</button></div>';

                       ThisApp.showCommonDialog({ 
                           header: "Save Workspace",
                           closeText: "Cancel Save",
                           content: tmpHTML.join('')         
                           //,onBeforeClose: function(){alert('WAIT!');return false}
                           //,onClose: function(){alert('See the results');}
                           ,footer: tmpFooterHTML
                        });

        console.log("tmpJson",tmpJson)
    }
    function showWorkspaces() {
        ThisPage.showOut('');
    }

    function showWelcomeScreen() {
        var tmpOut = [];
        tmpOut.push('<div style="margin-right:30px;">');
        tmpOut.push('<h3>Setup Primary NoSQL Data Source</h3>');
        tmpOut.push('<p>Why? So you can save your setup.</p>');
        tmpOut.push('<p>How? Download Couch, setup an admin user for api use (i.e. apiadmin) and set it up here.</p>');
        tmpOut.push('<form class="ui form">');
        tmpOut.push('  <div class="field">');
        tmpOut.push('    <label>URL</label>');
        tmpOut.push('    <input appuse="setup-form" type="text" value="http://localhost:5984/" name="url" placeholder="URL">');
        tmpOut.push('  </div>');
        tmpOut.push('  <div class="field">');
        tmpOut.push('    <label>Admin Username</label>');
        tmpOut.push('    <input appuse="setup-form" type="text" name="user" placeholder="Admin Username">');
        tmpOut.push('  </div>');
        tmpOut.push('  <div class="field">');
        tmpOut.push('    <label>Admin Password</label>');
        tmpOut.push('    <input appuse="setup-form" type="text" name="password" type="password" placeholder="Admin Password">');
        tmpOut.push('  </div>');
        tmpOut.push('  <button class="ui button" type="button" action="ws:saveNoSQLSetup">Save NoSQL Settings</button>');
        tmpOut.push('  <button class="ui button" type="button" action="ws:noSetup">No Thanks, pouch only for now</button>');
        tmpOut.push(' </form>');
        tmpOut.push('</div>');

        ThisPage.showOut(tmpOut.join(''));
    }

    function getSetupFieldVal(theName) {
        return ThisPage.getByAttr$({ appuse: "setup-form", name: theName }).val();
    }
    ThisPage.noSetup = function () {

        var tmpDS = {
            "name": "local-only",
            localOnly: true
        }

        ThisPage._om.putObject(ThisPage.localDataSource, 'setup', tmpDS).then(function (theDoc) {
            if (typeof (theDoc._error) === 'object') {
                if (theDoc._error.status == 404) {
                    showWelcomeScreen();
                } else {
                    ThisApp.appMessage("Error saving setup document", "e", { show: true });
                    showPreviewJson(theDoc);
                }
            } else {
                ThisPage.hasBeenSetup = true;
                showWorkspaces();
                showPreviewJson({ "message": "You Did it locally only!" });
            }
        });

    }

    ThisPage.buttonSelectTest = function(theAction,theTarget){
        console.log("buttonSelectTest",theTarget);
        ThisApp.appMessage("buttonSelectTest Ran", "i", { show: true });        
    }
    ThisPage.saveNoSQLSetup = function () {
        var tmpURL = getSetupFieldVal('url');
        var tmpUser = getSetupFieldVal('user');
        var tmpPassword = getSetupFieldVal('password');

        var tmpDS = {
            "name": ThisPage.remoteDataSourceBase,
            "setup": {
                "handler": "[couch]",
                "options": {
                    "url": tmpURL,
                    "auth": {
                        "username": tmpUser,
                        "password": tmpPassword
                    }
                }
            }
        }

        ThisPage._om.putObject(ThisPage.localDataSource, 'setup', tmpDS).then(function (theDoc) {
            if (typeof (theDoc._error) === 'object') {
                if (theDoc._error.status == 404) {
                    showWelcomeScreen();
                } else {
                    ThisApp.appMessage("Error saving setup document", "e", { show: true });
                }
            } else {
                ThisPage._om.putSourceHandler(ThisPage.remoteDataSourceBase, tmpDS.setup);
                ThisPage.hasBeenSetup = true;
                ThisPage.usingRemote = true;
                window.location = window.location;
            }
        });
    }



    ThisPage.runTest = function () {
        var tmpObj = { "running": "a test", "more": 12, "arr": ["one", "two"], "child": { "name": "Jane" } };


        
        
        ThisPage._om.putObject(getDS(), 'testdoc1', tmpObj).then(function (theDoc) {
            console.log('saved ', theDoc);
            ThisApp.appMessage("Saved doc - " + typeof (theDoc));
            ThisApp.appMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest2 = function () {
        ThisPage._om.getObject(getDS(), 'testdoc1').then(function (theDoc) {
            console.log('got ', theDoc);
            if (theDoc._error) {
                ThisApp.appMessage("Error getting document", "e", { show: true });
                showPreviewJson(theDoc);

            } else {
                //ThisApp.appMessage("Got doc - " + typeof(theDoc));
                ThisApp.appMessage("Got document - JSON is - " + JSON.stringify(theDoc));
                showPreviewJson(theDoc);
            }
        });
    }
    ThisPage.runTest3 = function () {
        ThisPage._om.getObjects('[get]:app/app-data', ['default.json', 'demo.json']).then(function (theDocs) {
            console.log('got from get ', theDocs);
            ThisApp.appMessage("Got document, see logs", "i", { show: true });
            ThisApp.appMessage(" doc is - " + JSON.stringify(theDocs));
            showPreviewJson(theDocs);
        });
    }

    ThisPage.runTest4 = function () {
        ThisPage._om.getObjects(ThisPage.remoteDataSource, ['ws-demo-001', 'ws-demo-002']).then(function (theDocs) {
            console.log('got from couch ', theDocs);
            showPreviewJson(theDocs);
        });
    }

    var tmpControlAt = 0;
    ThisPage.runTest5 = function () {
        tmpControlAt++;
        ThisPage.openWS.addControl('', 'sui-icon', {states:{bordered:true, size:'huge',icon:'user',color:'blue'} }).then(function(theControl){

        });
    }

    
    ThisPage.addButtonSelectControl = function () {
        tmpControlAt++;
        ThisPage.openWS.addControl('', 'sui-button-select', {states:{size:'huge', color:'blue'} }).then(function(theControl){

        });
    }

    ThisPage.addIconControl = function () {
        tmpControlAt++;
        ThisPage.openWS.addControl('', 'sui-icon', {states:{bordered:true, size:'huge',icon:'user',color:'blue'} }).then(function(theControl){

        });
    }
    


    ThisPage.demoAddObjectYouKnowIsNew = function () {
        var tmpNew = { "!type": "ws", "title": "Demo Add" };
        ThisPage._om.addObject(ThisPage.remoteDataSource, 'demo04', tmpNew).then(function (theDoc) {
            console.log('saved ', theDoc);
        });
    }




    ThisPage.exampleShowingError = function () {
        ThisPage._om.getObject('dash-test-db', 'not-there').then(function (theDoc) {
            console.log('got ', theDoc);
            if (theDoc._error) {
                ThisApp.appMessage("Error getting document", "e", { show: true });
                showPreviewJson(theDoc);

            } else {
                //ThisApp.appMessage("Got doc - " + typeof(theDoc));
                ThisApp.appMessage("Got document - JSON is - " + JSON.stringify(theDoc));
                showPreviewJson(theDoc);
            }
        });
    }


    ThisPage.showPreviewJson = showPreviewJson;
    function showPreviewJson(theObject) {
        showJson(theObject, 'ws:preview-area')
    }

    function showJson(theObject, theFacetName) {
        var tmpOptions = {
            collapsed: false,
            withQuotes: true
        };
        $('[facet="' + theFacetName + '"]').jsonViewer(theObject, tmpOptions);
    }

})(ActionAppCore, $);
