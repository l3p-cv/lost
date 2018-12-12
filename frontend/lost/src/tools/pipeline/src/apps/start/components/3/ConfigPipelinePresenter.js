import { WizardTabPresenter } from 'l3p-frontend'

import ConfigPipelineView from './ConfigPipelineView'

import appModel from '../../appModel'


class ConfigPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = ConfigPipelineView

        // MODEL BINDING
        appModel.controls.show3.on('update', () => this.show())
		appModel.state.pipelineName.on('update', name => this.view.updateName(name))
		appModel.state.pipelineDescription.on('update', description => this.view.updateDescription(description))

        // VIEW BINDING
        $(this.view.html.refs['name']).on('input', (e)=>{
            appModel.state.pipelineName.update($(e.currentTarget).val())
        })
        $(this.view.html.refs['description']).on('input', (e)=>{
            appModel.state.pipelineDescription.update($(e.currentTarget).val())
        })
	}
    isValidated(){
		const { pipelineName, pipelineDescription } = appModel.state
		let result = true
		result = result && pipelineName.value.length > 0
		result = result && pipelineDescription.value.length > 0
        return result
    }
}
export default new ConfigPipelineTab()
