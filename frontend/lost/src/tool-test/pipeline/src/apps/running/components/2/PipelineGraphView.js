import WizardTabView from "wizard/WizardTabView"
import appModel from "../../appModel"

import "./PipelineGraph.scss"

class PipelineGraphTab extends WizardTabView {
    constructor(){
        const config = {
            title: "Fill out Elements",
            icon: "glyphicon glyphicon-pencil",
            content: `
 
            <div class="btn-toolbar  toolbar " role="toolbar" aria-label="Toolbar with button groups">
              <div class="btn-group pull-left" role="group" aria-label="First group">
                <p 
                style= "margin:0; line-height:2.3em; color:red; display:none;" 
                data-ref="update-label" >UPDATE</p>
              </div>
              <div class="btn-group pull-right" role="group" aria-label="First group">
                <button data-ref="btn-toggle-infobox" type="button" class="btn btn-sm btn-default ">
                <i data-ref="btn-toggle-infobox-icon" class="fa fa-toggle-on" aria-hidden="true"></i> &nbsp;&nbsp;
                <span>Toggle Infobox<span>
                </button>
              </div>
              <div class="btn-group pull-right" role="group" aria-label="Second group">
                <button data-ref="btn-delete-pipeline" type="button" class="btn btn-sm btn-default">
                <i class="fa fa-trash" aria-hidden="true"></i> &nbsp;&nbsp;
                <span>  Delete Pipeline<span>
                </button>
              </div>
              <div class="btn-group pull-right" role="group" aria-label="Second group">
                <button data-ref="btn-download-logfile" type="button" class="btn btn-sm btn-default">
                <i class="fa fa-download" aria-hidden="true"></i> &nbsp;&nbsp;
                <span>Download Logfile<span>
                </button>
              </div>
              <div class="btn-group pull-right" role="group" aria-label="Second group">
                <button data-ref="btn-pause-pipe" type="button" class="btn btn-sm btn-default">
                <i class="fa fa-pause" aria-hidden="true"></i> &nbsp;&nbsp;
                <span>  Pause Pipeline<span>
                </button>
              </div>
              <div class="btn-group pull-right" role="group" aria-label="Second group">
                <button data-ref="btn-play-pipe" type="button" class="btn btn-sm btn-default">
                <i class="fa fa-play"></i>&nbsp;&nbsp;
                <span>Play Pipeline<span>
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