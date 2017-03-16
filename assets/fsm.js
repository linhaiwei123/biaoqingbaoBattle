let StateMachine = require('state-machine');
let fsmData = {
initial: 'nope',
//please select the enter-state here ↓
events: [
{"name":"startup","from":"nope","to":"idling"},
{"name":"idle","from":"attacking","to":"idling"},
{"name":"shift","from":"attacking","to":"shifting"},
{"name":"idle","from":"shifting","to":"idling"},
{"name":"shift","from":"idling","to":"shifting"},
{"name":"attack","from":"shifting","to":"attacking"},
{"name":"attack","from":"idling","to":"attacking"}
]
};
let create = function(){
let fsm = StateMachine.create(fsmData);
fsm.ASYNC = StateMachine.ASYNC;
return fsm;
}
module.exports = {create}