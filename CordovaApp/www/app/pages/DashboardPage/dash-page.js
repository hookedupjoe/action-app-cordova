/*
Author: Joseph Francis
License: MIT
*/
//---  DashboardPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName:"DashboardPage", 
        pageTitle: "Dashboard", 
        pageNamespace: 'dash',
        navOptions:{
            icon: 'user',
            topLink:false,
            sideLink:true
        },
        //linkDisplayOption:'both',
        appModule:AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/DashboardPage/tpl',
        //-- Page to lookup : name to call it when pulling
        //---  Good to "namespace" your templates with the page prefix to avoid name conflicts
        templateMap:{
            "page-body.html": thisPageSpecs.pageNamespace + ":page-body",
            "page-footer.html": thisPageSpecs.pageNamespace + ":page-footer"
        }
    }

    thisPageSpecs.layoutOptions = {
        templates: {
            "center": thisPageSpecs.pageNamespace + ":" + "page-body",
            "south": thisPageSpecs.pageNamespace + ":" + "page-footer"
        },  
        facetPrefix: thisPageSpecs.pageNamespace,
        north: false,
        west: false,
        east: false
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);

    //--- Hook into the app lifecycle as needed    
    
    ThisPage.runTest = function(){
        var tmpObj = {"running":"a test", "more":12, "arr":["one","two"], "child": {"name":"Jane"}};
        ThisPage._om.putObject('dash-test-db', 'testdoc2', tmpObj).then(function (theDoc) {
            console.log('saved ',theDoc);
            ThisApp.appMessage("Saved doc - " + typeof(theDoc));
            ThisApp.appMessage(" doc is - " + JSON.stringify(theDoc));
        });
    }
    ThisPage.runTest2 = function(){
        ThisPage._om.getObject('dash-test-db', 'testdoc2').then(function (theDoc) {
            console.log('got ',theDoc);
            if( theDoc._error ){
                var tmpMsg = theDoc._error;
                if(typeof(tmpMsg) == 'object'){
                    tmpMsg = tmpMsg.message || tmpMsg.errorText || 'unknown error';
                }
                ThisApp.appMessage(tmpMsg, "e")
            } else {
                //ThisApp.appMessage("Got doc - " + typeof(theDoc));
                ThisApp.appMessage("Got document - JSON is - " + JSON.stringify(theDoc));
            }
        });
    }
    ThisPage.runTest3 = function(){
        ThisPage._om.getObjects('[get]:app/app-data', ['default.json','demo.json']).then(function (theDocs) {
            console.log('got from get ',theDocs);
            ThisApp.appMessage("Got document, see logs","i", {show:true});
            ThisApp.appMessage(" doc is - " + JSON.stringify(theDocs));
        });
    }
    ThisPage.runTest4 = function(){
       //ThisPage.wsZoomControl.setState('sliderValue', 75);
       ThisApp.appMessage("ThisPage.wsHome is " + JSON.stringify(ThisPage.wsHome.getAsObject()), "i", {show:false});
       var tmpWSObj = false;
       ThisPage._om.getObject('[get]:app/app-data','ws-home.json').then(function(theDoc){
        ThisPage.wsHome.loadFromObject(theDoc)
       })
    }

    ThisPage._onInit = function(theApp) {
        
        
    }

    ThisPage._onFirstActivate = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;

        var tmpThis = this;
        ThisPage.initOnFirstLoad().then(
            function(){
                var me = ThisPage;
                //--- Add any custom init stuff
                $('[appuse="dash:home-sidebar-menu"]')
                .sidebar({
                    context: $('[appuse="dash:home-sidebar-menu-container"]')
                })
                .sidebar('attach events', '[appuse="dash:home-sidebar-menu-trigger"]')
                ;

                var tmpZoomBarEl = me.getByAttr$({ facet: "dash:zoom-control" });
                me.wsZoomControlWS = me._svg.getNewPanel();
                me.wsZoomControlWS.init({ svg: tmpZoomBarEl[0], viewBox: {x: 0, y: 0, w: 200, h: 20} });
                me.wsZoomControlWS.addControl('zoom-slider', 'horiz-slider', { sliderStart:0, sliderEnd: 100, sliderIncr: 10, sliderValue: 50, scale: .5 }).then(function(theControl){
                    me.wsZoomControl = theControl;
                    me.wsZoomControl.subscribe("valueChanged", me.zoomValueChanged.bind(me));
                });

                var tmpHomeWsEl = me.getByAttr$({ facet: "dash:home-ws" });
                me.wsHome = me._svg.getNewPanel();
                me.wsHome.init({ svg: tmpHomeWsEl[0], viewBox: {x: 0, y: 0, w: 400, h: 400} });

                me.wsHome.addControl('icon-database1', 'icon-database', {scale: 1 }).then(function(theControl){
                    me.wsDatabaseIcon = theControl;
                });
                me.wsHome.addControl('on-off-g-r1', 'on-off-g-r', {scale: 2, translateY:210, translateX:120 }).then(function(theControl){
                    me.onOffButton1 = theControl;
                });
                me.wsHome.addControl('btn-round-glossy1', 'btn-round-glossy', {scale: .25, translateY:280, translateX:60, states:{switchColor:'#ff00ff',switchStatus:true} }).then(function(theControl){
                    me.roundGlossyButton = theControl;
                });
                me.wsHome.addControl('btn-round-glossy2', 'btn-round-glossy', {scale: .25, translateY:280, translateX:160, states:{switchColor:'#ffff00',switchStatus:true} }).then(function(theControl){
                    me.roundGlossyButton2 = theControl;
                });
                me.wsHome.addControl('btn-round-glossy3', 'btn-round-glossy', {scale: .25, translateY:280, translateX:260, states:{switchColor:'#00ffff',switchStatus:true} }).then(function(theControl){
                    me.roundGlossyButton3 = theControl;
                });
                me.wsHome.addControl('color-bar-main', 'color-bar', {scale: .4, translateY:160, translateX:20, states:{switchColor:'#00ffff',switchStatus:true} }).then(function(theControl){
                    me.roundGlossyButton3 = theControl;
                });

                //==========================

                $("#pinch-test").swipe( {
                    swipeStatus:function(event, phase, direction, distance , duration , fingerCount) {
                       $(this).find('#swipe_text').text("swiped " + distance + ' px');
                       if(phase === $.fn.swipe.phases.PHASE_END || phase === $.fn.swipe.phases.PHASE_CANCEL) {
                           //The handlers below fire after the status, 
                           // so we can change the text here, and it will be replaced if the handlers below fire
                           $(this).find('#swipe_text').text("No swipe was made");
                       }
                    },
                    pinchStatus:function(event, phase, direction, distance , duration , fingerCount, pinchZoom) {
                        $(this).find('#pinch_text').text("pinched " + distance + " px ");
                        if(phase === $.fn.swipe.phases.PHASE_END || phase === $.fn.swipe.phases.PHASE_CANCEL) {
                           //The handlers below fire after the status, 
                           // so we can change the text here, and it will be replaced if the handlers below fire
                           $(this).find('#pinch_text').text("No pinch was made");
                       }
                    },
                    swipe:function(event, direction, distance, duration, fingerCount) {
                         $(this).find('#swipe_text').text("You swiped " + direction + " with " + fingerCount + " fingers");
                    },
                    pinchIn:function(event, direction, distance, duration, fingerCount, pinchZoom) {
                        $(this).find('#pinch_text').text("You pinched " +direction + " by " + distance +"px, zoom scale is "+pinchZoom); 
                    },
                    pinchOut:function(event, direction, distance, duration, fingerCount, pinchZoom) {
                        $(this).find('#pinch_text').text("You pinched " +direction + " by " + distance +"px, zoom scale is "+pinchZoom);
                    },
                    fingers:$.fn.swipe.fingers.ALL	
                });





                //======================
            }
        );
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
