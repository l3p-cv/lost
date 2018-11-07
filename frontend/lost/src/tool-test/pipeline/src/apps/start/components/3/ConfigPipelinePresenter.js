import WizardTabPresenter from "wizard/WizardTabPresenter"
import ConfigPipelineView from "./ConfigPipelineView"
import appModel from "../../appModel"


class ConfigPipelineTab extends WizardTabPresenter {
    
    constructor(){
        super()
        this.view = ConfigPipelineView
        this.name = ""
        this.description = ""
        this.validated = false

        let  validation = () => {
            if(this.name != "" && this.description != ""){
                this.validated = true
                $(this.view.html.refs["btn-next"]).prop("disabled", false)                                                
            }else{
                this.validated = false
                $(this.view.html.refs["btn-next"]).prop("disabled", true)    
            }

        }


        validation()
        $(this.view.html.refs["input-name"]).on('input', (e)=>{
            this.name = $(e.currentTarget).val()
            validation()
        })
        $(this.view.html.refs["input-description"]).on('input', (e)=>{
            this.description = $(e.currentTarget).val()      
            validation()    
        })
        appModel.controls.show3.on("update", () => this.show())
        $(this.view.html.refs["btn-next"]).on('click', () => {
            appModel.controls.show4.update(true)            
        })

        $(this.view.html.refs["btn-prev"]).on('click', () => {
            appModel.controls.show2.update(true)
        })

    }

    reset(){
        this.name = null
        this.description = null
        this.validated = false
        $(this.view.html.refs["btn-next"]).prop("disabled", true)            
        $(this.view.html.refs["input-name"]).val(this.name)
        $(this.view.html.refs["input-description"]).val(this.description)
    }

    
    /**
     * @extend
     */




    // validate(){
    //     super.validate(()=>{
    //         // ...
    //         return false
    //     })
    // }

    //@override
    isValidated(){
        return this.validated
    }
}
export default new ConfigPipelineTab()
