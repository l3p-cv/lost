import WizardTabPresenter from "wizard/WizardTabPresenter"
import ConfigPipelineView from "./ConfigPipelineView"

class ConfigPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = ConfigPipelineView
    }
    /**
     * @extend
     */
    validate(){
        super.validate(()=>{
            // ...
            return true
        })
    }
}
export default new ConfigPipelineTab()