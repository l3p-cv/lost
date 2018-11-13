import { WizardTabPresenter } from "pipRoot/l3pfrontend/index"
import ConfigPipelineView from "./ConfigPipelineView"

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