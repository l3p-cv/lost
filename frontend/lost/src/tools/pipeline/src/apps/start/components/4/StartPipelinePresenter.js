import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'

import * as http from 'pipRoot/http'

import appModel from '../../appModel'

import StartPipelineView from './StartPipelineView'
import SelectPipelinePresenter from '../1/SelectPipelinePresenter'
import PipelineGraphPresenter from '../2/PipelineGraphPresenter'
import ConfigPipelinePresenter from '../3/ConfigPipelinePresenter'


class StartPipelineTab extends WizardTabPresenter {
    constructor() {
        super()
        this.view = StartPipelineView
        
        // MODEL BINDING
        appModel.controls.show4.on('update', () => this.show())
        
        // VIEW BINDING
        $(this.view.html.refs['btn-prev']).on('click', () => {
            appModel.controls.show3.update(true)
        })
        $(this.view.html.refs.btnStartPipe).on('click', () => {
            if(ConfigPipelinePresenter.validated === false) {
                alert('Please go to third tab')
                return
            }
            if(PipelineGraphPresenter.validated === false) {
                alert('Please go to second tab')
                return
            }

            const data = {
				elements: PipelineGraphPresenter.nodes.map(node => node.model.getOutput()),
				templateId: SelectPipelinePresenter.templateId,
				name: ConfigPipelinePresenter.name,
				description: ConfigPipelinePresenter.description,
			}
            http.startPipe(data).then(response => {
				alert('started pipeline')
            })
        })
    }
}
export default new StartPipelineTab()