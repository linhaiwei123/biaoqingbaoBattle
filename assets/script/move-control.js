let ControlType = cc.Enum({
    wsad: 0,
    arrow: 1
});
cc.Class({
    extends: cc.Component,

    editor: {
        //executeInEditMode: true,
    },

    properties: {
        //move-control prop
        _left: false,
        _right: false,
        _groundY: -63,
        _stand: true,
        speedY: 30,
        
        //_airComboTime: 0,
        _jumpTimeStamp: 0,
        _jumpPosition: null,
        g: -50,
        control: {
            default: ControlType.wsad,
            type: ControlType
        },

        //fix the touch of players
        _isPlayerTouching: false,
        _otherPlayerCollider: null,
        _selfPlayerCollider: null,

        //aciton fsm control prop
        _actionFsmControl: null,

        //edge fall prop
        _outOfEdge: false,
        _edgeFallTimeStamp: 0,
        _edgeFallPosition: null,

        
    },

    onLoad: function () {
        //move contrl load
        cc.systemEvent.on("keydown",this.onKeyDown.bind(this));
        cc.systemEvent.on("keyup",this.onKeyUp.bind(this));

        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        
        //action fsm control load
        this._actionFsmControl = this.getComponent("action-fsm-control");
    },

    onCollisionEnter: function(other,self){
        if(other.node.name == "ground"){
            this._stand = true;
            this.node.position.y = this._groundY;
        }

        //if we attack other shift
        //return
        //else call other's jump state and hurt action
        
        

        if(other.node.name == 'player'){
            this._isPlayerTouching = true;
            this._otherPlayerCollider = other;
            this._selfPlayerCollider = self;
            this.calPlayerTouchResult();
        }
        
    },

    calPlayerTouchResult: function(){
        let self = this._selfPlayerCollider;
        let other = this._otherPlayerCollider;
        let selfState = self.getComponent('move-control')._actionFsmControl._fsm.current;
            let otherState = other.getComponent('move-control')._actionFsmControl._fsm.current;
            if(selfState == 'attacking' && otherState == 'shifting'){return;}
            if(selfState == 'attacking'){
                let otherMoveControl = other.getComponent('move-control');
                //otherMoveControl._airComboTime++;
                otherMoveControl._stand = false;
                otherMoveControl._jumpPosition = other.node.position;
                otherMoveControl._jumpTimeStamp = Date.now();
                let otherActionFsmControl = other.getComponent('action-fsm-control');
                otherActionFsmControl.onHurt(self.node.scaleX);
            }
    },

    onCollisionExit: function(other,self){
        if(other.node.name == 'player'){
            this._isPlayerTouching = false;
        }
    },

    onKeyDown: function(e){
        //console.log("keydown");
        if(this.control == ControlType.wsad){
            switch(e.keyCode){
                case cc.KEY.a: {this._left = true; this.node.scaleX = -1;break;}
                case cc.KEY.d: {this._right = true;this.node.scaleX = 1;break;}
                case cc.KEY.w: {
                    if(!this._stand){return;}
                    //jump
                    this._jumpTimeStamp = Date.now();
                    this._jumpPosition = this.node.position;
                    this._stand = false;
                    //this.speedY = 30;
                    break;
                }
            }
        }else{
            switch(e.keyCode){
                case cc.KEY.left: {this._left = true; this.node.scaleX = -1;break;}
                case cc.KEY.right: {this._right = true;this.node.scaleX = 1;break;}
                case cc.KEY.up: {
                    if(!this._stand){return;}
                    //jump
                    this._jumpTimeStamp = Date.now();
                    this._jumpPosition = this.node.position;
                    this._stand = false;
                    //this.speedY = 30;
                    break;
                }
            }
        }
    },

    onKeyUp: function(e){
        //console.log("keyup");
         if(this.control == ControlType.wsad){
            switch(e.keyCode){
                case cc.KEY.a: {this._left = false;break;}
                case cc.KEY.d: {this._right = false;break;}
            }
         }else{
            switch(e.keyCode){
                case cc.KEY.left: {this._left = false;break;}
                case cc.KEY.right: {this._right = false;break;}
            } 
         }
    },

    lateUpdate: function(){
        
        if(this._left){
            this.node.position = cc.pAdd(this.node.position,cc.v2(-15,0));
        }
        if(this._right){
            this.node.position = cc.pAdd(this.node.position,cc.v2(15,0));
        }

        if(!this._stand){
            //in the air
            let deltaTime = (Date.now() - this._jumpTimeStamp)/1000;
            //speedYRate would not let player combo
            //let speedYRate = 1 / (1 << this._airComboTime);
            this.node.position = cc.v2(this.node.position.x,this._jumpPosition.y + (this.speedY * deltaTime + 0.5 * this.g * deltaTime * deltaTime));
            //console.log(this.node.position);
        }
        if(this._stand){
            this._airComboTime = 0;
        }
    }

});
