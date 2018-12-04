import { WizardTabPresenter } from 'l3p-frontend'
import StartPipelineView from './StartPipelineView'

class StartPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = StartPipelineView
    }
    validate(){
        super.validate(()=>{
            return true
        })
    }
}
export default new StartPipelineTab()