import * as http from 'pipRoot/http'
import appModel from 'apps/running/appModel'

import BaseNodePresenter from '../../BaseNodePresenter'

import DataExportRunningModel from './DataExportRunningModel'
import DataExportRunningView from './DataExportRunningView'
import DataExportRunningModal from './DataExportRunningModal'


export default class DataExportRunningPresenter extends BaseNodePresenter {
    constructor(graph, data){
		const model = new DataExportRunningModel(data)
		const view = new DataExportRunningView(model)
		const modal = new DataExportRunningModal(model)
        super({ graph, model, view, modal })
        modal.dataExport.forEach((el, i) => {
            $(modal.html.refs[`download-btn-${i}`]).on('click', $event => {
                $event.preventDefault()
           
                http.requestDataExport(el.file_path, appModel.reactComponent.token).then(blob => {
                        // create blob url
                        const objectURL = window.URL.createObjectURL(blob)
                        
                        // simulate click on download button
                        modal.html.refs[`download-hidden-btn-${i}`].href=objectURL
                        modal.html.refs[`download-hidden-btn-${i}`].download=el.file_path.substring(el.file_path.lastIndexOf('/') + 1, el.file_path.length)
                        modal.html.refs[`download-hidden-btn-${i}`].click()
                        window.URL.revokeObjectURL(objectURL);
                })
            })

        })
    }
    /**
     * @override
     */
    initViewBinding(){}
    /**
     * @override
     */
    initModelBinding(){}
}