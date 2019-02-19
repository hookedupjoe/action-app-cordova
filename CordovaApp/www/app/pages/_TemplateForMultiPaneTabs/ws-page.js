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
        pageTitle: "Workspaces",
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

    ThisPage.hasBeenSetup = false;
    ThisPage.usingRemote = false;

    function getAppUseVal(theName){
        return ThisPage.getByAttr$({appuse: theName}).val()
    }
    var loadedSpaces = {index:{},keys:[]};
    var loadedSpace = false;
    function addSpace(theID, theWS){
        if( !(loadedSpaces[theID])){
            loadedSpaces.keys.push(theID);
        }
        loadedSpaces[theID] = theWS;
        loadedSpace = theID;
        showWorkspaces();
        loadWorkspaceUI(loadedSpace);
    }
    
    ThisPage.addWorkspace = function(){
        var tmpID = getAppUseVal('ws:new-ws-name');
        addSpace(tmpID, {})
        alert('tmpID ' + tmpID)
    }
    
    function loadWorkspaceUI(theID){
        return ThisPage.loadFacet('ws:open-ws','Testing ' + theID);
    }
    function saveLoadedSpaces(){
        return ThisPage._om.putObject(getDS(), 'wsIndex', loadedSpaces);
    }

    function initLoadedSpaces(){
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
                    showWorkspaces();
                }
            }
        });
        
    }
    function getDS(){
        if( ThisPage.usingRemote ){
            return ThisPage.remoteDataSourceBase;
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
    
    ThisPage._onFirstActivate = function (theApp) {
        ThisPage._om = theApp.om;
        ThisPage.localDataSource = '_aad:ws';
        ThisPage.remoteDataSourceBase = 'data-store';
        ThisPage.remoteDataSource = ThisPage.remoteDataSourceBase + ':action-app-ws';


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

                ThisPage.btnSelectSearch = ThisPage.getByAttr$({ appuse: "ws:select-search" })

                var tmpTestAreaEl = ThisPage.getByAttr$({ facet: "ws:open-ws" });
                ThisPage.openWS = ThisPage._webctl.getNewPanel();
                ThisPage.openWS.init({ mom: tmpTestAreaEl[0]});
                initOpenWSControls();

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
                            ThisApp.appMessage("Loaded setup document", "i", { show: true });
                            ThisPage._om.putSourceHandler(ThisPage.remoteDataSourceBase, theDoc.setup);
                            showWorkspaces();
                        } else if (theDoc && theDoc.localOnly === true) {
                            ThisPage.hasBeenSetup = true;
                            showWorkspaces();
                        } else {
                            ThisApp.appMessage("Error - invalid setup document", "e", { show: true });
                            showPreviewJson(theDoc);
                        }
                    }
                });
            }
        );

    }


    function initOpenWSControls(){
        var tmpLoad = [];
        tmpLoad.push('<button class="ui button" action="ws:addIconControl">Icon</button>')
        ThisPage.loadFacet('ws:open-ws-controls', tmpLoad.join(''))
    }

    function showWorkspaces() {
        var tmpOut = [];

        tmpOut.push('<div style="margin-right:30px;">');

        if (ThisPage.usingRemote) {
            tmpOut.push('Show WS from remote source');
        } else {
            tmpOut.push('Show WS from local source');
        }
        tmpOut.push('</div>');
        ThisPage.showOut(tmpOut.join(''));
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
                    showPreviewJson(theDoc);
                }
            } else {
                ThisPage._om.putSourceHandler(ThisPage.remoteDataSourceBase, tmpDS.setup);
                ThisPage.hasBeenSetup = true;
                ThisPage.usingRemote = true;
                showWorkspaces();
                showPreviewJson({ "message": "You Did it!" });
            }
        });


        alert("ok " + tmpUser + ' ' + tmpPassword);
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
        ThisPage.openWS.addControl('icon-control-' + tmpControlAt, 'sui-icon', {states:{bordered:true, size:'huge',icon:'user',color:'blue'} }).then(function(theControl){

        });
    }
    ThisPage.addIconControl = function () {
        tmpControlAt++;
        ThisPage.openWS.addControl('icon-control-' + tmpControlAt, 'sui-icon', {states:{bordered:true, size:'huge',icon:'user',color:'blue'} }).then(function(theControl){

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
