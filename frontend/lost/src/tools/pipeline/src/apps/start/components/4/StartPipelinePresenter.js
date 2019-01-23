import { WizardTabPresenter } from 'l3p-frontend'

import * as http from 'pipRoot/http'

import appModel from '../../appModel'

import StartPipelineView from './StartPipelineView'


class StartPipelineTab extends WizardTabPresenter {
    constructor() {
        super()
        this.view = StartPipelineView
        
        // VIEW BINDING
        $(this.view.html.refs.btnStartPipe).on('click', () => {
            http.startPipe(appModel.getOutput(), appModel.reactComponent.token).then(response => {
				// show pipeline after starting it.
				// at the moment we only redirect to running pipelines table.
				// should add a notification aswell.
				window.location.href = window.location.href.replace(/\/[\w-]+$/, "/dashboard")
            })
        })
    }
}
export default new StartPipelineTab()