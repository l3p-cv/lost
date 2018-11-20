import { WizardTabView } from 'pipRoot/l3pfrontend/index'

import './PipelineGraph.scss'

class PipelineGraphTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Fill out Elements',
            icon: 'fa fa-pencil',
            content: /*html*/`
                <div class='btn-toolbar toolbar' role='toolbar'>
                </div>
				// in order to remove the toolbar completely you need to give the dagre-graph container
				// a fixed width, else it can not mount. 
                <div id='dagre-graph-container' data-ref='dagre'></div>
            `,
        }
        super(config)
    }
}
export default new PipelineGraphTab()