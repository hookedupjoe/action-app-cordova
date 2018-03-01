/*
Author: Joseph Francis
License: MIT
*/
//---  WorkspacesPage module --- --- --- --- --- --- --- --- --- --- --- --- 
(function (ActionAppCore, $) {

    var SiteMod = ActionAppCore.module("site");
    var AppModule = ActionAppCore.module("app");
//                ThisPage.loadRegion('center', ThisApp.renderTemplate(thisPageSpecs.pageNamespace + ':page-body', tmpContext));

    var thisPageSpecs = {
        pageName:"WorkspacesPage", 
        pageTitle: "Workspaces", 
        pageNamespace: 'ws',
        navOptions:{
            topLink:true,
            sideLink:true,
            icon: 'desktop'
        },
        //linkDisplayOption:'sidebar',
        appModule:AppModule
    };
    
    thisPageSpecs.pageTemplates = {
        baseURL: 'app/pages/WorkspacesPage/tpl',
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
    ThisPage.pageSpecs = thisPageSpecs;

    ThisPage._onInit = function(theApp) {
        ThisPage._svg = theApp.getComponent("plugin:SvgControls");
        ThisPage._om = theApp.om;
    }

    //--- Hook into the app lifecycle as needed
    ThisPage._onFirstActivate = function() {
        ThisPage.initOnFirstLoad();
    }

    //--- Implement this apge
    ThisPage.doSomething = function () {
        var tmpMarkup = '<hr/>We did something';
        var tmpVal = $('[field="ws:demo-field"]').val();
        if( tmpVal ){
            tmpMarkup += ' with ' + tmpVal
        }
        ThisApp.addToFacet('ws:workspaces-out', tmpMarkup);
    }
    

})(ActionAppCore, $);
