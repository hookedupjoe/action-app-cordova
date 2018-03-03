//--- WebControl 
(function (ActionAppCore, $) {
    var WebCtlExtendMod = ActionAppCore.module("WebControls:extension");
    var WebCtlMod = ActionAppCore.module("WebControls:catalog");

    var thisControlName = 'sui-icon';
    var thisControlTitle = "Semantic UI Icon";
    var thisControlClass = 'SuiIcon';
    var me = ThisControl.prototype;
    //--- Base class for application pages
    function ThisControl(theOptions) {

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
            //this.publish('clicked',[this, this.getSliderValue()]);
            if( this.states.size == 'large'){
                this.states.size = 'huge';
            } else {
                this.states.size = 'large';
            }
            this.refreshUI();
        }
    }

    me.onContextMenu = function (e) {
        var tmpEl = e.target;

        var tmpParentEl = $(tmpEl).closest('[oid]');
        var tmpOID = tmpParentEl.attr('oid');
        //alert('bind ' + tmpOID)
        //alert($('[oid="' + tmpOID + '"]').length) 
        var tmpThisControl = this;
        $.contextMenu({
            selector:'[oid="' + tmpOID + '"]',
            items: {
                
                toggle: {
                    
                    icon: function(opt, $itemElement, itemKey, item){
                        // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                        var tmpIH = '<i class="icon large list"></i> ';
                        $itemElement.html('<button class="ui icon button blue basic context">' + tmpIH + 'Change Color</button>');
                        // Add the context-menu-icon-updated class to the item
                        return '';
                    },                   
                    name: "toggle",
                    
                    callback: (function (key, opt) {
                        //this.setSwitchStatus(!this.switchStatus);
                        var tmpNew = '';
                        if( this.states.color == 'green'){
                            tmpNew = 'blue'
                        } else {
                            tmpNew = 'green'
                        }
                        this.setState('color',tmpNew);
                        this.refreshUI();
                    }).bind(this)
                },
                turnon: {
                    
                    icon: function(opt, $itemElement, itemKey, item){
                        // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                        var tmpIH = '<i class="icon big ' + tmpThisControl.states.icon + '"></i> ';
                        $itemElement.html('<button class="ui icon button green basic context">' + tmpIH + 'Big</button>');
                        // Add the context-menu-icon-updated class to the item
                        return '';
                    },                   
                    name: "turnon",
                    
                    callback: (function (key, opt) {
                        this.setState('size','big');
                        this.refreshUI();
                    }).bind(this)
                },
                turnoff: {
                   
                    icon: function(opt, $itemElement, itemKey, item){
                        // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                        var tmpIH = '<i class="icon huge ' + tmpThisControl.states.icon + '"></i> ';
                        $itemElement.html('<button class="ui icon button green basic context">' + tmpIH + 'Huge</button>');
                        // Add the context-menu-icon-updated class to the item
                        return '';
                    },                   
                    name: "turnoff",
                    
                    callback: (function (key, opt) {
                        //this.setSwitchColor('#aaaaaa');
                        this.setState('size','huge');
                        this.refreshUI();
                        // var tmpItem = opt.$trigger[0];
                        // var tmpElOID = $(tmpItem).attr('oid');
                        // console.log("Clicked on " + key + " for oid: " + tmpElOID, tmpItem);
                    }).bind(this)
                }
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

