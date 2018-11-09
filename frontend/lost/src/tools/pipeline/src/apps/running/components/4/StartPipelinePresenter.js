import WizardTabPresenter from "wizard/WizardTabPresenter"
import StartPipelineView from "./StartPipelineView"

class StartPipelineTab extends WizardTabPresenter {
    constructor(){
        super()
        this.view = StartPipelineView
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
export default new StartPipelineTab()