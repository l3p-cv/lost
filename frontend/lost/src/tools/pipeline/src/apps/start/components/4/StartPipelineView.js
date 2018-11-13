import { WizardTabView } from "pipRoot/l3pfrontend/index"
import "./StartPipeline.scss"

class StartPipelineTab extends WizardTabView {
    constructor() {
        const config = {
            title: "Last Step: Start your Pipe!",            
            icon: "fa fa-check",
            content: `
                <div class="btn-toolbar  toolbar " role="toolbar" aria-label="Toolbar with button groups">
                    <div class="btn-group pull-right" role="group" aria-label="Second group">
                        <button disabled data-ref="btn-next" type="button" class="btn btn-sm btn-default">
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

                <div style="width: 50%;margin: 0 auto; text-align:center">
                    <h3 class="title-start-pipeline-completed" >Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <button data-ref="btnStartPipe" type="button" class="btn btn-primary btn-lg">
                        <i class="fa fa-play-circle-o fa-5x"></i>
                        Start Pipe
                    </button>
                </div>
            `,
        }
        super(config)
    }
}
export default new StartPipelineTab()