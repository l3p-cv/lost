import BaseNodeModel from '../../BaseNodeModel'


export default class LoopStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut, id, loop } = params

		super({ peN, peOut })

		this.id = id

		// data structure?
		this.loop = loop
    }
}