import { BaseModal } from 'l3p-frontend'


export default class DataExportRunningModal extends BaseModal {
    constructor(nodeModel: DataExportRunningModel){
        const { dataExport } = nodeModel
        super({
            visible: dataExport.length === 0 ? false : true,
            title: 'Export',
            content: /*html*/`
                <table class='table table-hover'>
                    <thead>
                        <tr>
                            <th>Iteration</th>
                            <th>Download Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataExport.map((element, i) => /*html*/`
                            <tr>
                                <td>
                                    <strong>${element.iteration}<strong>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a data-ref="download-btn-${i}" href='#' class='btn btn-info' role='button'>
                                        ${element.file_path.substring(element.file_path.lastIndexOf('/') + 1, element.file_path.length)}
                                    </a>
                                    <a data-ref="download-hidden-btn-${i}" hidden href=''></a>
                                </td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            `   
        })
        this.dataExport = dataExport
    }
}