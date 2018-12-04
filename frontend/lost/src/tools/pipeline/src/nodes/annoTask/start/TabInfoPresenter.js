import { WizardTabPresenter } from 'l3p-frontend'
import TabInfoView from './TabInfoView'


export default class TabInfoPresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel){
        super()
		
        this.view = new TabInfoView(nodeModel)

		// MODEL BINDINGS
		nodeModel.controls.show1.on('update', () => this.show())

		// VIEW BINDINGS
        $(this.view.html.refs['name']).on('input', ($event) => {
            nodeModel.state.name = $event.target.value
        })
        $(this.view.html.refs['instructions']).on('input', ($event) => {
            nodeModel.state.instructions = $event.target.value
        })
    }
}
