import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'
import TabTreeView from './TabTreeView'


export default class TabTreePresenter extends WizardTabPresenter {
    constructor(node: AnnoTaskNodePresenter) {
        super()
        
		this.view = new TabTreeView(this.model)

        node.model.controls.show4.on('update', (data) => this.loadTemplate(data))
    }
    loadTemplate(){
    }
}
