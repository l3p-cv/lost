import { WizardTabPresenter } from "pipRoot/l3pfrontend/index"
import TabInfoView from "./TabInfoView"
import AnnoTaskStartView from "../../../../views/AnnoTaskStartView"


export default class TabInfoPresenter extends WizardTabPresenter {
    constructor(presenter: any, modalView){
        super()
        this.view = new TabInfoView(presenter.model)
        
        $(this.view.nav.root).on("click", () => {
            // check if is not null
            // modalView.view.refs["outerModal"].style.width = '50%'
        })
        $(this.view.html.refs["name"]).on('input', (e) => {
            presenter.model.post.annoTask.name = $(e.currentTarget).val()
            presenter.view = new AnnoTaskStartView(presenter.model)
        })
        $(this.view.html.refs["instructions"]).on('input', (e) => {
            presenter.model.post.annoTask.instructions = $(e.currentTarget).val()
            presenter.view = new AnnoTaskStartView(presenter.model)            
        })
    }
    isValidated(){
        return true
    }
}
