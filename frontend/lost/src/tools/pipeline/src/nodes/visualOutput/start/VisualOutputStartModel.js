import BaseNodeModel from '../../BaseNodeModel'


export default class VisualOutputStartModel extends BaseNodeModel {
    constructor(params) {
		const { peN, peOut } = params

		super({ peN, peOut })

		// what is this?
		this.visualOutput = ''
    }
}