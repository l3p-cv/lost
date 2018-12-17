import { WizardTabPresenter } from 'l3p-frontend'

import * as http from 'pipRoot/http'

import appModel from '../../appModel'

import StartPipelineView from './StartPipelineView'


class StartPipelineTab extends WizardTabPresenter {
    constructor() {
        super()
        this.view = StartPipelineView
        
        // MODEL BINDING
        appModel.controls.show4.on('update', () => this.show())
        
        // VIEW BINDING
        $(this.view.html.refs.btnStartPipe).on('click', () => {
            http.startPipe(appModel.getOutput(), appModel.state.token).then(response => {
				alert('started pipeline')
            })
        })
    }
}
export default new StartPipelineTab()