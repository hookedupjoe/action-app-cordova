/*
Author: Joseph Francis
License: MIT

Web controls Plugin:
 - Web Control: (n) an interactive controllable object
 
   - Web  Controls have ...
     - Actions to trigger options
     - States to describe / show the situation a control is in
        - Active, Selected, On/Off, Etc.
     - An instruction manual (specs) that provide details on what the control can do
        - Built-in specs make interacting with new controls easy      
*/


(function (ActionAppCore, $) {
    //--- Web Controls Plugin Add-On Modules --- --- --- --- --- --- --- --- --- --- --- --- 
    ActionAppCore.createModule("WebControls:catalog");
    ActionAppCore.createModule("WebControls:extension");

    //--- Modules this plugin will use --- --- --- --- --- --- --- --- --- --- --- --- 
    var MyMod = ActionAppCore.module("plugin");
    var WebCtlCatalogMod = ActionAppCore.module("WebControls:catalog");
    var WebCtlExtendMod = ActionAppCore.module("WebControls:extension");

    var thisCompName = 'WebControls';
    var thisCompActionPrefix = '_webctl';

    //--- This this component to the Plugin Module
    MyMod[thisCompName] = ThisPageController;


    var ThisApp = null;

    var thisComponentID = "plugin:" + thisCompName;

    //--- Base class for application pages
    function ThisPageController(theOptions) {
        this.options = theOptions || {};
        this.actions = this.options.actions || {};
        var defaults = {};
        if (typeof (this.options.app) == 'object') {
            ThisApp = this.options.app;
            if (ThisApp && ThisApp.registerComponent) {
                ThisApp.registerComponent(thisComponentID, this);
            }
        }
    }
    var me = ThisPageController.prototype;
    //---ToDo: Duplicate, pull from somewhere unified?
    me.controlsBaseURL = "./webctl-catalog/controls/";

    me.init = init;
    function init(theApp) {
        //--- Register this components action delegate prefix
        //- plugins that start with _ are plugins only.
        //- ** Do not use _ for non-plugin delegates
        ThisApp.registerActionDelegate(thisCompActionPrefix, runAction);
        return this;
    }

    me.getNewPanel = function (theOptions) {
        return new WebCtlExtendMod.WebCtlPanel(theOptions);
    }

    function runAction(theAction, theSourceObject) {
        if (typeof (me[theAction]) == 'function') {
            me[theAction](theAction, theSourceObject);
        }
    }

    //---ToDo: Duplicate, pull from somewhere unified?
    me.controlsBaseURL = "./webctl-catalog/controls/";
    var controlPromises = {};

    /*
    *
    * Function: getControl
    *  - gets a control from cache if avail, else pulls via ajax
    * 
    *  **** This is a way to dynamically load script, 
    *       which can then dynamically load content.
    */
    me.getControl = function (theControlName) {
        var dfd = jQuery.Deferred();
        if (me.hasControl(theControlName)) {
            var tmpNew = me._getNewControl(theControlName);
            dfd.resolve(tmpNew);
        } else {
            var tmpBaseURL = me.controlsBaseURL + theControlName + "/";
            //--- Get the control, when the control loads - it registers itself
            //    Once a control is registered in the WebCtlCatalogMod module, 
            //      it can be created using the me._getNewControl function
            jQuery.getScript(tmpBaseURL + "control.js")
                .done(function () {
                    dfd.resolve(me._getNewControl(theControlName));
                })
                .fail(function (theError) {
                    console.error("Error loading script " + theError);
                    dfd.reject(theError);
                });
        }

        return dfd.promise();
    }

    me._getNewControl = function (theControlName) {
        var tmpNew = new WebCtlCatalogMod[theControlName];
        return tmpNew;
    }

    me.hasControl = function (theControlName) {
        return WebCtlCatalogMod.hasOwnProperty(theControlName);
    }

    me.resolveWhenLoaded = function (theControlName, thePromise) {
        me.controlPromises(theControlName) = thePromise;
    }

})(ActionAppCore, $);

///--- End of the plugin





