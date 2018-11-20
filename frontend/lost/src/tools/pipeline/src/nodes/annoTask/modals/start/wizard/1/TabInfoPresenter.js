import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'
import TabInfoView from './TabInfoView'


export default class TabInfoPresenter extends WizardTabPresenter {
    constructor(node: AnnoTaskNodePresenter){
        super()
        this.view = new TabInfoView(node.model)

		// MODEL BINDINGS
		node.model.controls.show1.on('update', () => this.show())

		// VIEW BINDINGS
        $(this.view.html.refs['name']).on('input', ($event) => {
            node.model.post.annoTask.name = $event.target.value
        })
        $(this.view.html.refs['instructions']).on('input', ($event) => {
            node.model.post.annoTask.instructions = $event.target.value
        })
    }
}
