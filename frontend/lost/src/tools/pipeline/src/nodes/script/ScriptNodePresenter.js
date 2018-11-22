import BaseNodePresenter from '../BaseNodePresenter'

import ScriptNodeModel from './ScriptNodeModel'

import NormalRunningView from './views/ScriptNormalRunningView'
import NormalStartView from './views/ScriptNormalStartView'
import ScriptRunningModal from './modals/ScriptRunningModal'
import ScriptStartModal from './modals/ScriptStartModal'


export default class ScriptNodePresenter extends BaseNodePresenter {
    constructor(graph, data, mode) {
        super(graph)
        // create model
        this.model = new ScriptNodeModel(data, mode)
        // create view
        switch (mode) {
            case 'running':
                this.view = new NormalRunningView(this.model)
                this.modal = new ScriptRunningModal(this.model)
                break
            case 'start':
                this.view = new NormalStartView(this.model)
                this.modal = new ScriptStartModal(this)
                $(this.modal.html.root).on('hidden.bs.modal', () => {
                    this.graph.updateNode(this)
                })
                break
            default:
                throw new Error(`no node view available for ${data.type}`)
        }

        $(this.modal.html.refs['more-information-link']).on('click', () => {
            $(this.modal.html.refs['collapse-this']).collapse('toggle')
            $(this.modal.html.refs['more-information-icon']).toggleClass('fa-chevron-down fa-chevron-up')
        })
    }


    /**
     * @override
     */
    initViewBinding() {
        $(this.view.parentNode).on('mousedown', `[data-ref='checkbox']`, () => {
            this.model.post.script.isDebug = !this.model.post.script.isDebug
            this.view = new NormalStartView(this.model)
            this.graph.updateNode(this)
        })

        $(this.view.parentNode).on('mouseover', (e) => {
            // show tooltip...
        })
    }
    /**
     * @override
     */
    initModelBinding() {
        if (this.view instanceof NormalRunningView) {
            this.model.progress.on('update', number => {
                this.view.parentNode.querySelector(`[data-ref='progress-bar']`).style.width = `${number}%`
                this.view.parentNode.querySelector(`[data-ref='progress-bar-text']`).textContent = `${number}%`
            })
            this.model.state.on('update', text => {
                this.view.parentNode.querySelector(`[data-ref='state']`).setAttribute('class', `panel-footer 
                    ${ text === 'script_error' ? 'bg-red' : ''}
                    ${ text === 'pending' ? 'bg-blue' : ''}
                    ${ text === 'in_progress' ? 'bg-orange' : ''}
                    ${ text === 'finished' ? 'bg-green' : ''}`)
                this.view.parentNode.querySelector(`[data-ref='state-text']`).textContent = text.replace('_', ' ')
            })
            this.model.progress.on('update', number => {
                this.modal.html.refs['progress-bar'].style.width = `${number}%`
                this.modal.html.refs['progress-bar-text'].textContent = `${number ? number : 0}%`
            })
            this.model.errorMsg.on('update', text => {
                if (text !== null) {
                    this.modal.html.refs['error-msg'].style.display = 'block'
                    this.modal.html.refs['error-msg-text'].textContent = text
                }
                else {
                    this.modal.html.refs['error-msg'].style.display = 'none'
                    this.modal.html.refs['error-msg-text'].textContent = ''
                }
            })
            this.model.state.on('update', text => {
                this.modal.html.refs['state'].textContent = text
            })
        }
    }
}





