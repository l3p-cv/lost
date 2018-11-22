import BaseNodePresenter from '../BaseNodePresenter'
import AnnoTaskNodeModel from './AnnoTaskNodeModel'

import AnnoTaskRunningView from './views/AnnoTaskRunningView'
import AnnoTaskStartView from './views/AnnoTaskStartView'

import AnnoTaskRunningModal from './modals/running/AnnoTaskRunningModal'
import AnnoTaskStartModal from './modals/start/AnnoTaskStartModal'


export default class AnnoTaskNodePresenter extends BaseNodePresenter {
    constructor(graph: Graph, data: any, mode: String) {
        super(graph)                      
		this.mode = mode

        // create model
        this.model = new AnnoTaskNodeModel(data, mode)

        // create view
        switch(mode){
            case 'running':
                this.view = new AnnoTaskRunningView(this.model)
                this.modal = new AnnoTaskRunningModal(this.model)
                break
            case 'start':
                this.view = new AnnoTaskStartView(this.model)
                this.modal = new AnnoTaskStartModal(this)
                $(this.modal.html.root).on('hidden.bs.modal',() => {
                    this.graph.updateNode(this)           
                })
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }

        // VIEW BINDINGS
        $(this.modal.html.refs['more-information-link']).on('click', () =>{
            $(this.modal.html.refs['collapse-this']).collapse('toggle')
            $(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
        })
    }
    /**
     * @override
     */
    initViewBinding(){
    }
    /**
     * @override
     */
	// TODO: VIEW METHODS!
    initModelBinding(){
		if(this.mode === 'running'){
            this.model.progress.on('update', number => {
                this.view.parentNode.querySelector(`[data-ref='progress-bar']`).style.width = `${number}%`
                this.view.parentNode.querySelector(`[data-ref='progress-bar-text']`).textContent = `${number}%`
            })
            this.model.state.on('update', text => {
                this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
                    ${ text === 'script_error'   ? 'bg-red'      : '' }
                    ${ text === 'pending'        ? 'bg-blue'     : '' }
                    ${ text === 'in_progress'    ? 'bg-orange'   : '' }
                    ${ text === 'finished'       ? 'bg-green'    : '' }`)
                this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
            })
            this.model.progress.on('update', number => {
                this.modal.html.refs['progress-bar'].style.width = `${number}%`
                this.modal.html.refs['progress-bar-text'].textContent = `${number? number: 0}%`
            })
            this.model.state.on('update', text => {
                this.modal.html.refs['state'].textContent = text
            })
		}
    }
}