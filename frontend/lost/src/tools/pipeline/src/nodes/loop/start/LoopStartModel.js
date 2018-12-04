import BaseNodeModel from '../../BaseNodeModel'


export default class LoopStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut, id, loop } = params

		super({ peN, peOut, mode })

		this.id = id

		// data structure?
		this.loop = loop
    }
}