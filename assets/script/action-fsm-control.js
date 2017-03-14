let ControlType = cc.Enum({
    jk: 0,
    "12": 1
});

cc.Class({
    extends: cc.Component,

    properties: {
        _fsm: null,
        _anim: null,
        _originSpriteFrame: null,
        attackSpriteFrame: cc.SpriteFrame,
        shiftSpriteFrame: cc.SpriteFrame,
        control:  {
            default: ControlType.jk,
            type: ControlType
        },
        fsmName: "",
        _moveControl: null,
    },

    
    onLoad: function () {
        //fix the situation that player touch each other
        this._moveControl = this.getComponent('move-control');

        // origin sprite frame set
        //issue #2 may be this is a reference  nope
        this._originSpriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
        
        //action fsm load 
        this._fsm = require(this.fsmName);
        this._fsm.startup();

        //test cc.action here

        cc.systemEvent.on("keydown",this.onKeyDown.bind(this));


    },

    onKeyDown: function(e){
        if(this.control == ControlType.jk){
            switch(e.keyCode){
                case cc.KEY.j: {
                        this.onAttack();
                    break;
                }
                case cc.KEY.k: {
                        this.onShift();
                    break;
                }
            }
        }else{
           switch(e.keyCode){
                case cc.KEY.num1: {
                        this.onAttack();
                    break;
                }
                case cc.KEY.num2: {
                        this.onShift();
                    break;
                }
            }
        }
    },

    onHurt: function(dir){
        this.node.runAction(cc.moveBy(0.4,dir * 50,0).easing(cc.easeSineOut(3)));
    },

    onAttack: function(){
        // if in attack fsm return
        if(this._fsm.current == 'attacking'){return;}
        //fix the situation that player touch each other
        this.setSpriteFrame(this.attackSpriteFrame);
        this._fsm.attack();
        if(this._moveControl._isPlayerTouching){
            this._moveControl.calPlayerTouchResult();
        }
            let action = this.attackAction();
            this.node.runAction(cc.sequence(
                action,
                cc.callFunc(this.onLeaveAction.bind(this))
        ));
    },
    onShift: function(){
        // if in shift fsm return
        if(this._fsm.current == 'shifting'){return;}
        this.setSpriteFrame(this.shiftSpriteFrame);
        this._fsm.shift();
            let action = this.shiftAction();
            this.node.runAction(cc.sequence(
                action,
                cc.callFunc(this.onLeaveAction.bind(this))
        ));
    },

    setSpriteFrame: function(sp){
        this.node.getComponent(cc.Sprite).spriteFrame = sp;
    },

    resetSpriteFrame: function(){
        this.node.getComponent(cc.Sprite).spriteFrame = this._originSpriteFrame;
    },

    shiftAction: function(){
        let skilldir = this.node.scaleX;
        let skillAction = cc.moveBy(0.3,cc.v2(skilldir * 35,0)).easing(cc.easeBounceOut(3));
        return skillAction;
    },

    attackAction: function(){
        let skilldir = this.node.scaleX;
        let skillAction = cc.moveBy(0.3,cc.v2(skilldir * 35,0)).easing(cc.easeBackOut(3));
        return skillAction;
    },

    onLeaveAction: function(){
        if(this._fsm.current = "attacking"){
            this._fsm.idle();
        }
        this.resetSpriteFrame();
    }

    
});
