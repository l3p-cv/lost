import WizardTabPresenter from "wizard/WizardTabPresenter"
import TabInfoView from "./TabInfoView"
import AnnoTaskStartView from "../../../../views/AnnoTaskStartView"

class TabInfoPresenter extends WizardTabPresenter {
    constructor(presenter: any, modalView){
        super()
        this.view = new TabInfoView(presenter.model)
        $(this.view.nav.refs["a"]).on("click", () => {
            // check if is not null
                modalView.view.refs["outerModal"].style.width = '50%'
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

    
    /**
     * @override
     */
    isValidated(){
        return true
    }

}
export default TabInfoPresenter