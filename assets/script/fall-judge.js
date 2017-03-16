cc.Class({
    extends: cc.Component,

    properties: {
        player1: cc.Node,
        player2: cc.Node,
        //deadY: 0,
        resultPanel: cc.Node,
        //ground: cc.Node,
        _gameOver: false,
    },

    onLoad: function () {
        this.resultPanel.on("touchstart",function(){
            this.resultPanel.active = false;
            this.player1.position = cc.v2(-287.3,-63);
            this.player2.position = cc.v2(288,-63)
            this._gameOver = false;
        }.bind(this))

        let manager = cc.director.getCollisionManager();
        manager.enabled = true;


    },

     onCollisionEnter: function(other,self){
        if(other.node.name == 'player'){
            //游戏结束
            if(this._gameOver){return}
            this._gameOver = true;
            this.resultPanel.getChildByName("label").getComponent(cc.Label).string = "game over";
            this.resultPanel.active = true;
        }
     }
});
