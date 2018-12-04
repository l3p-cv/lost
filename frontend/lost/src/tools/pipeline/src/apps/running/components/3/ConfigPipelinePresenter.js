import { WizardTabPresenter } from 'l3p-frontend'
import ConfigPipelineView from './ConfigPipelineView'

class ConfigPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = ConfigPipelineView
    }
    validate(){
        super.validate(()=>{
            return true
        })
    }
}
export default new ConfigPipelineTab()