import BaseNodePresenter from '../BaseNodePresenter'

import LoopNodeModel from './LoopNodeModel'

import LoopRunningView from './views/LoopRunningView'
import LoopStartView from './views/LoopStartView'

import LoopRunningModal from './modals/LoopRunningModal'
import LoopStartModal from './modals/LoopStartModal'


export default class LoopNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {      
        super(graph)
        // create model
        this.model = new LoopNodeModel(data, mode)
        // create view
        switch(mode){
            case 'running':
                this.view = new LoopRunningView(this.model)
                this.modal = new LoopRunningModal(this.model)
                break
            case 'start':
                this.view = new LoopStartView(this.model)
                this.modal = new LoopStartModal(this.model)
                $(this.modal.html.refs['max-iteration']).on('input', (e)=>{
                    this.model.loop.maxIteration = e.currentTarget.value
                    this.view = new LoopStartView(this.model)
                })
                $(this.modal.html.root).on('hidden.bs.modal',() => {
                    this.graph.updateNode(this)           
                })
                break
            default: throw new Error(`no node view available for ${data.type}`)
        }
    }
    /**
     * @override
     */
    initViewBinding(){
        if(this.view instanceof LoopRunningView){
            this.model.state.on('update', text => {
                this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
                    ${ text === 'script_error'   ? 'bg-red'      : '' }
                    ${ text === 'pending'        ? 'bg-blue'     : '' }
                    ${ text === 'in_progress'    ? 'bg-orange'   : '' }
                    ${ text === 'finished'       ? 'bg-green'    : '' }`)
                this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
            })
            this.model.state.on('update', text => {
                this.modal.html.refs['state'].textContent = text
            })
        }
    }
    /**
     * @override
     */
    initModelBinding(){
    }
}