import { WizardTabPresenter } from 'l3p-frontend'

import ConfigPipelineView from './ConfigPipelineView'


class ConfigPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = ConfigPipelineView
    }
}
export default new ConfigPipelineTab()