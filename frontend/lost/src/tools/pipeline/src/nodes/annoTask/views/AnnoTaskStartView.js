import BaseNodeView from '../../BaseNodeView'

import appModel from 'start/appModel'


export default class AnnoTaskStartView extends BaseNodeView {
    constructor(model) {
		super({
			header: {
				icon: 'fa fa-pencil',
				title: 'Annotation Task',
				colorInvalidated: 'warning',
				colorValidated: 'success',
			},
			content: [
				{
					attribute: 'Name',
					value: model.post.annoTask.name,
				},
				{
					attribute: 'Assignee',
					value: model.meta.assignee,
				},
			]
		})
		// -------- ???
        let validation = false
        if(
            model.post.annoTask.instructions !== '' &&
            model.post.annoTask.name !== '' &&
            model.post.annoTask.labelLeaves.length > 0 &&
            model.post.annoTask.workerId !== undefined
        ){
            validation = true
        }
        model.validation = validation
        appModel.state.checkNodesValidation.update(true)
		// -------- ???
    }
}
