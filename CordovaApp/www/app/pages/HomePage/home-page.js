/*
Author: Joseph Francis
License: MIT
*/

//---  Logs Page module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName:"HomePage", 
        pageTitle: "Home", 
        pageNamespace: 'home',
        navOptions: {
            icon: 'home',
            topLink:true,
            sideLink:true
        },
        appModule:AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/HomePage/tpl',
        //-- Page to lookup : name to call it when pulling
        //---  Good to "namespace" your templates with the page prefix to avoid name conflicts
        templateMap:{
            "page-header.html": thisPageSpecs.pageNamespace + ":page-header",
            "page-body.html": thisPageSpecs.pageNamespace + ":page-body",
            "page-footer.html": thisPageSpecs.pageNamespace + ":page-footer",
            "msg-ctr-item.html": thisPageSpecs.pageNamespace + ":msg-ctr-item"
        }
    }

    thisPageSpecs.layoutOptions = {
        templates: {
            "north": thisPageSpecs.pageNamespace + ":" + "page-header",
            "center": thisPageSpecs.pageNamespace + ":" + "page-body",
            "south": thisPageSpecs.pageNamespace + ":" + "page-footer"
        },  
        facetPrefix: thisPageSpecs.pageNamespace,
        north: true,
        west:false,
        east: false
    }

    //--- Start with a ase SitePage component
    var ThisPage = new SiteMod.SitePage(thisPageSpecs);

    ThisPage.templates = {};

    //===== Hook into the application lifecycle for this page =====
    // .. they happen in this order

    //=== On Application Load ===
    /*
    * This happens when the page is loaded, try to push activity back to when the tab is used
    *    If your component need to do stuff to be availale in the background, do it here
    */
    ThisPage._onPreInit = function(theApp){
        ThisPage.om = theApp.om;
        //console.log("Home Page: _onPreInit ");
        
    }
    ThisPage._onInit = function() {
        //console.log("Home Page: _onInit");
    }

    //=== On Page Activation ===
    /*
    * This happens the first time the page is activated and happens only one time
    *    Do the lazy loaded stuff in the initial activation, then do any checks needed when page is active
    *    Do stuff that needs to be available from this component, such as services, 
    *     that are needed even if the page was not activated yet
    */
    ThisPage._onFirstActivate = function(theApp){
        //console.log("Home Page: _onFirstActivate");

        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._webctl = theApp.getComponent("plugin:WebControls");
        
        ThisPage._om = theApp.om;
        ThisPage.inBuffer = 40;
        ThisPage.outBuffer = 12;
        ThisPage.minHeight = 50;


        //--- Demo special grid - Incomplete, just playing on this one
        ThisPage.refreshMainGrid = function(){

            $('[appuse="mobile-cards"]').each(function(theEl){
                var tmpEl = $(this);
                var tmpPF = $(tmpEl.closest('.ui-layout-pane'));
                var tmpPFH = tmpPF.height();
                var tmpPFW = tmpPF.width();

                //var tmpPMain = tmpEl.closest('[appuse="mobile-cards"]');
                //console.log("tmpPMain cards",tmpPMain);
                tmpEl.height(tmpPFH-ThisPage.outBuffer+2);
                //tmpPMain.height(tmpEl.height());
                var tmpPgs = tmpEl.find('section');
                var tmpH = tmpPFH-ThisPage.outBuffer;
                //tmpH = Math.min(tmpH,ThisPage.maxHeight);
                tmpPgs.height(tmpH);
                var tmpTotalW = $(window).width();
                
                //--- This works automatically in most cases, but found in testing, not always
                // ... so we are doing it here also / manually
                var tmpColCount = 1;
                if( tmpTotalW >= 960){
                    tmpColCount = 3
                } else if( tmpTotalW >= 620){
                    tmpColCount = 2
                }
                var tmpColW = tmpTotalW/tmpColCount;

                var tmpExtraBuffer = 1; //pixel?
                if( tmpColCount == 1){
                    tmpExtraBuffer += 5;
                }
                tmpPgs.width(tmpColW-(ThisPage.outBuffer/tmpColCount)-tmpExtraBuffer);
                
                tmpPgs = tmpEl.find('.page-frame');
                tmpPgs.each(function(){
                    var tmpSubEl = $(this);
                    var tmpIsScrolling = false;
                    var tmpSubHeight = tmpPFH-ThisPage.outBuffer-ThisPage.inBuffer;
                    if( tmpSubHeight < ThisPage.minHeight){
                        tmpSubHeight = ThisPage.minHeight;
                        tmpIsScrolling = true;
                    }
                    
                    
                    var tmpWide = (tmpPFH < tmpPFW);
                    var tmpRows = 2;
                    if( tmpWide ){
                        tmpRows = 1;
                    }

                    tmpSubEl.height(tmpSubHeight/tmpRows);

                    //--- SVGs needed width - root cause?
                    var tmpParentSection = $(tmpSubEl.closest('section'))
                    var tmpSubW = tmpParentSection.width();
                    var tmpScrollType = tmpIsScrolling ? 'auto' : 'hidden';
                    tmpParentSection.css('overflow-y',tmpScrollType);
                    tmpParentSection.height(tmpSubEl.height() + ThisPage.inBuffer);
                    
                    $(this).width(tmpColW-ThisPage.inBuffer-(tmpExtraBuffer*2));
                })
            })
        }

        ThisPage.showContextDialog = function(theTargetEl){
            var tmpPC = ThisApp.getByAttr$({pageuse: "contextmenu"});
            tmpPC.modal('setting', 'transition', 'fade')
                .modal('setting','duration',250)
                .modal('setting','centerable',false)
                .modal('setting','dimmerSettings',{ opacity: 0 });                
                if(theTargetEl){
                    tmpPC.modal('setting','context', theTargetEl)
                }
                tmpPC.modal('show');

            console.log("tmpPC",tmpPC);
        }
        ThisPage.aboutThisPage = function(){
            ThisApp.showCommonDialog({ header: "About this application", content: {data:'', template:'app:about-this-app'} });
        }
        ThisPage.initOnFirstLoad().then(
            function(){
                ThisPage.refreshMainGrid();
                var me = ThisPage;
                //--- Add any custom init stuff
                $('[appuse="home:home-sidebar"] .ui.sidebar')
                .sidebar({
                    context: $('[appuse="home:home-sidebar"] .bottom.segment')
                })
                .sidebar('attach events', '[appuse="home:home-sidebar"] .menu .item')
                ;
                
                var tmpTestAreaEl = me.getByAttr$({ facet: "home:testarea" });
                me.testAreaWS = me._webctl.getNewPanel();
                me.testAreaWS.init({ mom: tmpTestAreaEl[0]});
    
                //ToDo: me.testAreaWS.getControls(['sui-icon']);                 
                //to preload them all so we can add and know the order is good
                me.testAreaWS.addControl('icon-control-1', 'sui-icon', {states:{bordered:true, size:'huge',icon:'user',color:'blue'} }).then(function(theControl){
                    theControl.subscribe('onClick', function(){
                        console.log("click")
                       // ThisApp.aboutThisApp();
                       var tmpHTML = '';
                       tmpHTML += "Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />Testing<br />"
                       var tmpFooterHTML = '';
                       tmpFooterHTML += '<button class="ui button basic green">Testing</button>';
                       //Right Align if desired?
                       //tmpFooterHTML += '<div style="float:right;padding-right:5px;margin-bottom:5px;"><button class="ui button basic green">Testing</button></div>';

                       ThisApp.showCommonDialog({ footer: tmpFooterHTML,header: "About this page", content: tmpHTML });
                        //ThisApp.showCommonDialog({ header: "About this page", content: 'Hello World' });
                    })    
                    //me.testAreaIcon1 = theControl;
                    // --- Have to load all the controls in use in advance
                    // --   or control load order, this is NOT the way, this is a test
                    // --  Also note, you couild load the first, then the rest do load in order, no async involved                    
                    me.testAreaWS.addControl('icon-control-2', 'sui-icon', {states:{bordered:true, size:'huge',icon:'group',color:'green'} }).then(function(theControl){
                        theControl.subscribe('onClick', function(){

                            var tmpIOD = 'test';
                            var tmpHTMLForLargeOptionSet = '<h3>Select One</h3><div><i oid="' + tmpIOD + '" action="dlgSetColor" color="red" class="icon red huge square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" action="dlgSetColor" color="red" class="icon red huge square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /><i oid="' + tmpIOD + '" color="blue" action="dlgSetColor" class="icon huge blue square" /></div>';
                            ThisApp.showCommonDialog({ header: "Some options", content: tmpHTMLForLargeOptionSet });

                        })    
                    });
                    me.testAreaWS.addControl('icon-control-3', 'sui-icon', {states:{bordered:true, size:'huge',icon:'group',color:'purple'} }).then(function(theControl){
                        theControl.subscribe('onClick', function(){
                            ThisApp.showPopup({
                                el: theControl.el,
                                title: 'This object',
                                content: 'This is the object itself.'
                            })      
                        })                            
                    });
                    me.testAreaWS.addControl('icon-control-4', 'sui-icon', {states:{bordered:true, size:'huge',icon:'group',color:'orange'} }).then(function(theControl){
                        theControl.subscribe('onClick', function(){
                           
                            ThisApp.showPopup({
                                el: theControl.el,
                                title: 'This object',
                                content: 'When closed, I shall say so in the console',
                                onClose: function(){
                                    console.log('The popup is now closed, refresh anyone?')
                                }
                            })                            
                        })           
                    });
                });
                

                var tmpWorkAreaEl = me.getByAttr$({ facet: "home:workarea" });
                me.workAreaWS = me._svg.getNewPanel();
                me.workAreaWS.init({ svg: tmpWorkAreaEl[0], viewBox: {x: 0, y: 0, w: 150, h: 150} });

                me.workAreaWS.addControl('work-button-1', 'btn-round-glossy', {translateX: 5, translateY: 5, scale: .1,states:{switchColor:'#ffff00',switchStatus:true} }).then(function(theControl){
                    me.workAreaButton1 = theControl;
                });

                me.workAreaWS.addControl('work-button-2', 'btn-round-glossy', {translateX: 5, translateY: 50, scale: .1,states:{switchColor:'#ff0000',switchStatus:true} }).then(function(theControl){
                    me.workAreaButton2 = theControl;
                });

                me.workAreaWS.addControl('work-button-3', 'icon-database', {translateX: 50, translateY: 5, scale: .4,states:{iconToShow:'cloud'} }).then(function(theControl){
                    me.workAreaButton3 = theControl;
                });

                me.workAreaWS.addControl('work-button-4', 'icon-database', {translateX: 50, translateY: 55, scale: .4,states:{iconToShow:'cloud'} }).then(function(theControl){
                    me.workAreaButton4 = theControl;
                });

                var tmpFunAreaEl = me.getByAttr$({ facet: "home:funarea" });
                me.funAreaWS = me._svg.getNewPanel();
                me.funAreaWS.init({ svg: tmpFunAreaEl[0], viewBox: {x: 0, y: 0, w: 150, h: 150} });

                me.funAreaWS.addControl('fun-button-1', 'btn-round-glossy', {translateX: 5, translateY: 5, scale: .1,states:{switchColor:'#00ffff',switchStatus:true} }).then(function(theControl){
                    me.funAreaButton1 = theControl;
                });
                me.funAreaWS.addControl('fun-button-2', 'btn-round-glossy', {translateX: 5, translateY: 65,scale: .2,states:{switchColor:'#ff00ff',switchStatus:true} }).then(function(theControl){
                    me.funAreaButton2 = theControl;
                });
                me.funAreaWS.addControl('fun-button-3', 'on-off-g-r', {translateX: 65, translateY: 5, scale: .7,states:{switchStatus:true} }).then(function(theControl){
                    me.funAreaButton3 = theControl;
                });
                me.funAreaWS.addControl('fun-button-4', 'on-off-g-r', {translateX: 75, translateY: 85, scale: 1,states:{switchStatus:true} }).then(function(theControl){
                    me.funAreaButton4 = theControl;
                });

                var tmpZoomBarEl = me.getByAttr$({ facet: "home:zoom-control" });
                me.wsZoomControlWS = me._svg.getNewPanel();
                me.wsZoomControlWS.init({ svg: tmpZoomBarEl[0], viewBox: {x: 0, y: 0, w: 200, h: 20} });
                me.wsZoomControlWS.addControl('zoom-slider', 'horiz-slider', { sliderStart:0, sliderEnd: 100, sliderIncr: 10, sliderValue: 50, scale: .5 }).then(function(theControl){
                    me.wsZoomControl = theControl;
//                    me.wsZoomControl.subscribe("valueChanged", me.zoomValueChanged.bind(me));
                });

                var tmpHomeWsEl = me.getByAttr$({ facet: "home:home-ws" });
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

                $("#test").swipe( {
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


                
                ThisPage._onActivate();
            }
        );        
    }
    
    ThisPage._onActivate = function(){
        //console.log("Home Page: _onActivate");
        //Do Refresh of stuff
    }
    //--- End lifecycle hooks

    //--- Layout related lifecycle hooks
    ThisPage._onResizeLayout = function(){
        ThisPage.refreshMainGrid();
    }
    //--- End Layout related lifecycle hooks


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
        
})(ActionAppCore, $);
