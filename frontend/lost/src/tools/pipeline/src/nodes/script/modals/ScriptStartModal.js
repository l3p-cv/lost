import 'webpack-jquery-ui/tooltip'

import { BaseModal } from 'pipRoot/l3pfrontend/index'


export default class ScriptStartModal extends BaseModal {
    constructor(presenter) {
        let nodeModel = presenter.model
        super({
            title: 'Script',
            content: `
                <table class='table table-hover'>
                    <tbody>
                        <tr><td><strong> Name: </strong></td><td>${nodeModel.script.name}</td></tr>
                        <tr><td><strong> Description: </strong></td><td> ${nodeModel.script.description} </td> </tr>
                    </tbody>
                </table>
                ${(nodeModel.script.arguments === '' || nodeModel.script.arguments === undefined || nodeModel.script.arguments === null)
                    ? ``
                    : `
                        <h4> Arguments Table </h4>            
                        <div style='margin-left: 15px; margin-right: 15px;'>
                            <table class='table table-bordered'>
                                <thead>
                                    <tr><th>Key</th><th>Value</th></tr>
                                </thead>
                                <tbody>
                                    ${Object.keys(nodeModel.script.arguments).map(element => `
                                        <tr
                                            data-toggle='tooltip' data-placement='right' 
                                            title = '<h4>Help</h4><p>${nodeModel.script.arguments[element].help}<p>'
                                            >
                                            <th>${element}</th>
                                            <td><input data-ref='${element}' type='text' value= '${nodeModel.script.arguments[element].value}' class='form-control'/></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `
                }
        
                <a class='cursor-pointer' data-ref='more-information-link'> 
                <u>More information </u>&nbsp;<i data-ref='more-information-icon' class='fa fa-chevron-down' aria-hidden='true'></i></a>        

                <div class='panel-group'>
                    <div class='panel panel-primary no-border'>                        
                        <div data-ref='collapse-this' class='panel-collapse collapse'>
                            <div class='panel-body'>
                                <table class='table table-hover'>
                                    <tbody>
                                        <tr><td><strong> Path: </strong></td><td class='word-break'>${nodeModel.script.path}</td></tr>
                                        <tr><td><strong> Language: </strong></td><td class='word-break'> ${nodeModel.script.language}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `
        })
        
        $(`[data-toggle='tooltip']`).tooltip({
            html: true,
            placement: 'right',
            container: 'body',
        })

        if(nodeModel.post.script.arguments !== null) {
            Object.keys(nodeModel.script.arguments).forEach(element => {
                $(this.view.refs[element]).on('input', (e) =>{
                    nodeModel.post.script.arguments[element].value = $(e.currentTarget).val()
                })
            })
        }
    }
}
