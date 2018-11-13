import BaseNodePresenter from '../BaseNodePresenter'
import AnnoTaskNodeModel from './AnnoTaskNodeModel'

import AnnoTaskRunningView from './views/AnnoTaskRunningView'
import AnnoTaskStartView from './views/AnnoTaskStartView'

import AnnoTaskRunningModal from './modals/AnnoTaskRunningModal'
import AnnoTaskStartModal from './modals/startModal/AnnoTaskStartModal'
import AnnoTaskStartModalModel from './modals/startModal/AnnoTaskStartModalModel'


export default class AnnoTaskNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {
        super(graph)                      
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
                this.modalModel = new AnnoTaskStartModalModel()
                this.modal = new AnnoTaskStartModal(this)
                $(this.modal.view.root).on('hidden.bs.modal',() => {
                    this.graph.updateNode(this)           
                })
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }

        // VIEW BINDINGS
        $(this.modal.view.refs['more-information-link']).on('click', () =>{
            $(this.modal.view.refs['collapse-this']).collapse('toggle')
            $(this.modal.view.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
        })
    }
    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof AnnoTaskRunningView){
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
                this.modal.view.refs['progress-bar'].style.width = `${number}%`
                this.modal.view.refs['progress-bar-text'].textContent = `${number? number: 0}%`
            })
            this.model.state.on('update', text => {
                this.modal.view.refs['state'].textContent = text
            })
        }
    }
    /**
     * @override
     */
    initModelBinding(){
        // this.model.annoTask.name.on('after-update', () => this.update(true))
    }
}