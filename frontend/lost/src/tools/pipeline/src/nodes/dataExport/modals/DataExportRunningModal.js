import { BaseModal } from 'pipRoot/l3pfrontend/index'


export default class DataExportRunningModal extends BaseModal {
    constructor(nodeModel){
        const params = {
            visible: `${nodeModel.dataExport.length === 0 ? `false`:`true`}`,
            title: 'Export',
            content: `
                <table class='table table-hover'>
                    <thead>
                        <tr>
                            <th>Iteration</th>
                            <th>Download Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${nodeModel.dataExport.map(element => `
                            <tr>
                                <td>
                                    <strong>${element.iteration}<strong>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a href='/${element.file_path}' class='btn btn-info' role='button'>
                                        ${element.file_path.substring(element.file_path.lastIndexOf('/') + 1, element.file_path.length)}
                                    </a>
                                </td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            `   
        }
        super(params)
    }
}