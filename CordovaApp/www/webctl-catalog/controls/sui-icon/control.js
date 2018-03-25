//--- WebControl 
(function (ActionAppCore, $) {
    var WebCtlExtendMod = ActionAppCore.module("WebControls:extension");
    var WebCtlMod = ActionAppCore.module("WebControls:catalog");

    var thisControlName = 'sui-icon';
    var thisControlTitle = "Semantic UI Icon";
    var thisControlClass = 'SuiIcon';
    var me = ThisControl.prototype;

    var colorList = {
        "red": "Red",
        "orange": "Orange",
        "yellow": "Yellow",
        "olive": "Olive",
        "green": "Green",
        "teal": "Teal",
        "blue": "Blue",
        "violet": "Violet",
        "purple": "Purple",
        "pink": "Pink",
        "brown": "Brown",
        "grey": "Grey",
        "black": "Black"
    };


    me.getMenuDefault = function(theType, theKey, theMenuItem, theOptionalDefault){
        var tmpRet = '';
        //--- Move up from this item, to the control then to the App in that order to look for defaults
        if( theMenuItem && theMenuItem.hasOwnProperty(theType) ){
            var tmpArea = theMenuItem[theType];
            if( typeof(tmpArea) == 'object' && tmpArea.hasOwnProperty(theKey)){
                var tmpVal = tmpArea[theKey];
                return tmpVal;
            }
        }
        if( this.hasOwnProperty('_menuDefaults') && this._menuDefaults.hasOwnProperty(theType) ){
            var tmpArea = this._menuDefaults[theType];
            if( typeof(tmpArea) == 'object' && tmpArea.hasOwnProperty(theKey)){
                var tmpVal = tmpArea[theKey];
                return tmpVal;
            }
        }
        if( ThisApp.hasOwnProperty('_menuDefaults') && ThisApp._menuDefaults.hasOwnProperty(theType) ){
            var tmpArea = ThisApp._menuDefaults[theType];
            if( typeof(tmpArea) == 'object' && tmpArea.hasOwnProperty(theKey)){
                var tmpVal = tmpArea[theKey];
                return tmpVal;
            }
        }
        return theOptionalDefault || '';
    }

    //--- Base class for application pages
    function ThisControl(theOptions) {
        this._menuDefaults = {
            button: {
                color:'blue',                
                size: 'large'
            },
            icon: {
                name: 'square outline',
                color:'purple',
                size: 'big'
            }
        }
        this._menu = {
            "color":{
                caption:'Set Color',
                icon: {
                    color:'purple',
                    name:'circle'
                },
                button: {
                    color:'purple'
                },
                callback: mnuSetColor
            },            
            "inverted":{
                caption:'Toggle Inverted',
                callback: mnuToggleInverted
            },            
            "size":{
                caption:'Set size',
                callback: mnuSetSize
            },            
            "extra":{
                caption:'Extra Item',
                disabled: true,
                callback: mnuSetSize
            }
        }
    }

    function dlgSetColor(theAction, theTargetEl){
        var tmpColor = $(theTargetEl).attr('color');
        this.setState('color',tmpColor);
        this.refreshUI();        
        ThisApp.closeCommonDialog();
    }

    function mnuSetColor(){
        var tmpIOD = this.el.attr('oid')
        ThisApp.registerAction("dlgSetColor", dlgSetColor.bind(this));
        var tmpEl = this.el;
        var tmpHTML = '';
        tmpHTML += '<div>';
        for( var aColor in colorList){
            var tmpColorLabel = colorList[aColor];
            tmpHTML += '<i oid="' + tmpIOD + '" action="dlgSetColor" color="' + aColor + '" class="icon ' + aColor + ' huge square" />';
        }
        tmpHTML += '</div>';
        ThisApp.showCommonDialog({ onClose: onSetColorClose, header: "Select a color", content: tmpHTML });
    }

    function mnuToggleInverted(){
        this.setState('inverted',!this.getState('inverted'));
        this.refreshUI();
    }

    function onSetColorClose(){
        console.log("closed")
        ThisApp.unRegisterAction("dlgSetColor");
    }
    function mnuSetSize(){
        var tmpNew = '';
        if( this.states.size == 'huge'){
            tmpNew = 'big'
        } else {
            tmpNew = 'huge'
        }
        this.setState('size',tmpNew);
        this.refreshUI();        
    }

    me.getMenuItemSpecs = function(theMenuKey, theMenuItem){
        var tmpThisControl = this;
        var tmpIconHTML = '';
        //--- If icon not specifically excluded, look for it here and then up the chain
        if( theMenuItem.icon !== false){
            var tmpIcon = theMenuItem.icon || '';
            var tmpIconColor = this.getMenuDefault('icon','color', theMenuItem);
            var tmpIconSize = this.getMenuDefault('icon','size', theMenuItem);
            var tmpIconName = theMenuItem.icon || '';
            if(typeof(theMenuItem.icon) == 'object'){
                tmpIconName = theMenuItem.icon.name || '';                
            }
            if( tmpIconName == ''){
                tmpIconName = this.getMenuDefault('icon','name', theMenuItem);
            }
            tmpIconHTML = '<i class="icon ' + tmpIconColor + ' ' + tmpIconSize + ' ' + tmpIconName + ' ' + '"></i> ';
        }
        var tmpButtonColor = '';
        var tmpButtonSize = '';

        if( theMenuItem.button !== false){
            tmpButtonColor = this.getMenuDefault('button','color', theMenuItem);
            tmpButtonSize = this.getMenuDefault('button','size', theMenuItem);
        }
        var tmpNewItem = {};
        var tmpCaption = theMenuItem.caption || '';
        var tmpAux = '';
        if( theMenuItem.disabled === true){
            tmpAux += ' disabled ';
            tmpNewItem.disabled = true;
        }
        var tmpContentHTML = '<button class="ui icon button ' + tmpAux + ' ' + tmpButtonColor + ' ' + tmpButtonSize + ' basic context">' + tmpIconHTML + ' ' + tmpCaption + '</button>';
        tmpNewItem.icon = function(opt, $itemElement, itemKey, item){
            $itemElement.html(tmpContentHTML);
            return '';
        };
        tmpNewItem.name = theMenuKey;
        if( theMenuItem.callback ){
            tmpNewItem.callback = theMenuItem.callback.bind(this);
        }
        return tmpNewItem;
    }

    me.getMenuItems = function(){
        var tmpThisControl = this;
        var tmpItems = {};
        for( aMenuKey in this._menu ){
            var tmpMenuItem = this._menu[aMenuKey];
            var tmpNewItem = this.getMenuItemSpecs(aMenuKey, tmpMenuItem);
            if( tmpNewItem ){
                tmpItems[aMenuKey] = tmpNewItem
            }
        }
        return tmpItems;
    }

    $.extend(me, WebCtlExtendMod.WebControl);
    
    me.refreshUI = refreshUI;
    function refreshUI(){
        var tmpHTML = 'icon ';
        if( this.states.size ){
            tmpHTML+= ' ' + this.states.size;
        }
        if( this.states.icon ){
            tmpHTML+= ' ' + this.states.icon;
        }
        if( this.states.color ){
            tmpHTML+= ' ' + this.states.color;
        }
        if( this.states.bordered ){
            tmpHTML+= ' bordered';
        }
        if( this.states.inverted === true ){
            tmpHTML+= ' inverted';
        }

        tmpHTML = '<i class="' + tmpHTML + '"></i>';
        this.el.html(tmpHTML);
    }


    me.init = init;

    me.setState = setState;
    function setState(theState, theValue) {
        if (!theState) {
            return false;
        }
        // if (theState == 'something') {
        //     this.dosomethingwith(theValue);
        // }
        //--- Always saves in states
        this.states[theState] = theValue;
        return true;
    }

    me.onClick = function (e) {
        if (e && e.detail && e.ctrlKey !== true && e.altKey !== true) {
            this.publish('onClick',[this]);

//--- To trigger context menu ...
            //this.onContextMenu({trigger:'left'});

//--- To effect yourself ...
            // if( this.states.size == 'large'){
            //     this.states.size = 'huge';
            // } else {
            //     this.states.size = 'large';
            // }
            // this.refreshUI();
        }
    }

    me.onContextMenu = onContextMenu;
    function onContextMenu(theOptions) {
        var tmpParentEl = this.el;
        var tmpOID = tmpParentEl.attr('oid');
        var tmpThisControl = this;
        var tmpOptions = theOptions || {};
        this.publish('onContextMenu',[this]);
        ThisApp.clearActivePopup();
        var tmpItems = this.getMenuItems();


        $.contextMenu({
            selector: '[oid="' + tmpOID + '"]', 
            build: function($trigger, e) {
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                return {
                    items: tmpItems
                };
            }
        });


    }

    function init(theParentContainer, theOptions) {
        var dfd = jQuery.Deferred();
        var tmpOptions = theOptions || {};

        tmpOptions.controlName = thisControlName;
        tmpOptions.controlTitle = thisControlTitle;

        //--- Here we can optionally hook into the click and context menus
        tmpOptions.onClick = this.onClick.bind(this);
        tmpOptions.onContextMenu = this.onContextMenu.bind(this);

        this.options = theOptions || {};
     
        
        this.oid = theOptions.oid || '';
        this.container = theParentContainer;
        this.container$ = $(this.container);
        //--- Call default parent functionality to initialize a control
        var tmpThisControl = this;
        var tmpPromise = this.initControl(theParentContainer, tmpOptions).then(
            function (theControl) {
                //theControl.el is the base jQuery element
                //theControl._el is the base raw element, same as .el.get();
                //tmpThisControl.demoSomethings = theControl.el.find("div");
                
                //--- Set all states and then call refreshUI for best performance
                if( tmpOptions.states ){
                    $.extend(tmpThisControl.states, tmpOptions.states);
                }
                tmpThisControl.refreshUI();
                
                // for( var aSN in tmpOptions ){
                //     tmpThisControl.setState(aSN, tmpOptions[aSN])
                // }

                dfd.resolve(tmpThisControl);
            }
        );
        return dfd.promise();
    }
   //--- Add This control to the Web Control module as available
   WebCtlMod[thisControlName] = ThisControl;

})(ActionAppCore, $);

