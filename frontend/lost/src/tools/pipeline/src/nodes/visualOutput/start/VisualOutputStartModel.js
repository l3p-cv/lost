import BaseNodeModel from '../../BaseNodeModel'


export default class VisualOutputStartModel extends BaseNodeModel {
    constructor(params, mode) {
		const { peN, peOut } = params

		super({ peN, peOut, mode })

		// what is this?
		this.visualOutput = ''
    }
}