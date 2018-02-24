/*
Author: Joseph Francis
License: MIT
*/
//---  DashboardPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisSiteSpecs = {
        pageName:"DashboardPage", 
        pageTitle: "Dashboard", 
        pageActionPrefix: 'dash',
        linkDisplayOption:'both',
        appModule:AppModule
    };

    thisSiteSpecs.layoutOptions = {
        facetPrefix: thisSiteSpecs.pageActionPrefix,
        north: false,
        west: false,
        east: false
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisSiteSpecs);

    //--- Hook into the app lifecycle as needed    
    
    ThisPage.runTest = function(){
        var tmpObj = {"running":"a test", "more":12, "arr":["one","two"], "child": {"name":"Jack"}};
        ThisPage._om.putObject('dash-test-db', 'testdoc', tmpObj).then(function (theDoc) {
            console.log('saved ',theDoc);
            ThisApp.showMessage("Saved doc - " + typeof(theDoc));
            ThisApp.showMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest2 = function(){
        ThisPage._om.getObject('dash-test-db', 'testdoc').then(function (theDoc) {
            console.log('got ',theDoc);
            ThisApp.showMessage("Got doc - " + typeof(theDoc));
            ThisApp.showMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest3 = function(){
        ThisPage._om.getObject('[get]', './appdata/default.json').then(function (theDoc) {
            console.log('got from get ',theDoc);
            ThisApp.showMessage("Got doc - " + typeof(theDoc));
            ThisApp.showMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest4 = function(){
        console.log("runTest4");
        ThisPage._om.getObject('[html]', './apptpl/hello.html').then(function (theHTML) {
            console.log('got from html ',theHTML);
            ThisApp.showMessage("Got html - " + typeof(theHTML));
            ThisApp.showMessage(" html is - " + theHTML);
        });
    }

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.getComponent("plugin:ObjectManager");

         
    }

    ThisPage._onFirstActivate = function(theApp) {
        //--- Build the UI
        var me = ThisPage;
       


        var tmpContext = {}
        ThisPage.loadRegion('center', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-body', tmpContext));
        ThisPage.loadRegion('south', ThisApp.renderTemplate(thisSiteSpecs.pageActionPrefix + ':page-footer', tmpContext));

        //--- Add any custom init stuff
        $('[appuse="dash:home-sidebar"] .ui.sidebar')
        .sidebar({
            context: $('[appuse="dash:home-sidebar"] .bottom.segment')
        })
        .sidebar('attach events', '[appuse="dash:home-sidebar"] .menu .item')
        ;

        var tmpZoomBarEl = me.getByAttr$({ facet: "dash:zoom-control" });
        me.wsZoomControlWS = me._svg.getNewWorkpace();
        me.wsZoomControlWS.init({ svg: tmpZoomBarEl[0], viewBox: {x: 0, y: 0, w: 200, h: 20} });
        me.wsZoomControlWS.addControl('zoom-slider', 'horiz-slider', { sliderStart:0, sliderEnd: 400, sliderIncr: 10, sliderValue: 100, scale: .5 }).then(function(theControl){
            me.wsZoomControl = theControl;
            me.wsZoomControl.subscribe("valueChanged", me.zoomValueChanged.bind(me));
        });

        var tmpWatsonIconEl = me.getByAttr$({ facet: "dash:watson-icon" });
        me.wsWatsonIconWS = me._svg.getNewWorkpace();
        me.wsWatsonIconWS.init({ svg: tmpWatsonIconEl[0], viewBox: {x: 0, y: 0, w: 50, h: 50} });
        me.wsWatsonIconWS.addControl('icon-watson', 'icon-watson', {scale: .5 }).then(function(theControl){
            me.wsWatsonIcon = theControl;
            //me.wsWatsonIcon.subscribe("valueChanged", me.zoomValueChanged.bind(me));
        });

        var tmpDatabaseIconEl = me.getByAttr$({ facet: "dash:database-icon" });
        me.wsDatabaseIconWS = me._svg.getNewWorkpace();
        me.wsDatabaseIconWS.init({ svg: tmpDatabaseIconEl[0], viewBox: {x: 0, y: 0, w: 150, h: 150} });
        me.wsDatabaseIconWS.addControl('icon-database', 'icon-database', {scale: 1 }).then(function(theControl){
            me.wsDatabaseIcon = theControl;
            //me.wsDatabaseIcon.subscribe("valueChanged", me.zoomValueChanged.bind(me));
        });

       

    }

    ThisPage.zoomValueChanged = zoomValueChanged;
    function zoomValueChanged(theEvent, theNewValue, theObj){
        console.log("zoomValueChanged",theNewValue);        
    }
    
    ThisPage.pageTest = function () {
        var tmpMarkup = '<hr/>Added to Out';
        ThisApp.addToFacet('dash:dashboard-out', tmpMarkup);
    }
    
})(ActionAppCore, $);
