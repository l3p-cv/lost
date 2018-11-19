import { WizardTabView } from 'pipRoot/l3pfrontend/index'

import './PipelineGraph.scss'

class PipelineGraphTab extends WizardTabView {
    constructor(){
        const config = {
            title: 'Fill out Elements',
            icon: 'fa fa-pencil',
            content: `
                <div class='btn-toolbar toolbar' role='toolbar'>
                    <div class='btn-group pull-right' role='group'>
                        <button data-ref='btn-next' class='btn btn-sm btn-default'>
                            <i class='fa fa-step-forward'></i>
                            <span>Next<span> 
                        </button>
                    </div>
                    <div class='btn-group pull-right' role='group'>
                        <button data-ref='btn-prev' class='btn btn-sm btn-default '>
                            <i class='fa fa-step-backward' aria-hidden='true'></i>
                            <span>Previous<span>    
                        </button>
                    </div>
                </div>
                <div id='dagre-graph-container' data-ref='dagre'></div>
            `,
        }
        super(config)
    }
}
export default new PipelineGraphTab()