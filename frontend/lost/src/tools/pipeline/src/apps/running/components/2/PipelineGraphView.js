import { WizardTabView } from 'pipRoot/l3pfrontend/index'
import './PipelineGraph.scss'


class PipelineGraphTab extends WizardTabView {
	constructor(){
		super({
			title: 'Fill out Elements',
			icon: 'fa fa-pencil',
			content: /*html*/`
				<div class='btn-toolbar toolbar' role='toolbar'>
					<div class='btn-group pull-left' role='group'>
						<p 
						style= 'margin:0; line-height:2.3em; color:red; display:none;' // INLINE STYLE
						data-ref='update-label'>UPDATE</p>
					</div>
					<div class='btn-group pull-right' role='group'>
						<button data-ref='btn-toggle-infobox' type='button' class='btn btn-sm btn-default'>
						<i data-ref='btn-toggle-infobox-icon' class='fa fa-toggle-on'></i> &nbsp;&nbsp;
						<span>Toggle Infobox<span>
						</button>
					</div>
					<div class='btn-group pull-right' role='group'>
						<button data-ref='btn-delete-pipeline' type='button' class='btn btn-sm btn-default'>
						<i class='fa fa-trash'></i> &nbsp;&nbsp; // WHAT
						<span>Delete Pipeline<span>
						</button>
					</div>
					<div class='btn-group pull-right' role='group'>
						<button data-ref='btn-download-logfile' type='button' class='btn btn-sm btn-default'>
						<i class='fa fa-download'></i> &nbsp;&nbsp; // WHAT
						<span>Download Logfile<span>
						</button>
					</div>
					<div class='btn-group pull-right' role='group'>
						<button data-ref='btn-pause-pipe' type='button' class='btn btn-sm btn-default'>
						<i class='fa fa-pause'></i> &nbsp;&nbsp; // WHAT
						<span>Pause Pipeline<span>
						</button>
					</div>
					<div class='btn-group pull-right' role='group'>
						<button data-ref='btn-play-pipe' type='button' class='btn btn-sm btn-default'>
						<i class='fa fa-play'></i>&nbsp;&nbsp;
						<span>Play Pipeline<span>
						</button>
					</div>
				</div>
				<div data-ref='dagre'></div>
			`,
		})
	}
}
export default new PipelineGraphTab()