//--- WebControl Functionality =========== =========== =========== =========== =========== =========== =========== 
(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");
    var WebCtlExtendMod = ActionAppCore.module("WebControls:extension");

    //--- Base class for application pages
    function ThisExtention() {

    }
    var me = ThisExtention.prototype;

    //-- Every WebControl has quick access to common setDisplay function
    $.extend(me, ExtendMod.SetDisplay)
    //-- Every WebControl has built-in pub-sub functionality
    $.extend(me, ExtendMod.PubSub)

    me.createdCount = 0;
    me.loadedControls = {};

    me.getAsObject = getAsObject;
    function getAsObject() {
        var tmpRet = {};
        tmpRet.oid = this.oid;
        tmpRet.cid = this.cid;

        tmpRet.states = this.states || {};
        return tmpRet;
    }

    me.loadStates = loadStates;
    function loadStates(theStates) {
        var tmpStates = theStates || {};
        for (var aStateName in tmpStates) {
            if (aStateName) {
                var tmpStateValue = tmpStates[aStateName];
                this.setState(aStateName, tmpStateValue);
            }
        }
    }

    //--- This is the parent / default setState function
    me._setState = setState;
    //--- This may be overridden, if so, the this._setState can be called to call the parent version
    me.setState = setState;
    function setState(theState, theValue) {
        this.states[theState] = theValue;
        return true;
    }
    me.getState = getState;
    function getState(theState) {
        if (!theState) {
            return undefined;
        }
        return this.states[theState]
    }    

    me.getTransform = getTransform;
    function getTransform() {
        var tmpRet = '';
        // tmpRet += 'translate(' + this.translateX + ',' + this.translateY + ') ';
        // tmpRet += 'scale(' + this.scale + ') ';
        return tmpRet;
    }

    me.refreshLocation = function () {
        // this.controlWrap.attr("transform", this.getTransform());
    }


    me.getMousePos = function (thePoint) {
       //see other duplicate functon for notes
    }

    me.objectClicked = objectClicked;
    function objectClicked(theEvent) {
        if (this.parentWS && this.parentWS.objectClicked) {
            this.parentWS.objectClicked(theEvent, this);
        }
    }

    me.initControl = initControl;
    function initControl(theParentContainer, theOptions) {
        this.initPubSub();
        var dfd = jQuery.Deferred();
        this.colorOffset = 0;
        var tmpThisControl = this;

        var tmpOptions = theOptions || {};
        //-- Every control name and title is the same, add to prototype
        this.controlName = tmpOptions.controlName;
        this.controlTitle = tmpOptions.controlTitle;

        //-- Each object has shorthand cid that has the id of the control this object is based on
        tmpThisControl.cid = this.controlName;

        //-- Each object has states that track params that control the object
        //tmpThisControl.states = $.extend({}, tmpOptions.states || {});

        //-- Each object should have access to the WebControls plugin
        me._webctl = ActionAppCore.app.getComponent("plugin:WebControls");
        me.baseURL = me._webctl.controlsBaseURL + tmpThisControl.controlName + "/";

        var tmpFacetName = $(theParentContainer).attr("facet");
        tmpThisControl.mom = $('[facet="' + tmpFacetName + '"]').get(0);

        if (typeof (tmpOptions.colorOffset) == 'number') {
            tmpThisControl.colorOffset = tmpOptions.colorOffset;
        }
        var tmpBaseURL = me.baseURL;

        // var tmpWebCtlFrag = document.createDocumentFragment();
        // var tmpWebCtlBase = d3.select(tmpWebCtlFrag).append("webctl");
        // var tmpWebCtlNode = tmpWebCtlBase.node();

        var tmpOID = theOptions.oid || (tmpThisControl.cid + "-" + me.createdCount++);

        if (tmpThisControl.mom) {
            //--- ToDo: Cleanup of events when removed?
            var tmpNewEl = document.createElement("webctl");
            tmpThisControl.mom.appendChild(tmpNewEl);
            var tmpAddedEl = tmpNewEl; //$(tmpThisControl.mom).find('webctl').get(0);
            tmpAddedEl.setAttribute('id', tmpOID);
            tmpAddedEl.setAttribute('oid',tmpOID);
            tmpThisControl._el = tmpAddedEl;
            tmpThisControl.el = $(tmpThisControl._el);

//*******************            
            //--- ToDo: Move this, do not want events by default *****
            if (typeof (tmpOptions.onClick) == 'function') {
                $(tmpThisControl._el).on("click", tmpOptions.onClick);
            }
            //--- always also catch the click event
            $(tmpThisControl._el).on("click", tmpThisControl.objectClicked.bind(tmpThisControl));
          
            if (typeof (tmpOptions.onContextMenu) == 'function') {
                var tmpFN = tmpOptions.onContextMenu.bind(tmpThisControl);
                $(tmpThisControl._el).contextmenu(function(e){
                    if( !e.isDefaultPrevented() ){
                        e.preventDefault();
                        tmpFN();    
                    }
                });
            }
        }

        
        tmpThisControl.states = {};

        //--- To Do, get message / details when fully loaded and do it then
        // setTimeout(function () {
        //     tmpThisControl.loadStates(tmpOptions.states || {});
        // }, 10);

        tmpThisControl.refreshLocation();

        dfd.resolve(tmpThisControl);
        
        return dfd.promise();

    }

    //--- return the prototype to be marged with prototype of target object
    //ExtendMod.WebControl = me;
    WebCtlExtendMod.WebControl = me;

})(ActionAppCore, $);








