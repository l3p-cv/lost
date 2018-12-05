import { WizardTabPresenter } from 'l3p-frontend'

import ConfigPipelineView from './ConfigPipelineView'

import appModel from '../../appModel'


class ConfigPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = ConfigPipelineView

		// TO MODEL
        this.name = ''
        this.description = ''
		// TO MODEL
		
        // MODEL BINDING
        appModel.controls.show3.on('update', () => this.show())

        // VIEW BINDING
        $(this.view.html.refs['name']).on('input', (e)=>{
            this.name = $(e.currentTarget).val()
        })
        $(this.view.html.refs['description']).on('input', (e)=>{
            this.description = $(e.currentTarget).val()      
        })
    }
	// WHAT IS THIS FOR?
    reset(){
		// TO MODEL
        this.name = null
        this.description = null
		// TO MODEL
        $(this.view.html.refs['name']).val(this.name)
        $(this.view.html.refs['description']).val(this.description)
    }
	// NOT FINISHED
    isValidated(){
		let result = true
		result = result && this.name.length > 0
		result = result && this.description.length > 0
        return result
    }
}
export default new ConfigPipelineTab()
