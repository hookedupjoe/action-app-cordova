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
        alert('context');
        return false;
    }

    function init(theParentContainer, theOptions) {
        var dfd = jQuery.Deferred();
        var tmpOptions = theOptions || {};

        tmpOptions.controlName = thisControlName;
        tmpOptions.controlTitle = thisControlTitle;
        tmpOptions.onClick = this.onClick.bind(this);
        tmpOptions.onContextMenu = this.onContextMenu.bind(this);

        this.options = theOptions || {};
        
        this.sliderValue = tmpOptions.sliderValue || 0;        
        this.sliderStart = tmpOptions.sliderStart || 0;
        this.sliderEnd = tmpOptions.sliderEnd || 100;
        this.sliderIncr = tmpOptions.sliderIncr || 5;
        
        this.oid = theOptions.oid || '';
        this.mom = theParentContainer;
        this.mom$ = $(this.mom);
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

