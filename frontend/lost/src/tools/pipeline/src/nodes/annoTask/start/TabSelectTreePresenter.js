import { WizardTabPresenter } from 'pipRoot/l3pfrontend/index'
import TabSelectTreeView from './TabSelectTreeView'


export default class TabSelectTreePresenter extends WizardTabPresenter {
    constructor(nodeModel: AnnoTaskNodeModel) {
        super()
		
        this.view = new TabSelectTreeView(this.model)

        // MODEL BINDINGS
        nodeModel.controls.show3.on('update', () => this.show())
        
        // VIEW BINDINGS
        $(this.view.html.refs['table-tree']).find('tbody').on('click', 'tr', (e) => {
			// load labels

        })
    }
    isValidated(){
		return true
    }
}