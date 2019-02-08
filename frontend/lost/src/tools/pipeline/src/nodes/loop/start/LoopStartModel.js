import BaseNodeModel from '../../BaseNodeModel'


export default class LoopStartModel extends BaseNodeModel {
    constructor(params) {
		super(params)
    }
	getOutput(){
		const { peN, peOut, loop } = this
		const { max_iteration: maxIteration, peJumpId } = loop
		console.log(maxIteration)
		return {
			peN,
			peOut,
			loop: {
				maxIteration: maxIteration ? maxIteration: null,
				peJumpId,	
			},
		}
	}
}