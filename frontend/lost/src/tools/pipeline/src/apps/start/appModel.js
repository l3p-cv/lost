import { Observable } from 'l3p-frontend'

export default {
    data: {
        pipelineTemplates: new Observable({}),
    },
    state: {
        selectedTemplate: new Observable({}),
		pipelineElements: [],
		pipelineName: new Observable(''),
		pipelineDescription: new Observable(''),
		// auth token from redux.
        token: undefined,
    },
    controls: {
        show1: new Observable(false),
        show2: new Observable(false),
        show3: new Observable(false),
        show4: new Observable(false),
    },
	reset(){
		this.state.pipelineName.reset()
		this.state.pipelineDescription.reset()
	},
	getOutput(){
		const { selectedTemplate, pipelineElements, pipelineName, pipelineDescription } = this.state
		return {
			templateId: selectedTemplate.value.id,
			elements: pipelineElements.map(element => element.node.model.getOutput()),
			name: pipelineName.value,
			description: pipelineDescription.value,
		}
	}
}
