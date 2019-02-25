/*
Author: Joseph Francis
License: MIT
*/

//---  Quick Page module --- --- --- --- --- --- --- --- --- --- --- --- 
//--- Example of page that does not use templates for layout
//---  the system auto creates a layout, can be used directly
//--- facets are prefix:region  (i.e. quick:center)
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");

    var thisPageSpecs = {
        pageName: "QuickPage",
        pageTitle: "Quick Page",
        pageNamespace: 'quick',
        navOptions: {
            icon: 'arrow up',
            topLink: true,
            sideLink: true
        },
        appModule: AppModule
    };

    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/QuickPage/tpl',
        //---  Using a template, but not for the UI
        templateMap: {
            "quick-msg-item.html": thisPageSpecs.pageNamespace + ":msg-ctr-item"
        }
    }

    thisPageSpecs.layoutOptions = {
        facetPrefix: thisPageSpecs.pageNamespace
        , north: true
        , south: true
        , east: false
        , west: true
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
    ThisPage._onPreInit = function (theApp) {
    }
    ThisPage._onInit = function (theApp) {
        ThisPage._om = theApp.om;
        ThisPage._webctl = theApp.getComponent("plugin:WebControls");
    }

    //=== On Page Activation ===
    /*
    * This happens the first time the page is activated and happens only one time
    *    Do the lazy loaded stuff in the initial activation, then do any checks needed when page is active
    *    Do stuff that needs to be available from this component, such as services, 
    *     that are needed even if the page was not activated yet
    */
    ThisPage._onFirstActivate = function () {
        
        //--- Do the layout initiaze stuff
        ThisPage.initOnFirstLoad().then(
            function () {
                //--- Do one time init stuff, minus stuff we do every time the page is activated
                initUI()
                //--- Call activate routine if stuff is there
                // Can also just do it twice if one call, no difference
                ThisPage._onActivate();
            }
        );
    }

    ThisPage._onActivate = function () {
        refreshUI();
    }

    function refreshUI() {
        //--- Automatically refresh messsage on page load
        refreshMessageCenter();
        showInFooter("Messages Refreshed!")
    }

    function showInFooter(theText){
        ThisPage.loadFacet('quick:footer-text', theText)
    }

    function initUI() {
        //--- Can load directly from HTML

        var tmpHTML = [];
        tmpHTML.push('<h2 class="ui header" style="padding:5px;margin:4px;">')
        tmpHTML.push('  <i class="plug icon"></i>')
        tmpHTML.push('  <div class="content">')
        tmpHTML.push('Plug and play pages')
        tmpHTML.push('  </div>')
        tmpHTML.push('</h2>')
        ThisPage.loadFacet('quick:north',tmpHTML.join(''))

        tmpHTML = [];
        tmpHTML.push('<div class="ui label large fluid basic black">')
        tmpHTML.push('  <i class="info icon"></i>')
        tmpHTML.push('<span facet="quick:footer-text"></span>')
        tmpHTML.push('  <a class="detail" style="float:right;margin-right:10px;">View Messages</a>')
        tmpHTML.push('</div>')
        ThisPage.loadFacet('quick:south',tmpHTML.join(''))

        
        //--- Can load a Workspace using code / data
        ThisPage.westWS = ThisPage._webctl.newWorkspace({ facet: "quick:west" });
        var tmpWSMenu = {
            "objects": [
                {
                    "cid": "sui-buttons",
                    "states": {
                        "color": "green",
                        "controls": [
                            {
                                "label": "Send Test Messages",
                                "action": "quick:sendTestMessages"
                            },
                            {
                                "color": "blue",
                                "label": "Show Messages",
                                "action": "quick:refreshMessageCenter"
                            },
                            {
                                "color": "orange",
                                "label": "Open Designer",
                                "action": "quick:openDesigner"
                            }
                        ],
                        "orientation": "vertical",
                        "fluid": true
                    }
                }
            ]
        }
        

        $.when(
            ThisPage.westWS.loadFromObject(tmpWSMenu)
        ).then(function () {
            ThisApp.refreshLayouts();
        })

    }
    ThisPage.openDesigner = function () {
        ThisApp.gotoPage('WorkspacesPage');
    }

    
    ThisPage.refreshMessageCenter = refreshMessageCenter;
    function refreshMessageCenter() {
        var tmpContext = { messages: ThisApp.getMessages() }
        $('[facet="quick:center"]').html(ThisApp.renderTemplate('quick:msg-ctr-item', tmpContext));
    }

    ThisPage.sendTestMessages = sendTestMessages;
    function sendTestMessages() {
        ThisApp.appMessage("Just some info");
        ThisApp.appMessage("Successful message here.", true, { title: "It was updated", data: { what: "nothing" } });
        ThisApp.appMessage("Warning, Warning, Warning!", "w", { title: "This is just a warning", data: { reason: "It is important" } });
        ThisApp.appMessage("There was an error, in case you want to take action, see the data.", "e", { data: { reason: "It is important" } });
        ThisApp.appMessage("Just some info to log in messages, but now show in the UI", "i", { noshow: true });
        refreshMessageCenter();
    }



})(ActionAppCore, $);
