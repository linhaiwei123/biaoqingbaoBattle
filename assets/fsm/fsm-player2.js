let StateMachine = require('state-machine');
let fsm = StateMachine.create({
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
});
fsm.ASYNC = StateMachine.ASYNC;
module.exports = fsm