//--- WebCtlPanel Functionality =========== =========== =========== =========== =========== =========== =========== 

(function (ActionAppCore, $) {

    var ExtendMod = ActionAppCore.module("extension");
    var WebCtlExtendMod = ActionAppCore.module("WebControls:extension");

    //--- Base class for application pages
    function ThisExtention() {

    }

    var me = ThisExtention.prototype;

    //-- Every WebCtlPanel has built-in pub-sub functionality
    //$.extend(me, ExtendMod.PubSub)
    //-- Every WebCtlPanel has quick access to common setDisplay function
    $.extend(me, ExtendMod.SetDisplay)

    me.removeControl = function (theObjectOrID) {
        var tmpID = theObjectOrID;
        if (typeof (theObjectOrID) == 'object' && theObjectOrID.oid) {
            tmpID = theObjectOrID.oid;
        }
        this.workspaceControls[tmpID] = undefined;
        delete this.workspaceControls[tmpID];
        $(this.mom).find('[oid="' + tmpID + '"]').remove();
    }

    //--- Called by objects when they are clicked
    me.objectClicked = objectClicked;
    function objectClicked(theEvent, theObj) {
        //console.log("object clicked", theEvent, theObj, theDetails)
    }


    me.getAsObject = getAsObject;
    function getAsObject() {
        var tmpRet = {};

        //--- In order
        tmpRet.objects = [];
        var tmpAllObjects = $(this.mom).find('[oid]');
        var tmpLen = tmpAllObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpAllObjects[i];
                var tmpOID = tmpO.getAttribute('oid');
                var tmpObj = this.workspaceControls[tmpOID];
                if (tmpObj && typeof (tmpObj.getAsObject) == 'function') {
                    var tmpObjDetails = tmpObj.getAsObject();
                    if (tmpObjDetails && tmpObjDetails.oid) {
                        tmpRet.objects.push(tmpObjDetails);
                    }
                }

            }
        }
        return tmpRet;
    }

    me.clear = clear;
    function clear() {
        var tmpAllObjects = $(this.mom).find('[oid]');
        var tmpLen = tmpAllObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpAllObjects[i];
                $(tmpO).remove();
                //ToDo: Remove listeners?
            }
        }
        this.activeControl = null;
        this.workspaceControls = {};
        this.controlsAddedAt = {};
    }

    me.loadFromObject = loadFromObject;
    function loadFromObject(theObject) {
        if (typeof (theObject) != 'object') {
            console.error("loadFromObject - Error: No object passed to load.")
            return false;
        }
        var tmpRet = {};

        this.clear();

        var tmpObjects = theObject.objects || [];
        var tmpLen = tmpObjects.length;
        if (tmpLen > 0) {
            for (var i = 0; i < tmpLen; i++) {
                var tmpO = tmpObjects[i];
                var tmpOID = tmpO.oid;
                var tmpCID = tmpO.cid;
                //console.log("tmpO", tmpO);
                this.addControl(tmpOID, tmpCID, tmpO)

            }
        }


        return tmpRet;
    }

    me.init = init;
    function init(theOptions) {
        this.originalViewBox = theOptions.viewBox || { x: 0, y: 0, w: 800, h: 800 };
        this.currentViewBox = $.extend({}, this.originalViewBox);
        this.workspaceControls = {};
        this.drag = null;
        this.mom = null;
        this.dPoint = null;
        this.dragOperation = '';

        this.activeControl = null;
        //console.log("INit",this,theOptions)
        me._webctl = me._webctl || ActionAppCore.app.getComponent("plugin:WebControls");
        theOptions = theOptions || {};
        this.mom = theOptions.mom || false;
        if (!this.mom) {
            console.error("A parent element is required to setup a WebCtlPanel")
        }

        this.AttachListeners();

    }

    me._getViewBoxString = function (theObj) {
        return '' + theObj.x + ' ' + theObj.y + ' ' + theObj.w + ' ' + theObj.h;
    }

    /**
      * addControl
      *    - adds a control to this Workspace
      * 
      * To Use: <any ws>.addControl('', 'some-control-name', {some:options});
      *
      * @param  {String} theObjectID   [A unique id for this conrol]
      *    Note: Use blank to have auto-generated unique id for this conrol
      * @param  {String} theControlName   [The name/id of the control from the control catalog]
      * @param  {Object} theOptions   [standard options object with control options such as scale, transformX, etc]
      * @return void
      */
    me.addControl = function (theObjectID, theControlName, theOptions) {
        var dfd = jQuery.Deferred();
        theOptions = theOptions || {};
        var tmpThis = this;
        tmpThis.controlsAddedAt = tmpThis.controlsAddedAt || {};

        var tmpAt = tmpThis.controlsAddedAt[theControlName] || 0;
        var tmpObjID = theObjectID || '';
        if (tmpObjID == '') {
            for (var i = tmpAt; i < tmpAt + 10000; i++) {
                ///-- find unused slot for this control, ok if it uses one removed, just has to be unique
                var tmpCheck = theControlName + ":" + i;
                if (!tmpThis.workspaceControls.hasOwnProperty(tmpCheck)) {
                    tmpObjID = tmpCheck;
                    tmpThis.controlsAddedAt[theControlName] = i + 1;
                    break;
                }
            }
        }

        $.when(me._webctl.getControl(theControlName)).then(
            function (theNewControl) {
                var tmpOptions = { scale: 1 }; //onClick: me.controlClick, 
                if (typeof (theOptions) == 'object') {
                    $.extend(tmpOptions, theOptions);
                }
                tmpOptions.oid = tmpObjID;
                theNewControl.init(tmpThis.mom, tmpOptions);
                tmpThis.workspaceControls[tmpObjID] = theNewControl;
                theNewControl.parentWS = tmpThis;
                dfd.resolve(theNewControl);
            }
        );
        return dfd.promise();
    }

    me.AttachListeners = AttachListeners;
    function AttachListeners() {
        this.mom.onmousedown = DragProcess.bind(this);
        this.mom.onmousemove = DragProcess.bind(this);
        this.mom.onmouseup = DragProcess.bind(this);

        var tmpFN = onContextMenu.bind(this);
        $(this.mom).contextmenu(function(e){
            if( !e.isDefaultPrevented() ){
                e.preventDefault();
                tmpFN();    
            }
        })

        $(document.body).on('mouseup', DragUp.bind(this));
    }
    function onContextMenu(){
       //Depending on mode, this will do different stuff
        $.contextMenu({
            selector: '.page-frame', 
            callback: function(key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m); 
            },
            items: {
                "edit": {name: "Edit", icon: "edit"},
                "cut": {name: "Cut", icon: "cut"},
               copy: {name: "Copy", icon: "copy"},
                "paste": {name: "Paste", icon: "paste"},
                "delete": {name: "Delete", icon: "delete"},
                "sep1": "---------",
                "quit": {name: "Quit", icon: function(){
                    return 'context-menu-icon context-menu-icon-quit';
                }}
            }
        });
    }


    me.DragUp = DragUp;
    function DragUp(e) {
        if (this.drag) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.drag = null;
        this.dragOperation = '';
        if (this.activeControl) {
            if (this.dragOperation == 's') {
                this.activeControl.translateX = 0;
                this.activeControl.translateY = 0;

            }
            this.activeControl = false;
        }
    }

    this.DragProcess = DragProcess;
    function DragProcess(e) {

        var t = e.target, id = t.id, et = e.type;
        if (e.ctrlKey == true || e.altKey == true) {
            if (e.ctrlKey == true) {
                this.dragOperation = 'm';
            } else {
                this.dragOperation = 's';
            }
            e.preventDefault();
            e.stopPropagation();
                this.MoveDrag(e);
        }

        // stop drag no matter what
        if ((et == "mouseup")) {
            //console.log("DragUp");
            //this.drag.className.baseVal="draggable";
            this.drag = null;
            this.dragOperation = '';
            if (this.activeControl) {
                if (this.dragOperation == 's') {
                    this.activeControl.translateX = 0;
                    this.activeControl.translateY = 0;

                }
                this.activeControl = false;
            }
        }
    }

    //var this.activeControl = false;

    // Drag function that needs to be modified;//
    me.MoveDrag = MoveDrag;
    function MoveDrag(e) {

        var t = e.target, id = t.id, et = e.type; m = MousePos.bind(this)(e);
        //        //console.log("MoveDrag",et,m)

        if (!this.drag && (et == "mousedown")) {
            var tmpParent$ = ($(t).closest('[oid]'));
            //            //console.log("tmpParent$",tmpParent$);
            if (!tmpParent$ || tmpParent$.length == 0) {
                return;
            }

            var tmpOID = tmpParent$.attr("oid") || '';
            var tmpScale = 1;
            var tmpControl = this.workspaceControls[tmpOID];
            if (tmpControl) {
                this.activeControl = tmpControl;
                tmpScale = this.activeControl.scale;
            }
            var tmpParent = tmpParent$[0].parentNode;
            if (!tmpParent._x) {
                tmpParent._x = tmpControl.translateX;
                tmpParent._y = tmpControl.translateY;

            }

            this.dPoint = m;
            this.dPoint.scale = tmpScale;
            // //console.log("setting drag",tmpParent)
            this.drag = tmpParent;

            //this.drag = tmpControl.controlWrap[0];
        }

        // drag the spawned/copied draggable element now
        if (this.drag && (et == "mousemove")) {

            var tmpScale = 1;
            var tmpX = 0;
            var tmpY = 0;

            if (this.activeControl) {

                if (this.dragOperation == 's') {

                    tmpX = this.activeControl.translateX;
                    tmpY = this.activeControl.translateY;
                    this.dPoint.origX = this.dPoint.origX || this.dPoint.x;
                    var tmpDiff = m.x - this.dPoint.x;
                    this.dPoint.x = m.x;

                    var tmpDiffOrig = m.x - this.dPoint.origX;

                    var tmpDiffPerc = Math.abs(tmpDiffOrig) / 500;
                    var tmpMoveAmt = .02;
                    if (tmpDiffPerc > .4) {
                        tmpMoveAmt *= 5;
                    }
                    if (tmpDiff > 0) {
                        this.activeControl.scale += tmpMoveAmt
                    } else {
                        this.activeControl.scale -= tmpMoveAmt
                    }


                } else {
                    this.drag._x += m.x - this.dPoint.x;
                    this.drag._y += m.y - this.dPoint.y;
                    this.dPoint = m;
                    tmpX = this.drag._x;
                    tmpY = this.drag._y;
                    this.activeControl.translateX = this.drag._x;
                    this.activeControl.translateY = this.drag._y;
                    tmpScale = this.activeControl.scale;
                }
                tmpScale = this.activeControl.scale;


                //this.activeControl.translateX = this.drag._x;
                //this.activeControl.translateY = this.drag._y;


            }

            this.drag.setAttribute("transform", "translate(" + tmpX + "," + tmpY + ") scale(" + (tmpScale) + "," + tmpScale + ") ");
        }

    }


    // adjust mouse position ??? Do we still need this?
    me.MousePos = MousePos;
    function MousePos(event) {
        //  //console.log("MousePos",this)
        //return this.getMousePos({ x: event.clientX, y: event.clientY })
        //for now ...
        return { x: event.clientX, y: event.clientY };
    }

    //--- Get Mouse Position, was relative to the related SVG workspace
    me.getMousePos = function (thePoint) {

        //ToDo: Implement for web ????

        //-- was this
        //var p = this.svg.createSVGPoint();

        //-- temp this now till used
        var p = {x:0,y:0};

        p.x = thePoint.x;
        p.y = thePoint.y;
        // var matrix = this.svg.getScreenCTM();
        // p = p.matrixTransform(matrix.inverse());
        var tmpX = p.x;
        var tmpY = p.y;
        if (tmpX < 0) {
            tmpX = 0;
        }
        if (tmpY < 0) {
            tmpY = 0;
        }
        return {
            x: tmpX,
            y: tmpY
        }
    }

    //--- return the prototype to be marged with prototype of target object

    WebCtlExtendMod.WebCtlPanel = ThisExtention;

})(ActionAppCore, $);



