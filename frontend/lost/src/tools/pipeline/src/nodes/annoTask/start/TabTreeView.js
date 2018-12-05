import "./TabTreeStyle.scss"

import { WizardTabView } from 'l3p-frontend'
import { Network } from "vis"
// http://visjs.org/docs/network/


export default class TabTreeView extends WizardTabView {
    constructor(){
        super({
            title: 'Select Labels',
            icon: 'fa fa-tag fa-1x',
            content: /*html*/`
				<div data-ref='vis-graph'></div>
            `,
        })
		this.options = {
			autoResize: true,
			height: '500px',
			layout:{
				hierarchical:{
					enabled: true,
					sortMethod: 'directed'
				}
			}
			// locale: 'en',
			// locales: locales,
			// clickToUse: false,
			// configure: {...},    // defined in the configure module.
			// edges: {...},        // defined in the edges module.
			// nodes: {...},        // defined in the nodes module.
			// groups: {...},       // defined in the groups module.
			// layout: {...},       // defined in the layout module.
			// interaction: {...},  // defined in the interaction module.
			// manipulation: {...}, // defined in the manipulation module.
			// physics: {...},      // defined in the physics module.
		}
    }
	update(data){
		this.graph = new Network(this.html.refs['vis-graph'], data, this.options)
	}
}
