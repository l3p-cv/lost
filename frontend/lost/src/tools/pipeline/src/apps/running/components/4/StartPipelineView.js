import { WizardTabView } from "pipRoot/l3pfrontend/index"

class StartPipelineTab extends WizardTabView {
    constructor(){
        const config = {
            icon: "fa fa-check",
            content: `
                <div style="width: 50%;margin: 0 auto; text-align:center">
                    <h3>Complete</h3>
                    <p>You have successfully completed all steps.</p>
                    <button id="startPipe" type="button" class="btn btn-primary btn-lg">
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