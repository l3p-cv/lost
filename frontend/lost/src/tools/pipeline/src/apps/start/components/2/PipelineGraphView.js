import WizardTabView from "wizard/WizardTabView"

import "./PipelineGraph.scss"

class PipelineGraphTab extends WizardTabView {
    constructor(){
        const config = {
            title: "Fill out Elements",
            icon: "fa fa-pencil",
            content: `



        <div class="btn-toolbar  toolbar " role="toolbar" aria-label="Toolbar with button groups">
            <div class="btn-group pull-right" role="group" aria-label="Second group">
                <button data-ref="btn-next" type="button" class="btn btn-sm btn-default">
                    <i class="fa fa-step-forward" aria-hidden="true"></i>  &nbsp;&nbsp;  
                    <span>Next<span> 
                 </button>
            </div>
            <div class="btn-group pull-right" role="group" aria-label="First group">
                <button data-ref="btn-prev" type="button" class="btn btn-sm btn-default ">
                    <i class="fa fa-step-backward" aria-hidden="true"></i>   &nbsp;&nbsp;  
                    <span>Previous<span>    
                </button>
            </div>
        </div>



                <div data-ref="dagre"></div>
                
            `,
        }
        super(config)
    }
}
export default new PipelineGraphTab()