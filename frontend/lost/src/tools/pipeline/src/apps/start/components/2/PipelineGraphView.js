import { WizardTabView } from 'pipRoot/l3pfrontend/index'

import './PipelineGraph.scss'

class PipelineGraphTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Fill out Elements',
            icon: 'fa fa-pencil',
            content: /*html*/`
                <div id='dagre-graph-container' data-ref='dagre'></div>
            `,
        }
        super(config)
    }
}
export default new PipelineGraphTab()