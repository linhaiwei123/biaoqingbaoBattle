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
            this._stand = true;//解除腾空标志位
            this.node.position.y = this._groundY;//修正玩家落地位置
        }
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
            //无法攻击处于闪避状态的玩家
            if(selfState == 'attacking' && otherState == 'shifting'){return;}
            //其他状态下玩家将能够受到攻击
            if(selfState == 'attacking'){
                let otherMoveControl = other.getComponent('move-control');
                //攻击后腾空
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
        if(this.control == ControlType.wsad){//判断两位玩家的输入映射
            switch(e.keyCode){
                //设置向左移动的标志位
                case cc.KEY.a: {this._left = true; this.node.scaleX = -1;break;}
                //设置向右移动的标志位
                case cc.KEY.d: {this._right = true;this.node.scaleX = 1;break;}
                case cc.KEY.w: {
                    if(!this._stand){return;}//如果腾空 则不允许重复设置腾空标志位
                    this._jumpTimeStamp = Date.now();//提供腾空时间戳
                    this._jumpPosition = this.node.position;//提供腾空起始位置
                    this._stand = false;//设置腾空标志位
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
         if(this.control == ControlType.wsad){//判断两位玩家的输入映射
            switch(e.keyCode){
                case cc.KEY.a: {this._left = false;break;}//解除向左移动的标志位
                case cc.KEY.d: {this._right = false;break;}//解除向右移动的标志位
            }
         }else{
            switch(e.keyCode){
                case cc.KEY.left: {this._left = false;break;}
                case cc.KEY.right: {this._right = false;break;}
            } 
         }
    },

    lateUpdate: function(){
        
        if(this._left){//判断左移标志位
            //渲染左移
            this.node.position = cc.pAdd(this.node.position,cc.v2(-15,0));
        }
        if(this._right){//判断右移标志位
            //渲染右移
            this.node.position = cc.pAdd(this.node.position,cc.v2(15,0));
        }

        if(!this._stand){//判断腾空标志位
            //以插值方式获取腾空时间戳至今的持续时间
            let deltaTime = (Date.now() - this._jumpTimeStamp)/1000;
            //以插值的方式直接计算出当前时间戳所在的高度
            //以 s = so + vot + 1/2 gt² 模拟重力运动
            this.node.position = cc.v2(
                this.node.position.x,
                this._jumpPosition.y + (this.speedY * deltaTime + 0.5 * this.g * deltaTime * deltaTime)
            );
        }
    }

});
