import BaseNodeView from '../../BaseNodeView'


export default class AnnoTaskStartView extends BaseNodeView {
    constructor(model: AnnotaskStartModel){
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
					value: model.state.name,
					ref: 'name',
				},
				{
					attribute: 'Assignee',
					value: model.state.assignee.value,
					ref: 'assignee',
				},
			]
		})
    }
	updateName(name){
		this.html.refs['name'].textContent = name
	}
	updateAssignee(assignee){
		this.html.refs['assignee'].textContent = assignee
	}
}
