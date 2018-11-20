

import { BaseModal } from 'pipRoot/l3pfrontend/index'
import appModel from 'apps/running/appModel'

export default class ScriptRunningModal extends BaseModal {
    constructor(nodeModel){
        super({
            id: nodeModel.peN,
            title: 'Script',
            content: `
                <table class='table table-hover'>
                    <tr>
                        <td><strong>Script Name: </strong></td>
                        <td>${nodeModel.script.name}</td>
                    </tr>
                    <tr>
                        <td><strong>Description: </strong></td>
                        <td>${nodeModel.script.description}</td>
                    </tr>
                </table>

                <div class='container'>
                    <div class='progress'>
                        <div data-ref='progress-bar' class='progress-bar' role='progressbar' 
                            style='width:${nodeModel.progress.value}%'>
                            <p data-ref='progress-bar-text' class='color-black'>
                                ${nodeModel.progress.value}%
                            </p>
                        </div>
                    </div>
                </div>

                <a class='cursor-pointer ${ nodeModel.script.errorMsg !== null ? `color-red` : `` }' data-ref='more-information-link'>
                    <u>More informations </u> &nbsp;
                    <i data-ref='more-information-icon' class='fa fa-chevron-down '></i>
                </a>

                <div class='panel-group'>
                    <div class='panel panel-primary no-border'>
                        <div data-ref='collapse-this' class='panel-collapse collapse'>
                            <div class='panel-body'>
                                <table class='table table-hover'>
                                    <tbody>
                                        <tr>
                                            <td><strong>Element ID: </td>
                                            <td>${nodeModel.id}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Script ID: </td>
                                            <td>${nodeModel.script.id}</td>
                                        </tr>

                                        <tr data-ref='error-msg' class='color-red' style='${
                                            nodeModel.errorMsg.value === '' 
                                                ? `display: none` 
                                                : ''
                                            }'>
                                            <td><strong>Error Message:</strong></td>
                                            <td data-ref='error-msg-text' class='word-break'>${nodeModel.errorMsg.value}</td>
                                        </tr>

                                        ${
                                            appModel.isDebug 
                                            ? `
                                                <tr>
                                                    <td><strong>Debug Session: </strong></td>
                                                    <td class='word-break'>${nodeModel.script.debugSession}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>is in Debug?: </strong></td>
                                                    <td class='word-break'>${nodeModel.script.isDebug}</td>
                                                </tr>
                                                `
                                            : ``
                                        }

                                        <tr>
                                            <td><strong>Language: </strong></td>
                                            <td class='word-break'>${nodeModel.script.language}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Path: </strong></td>
                                            <td class='word-break'>${nodeModel.script.path}</td>
                                        </tr>
                                        <tr>
                                            <td><strong>State: </strong></td>
                                            <td data-ref='state' class='word-break'>${nodeModel.state.value.replace('_', ' ')}</td>
                                        </tr>

                                    </tbody>
                                </table>

                                ${
                                    (nodeModel.script.arguments === '' || nodeModel.script.arguments === undefined || nodeModel.script.arguments === null) 
                                        ? ``
                                        : `
                                            <h4> Arguments Table </h4>
                                            <div style='margin-left: 15px; margin-right: 15px;'>
                                                <table class='table table-bordered'>
                                                    <thead>
                                                        <tr>
                                                            <th>Key</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${Object.keys(nodeModel.script.arguments).map(element => `
                                                        <tr data-toggle='tooltip' data-placement='right' title='<h4>Help</h4><p>${nodeModel.script.arguments[element].help}<p>'>

                                                            <th>${element}</th>
                                                            <td>
                                                                <input disabled data-ref='${element}' type='text' value='${nodeModel.script.arguments[element].value}'
                                                                    class='form-control' />
                                                            </td>
                                                        </tr>` ).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ` 
                                }

                            </div>
                        </div>
                    </div>

                </div>
            `
        })

        $(`[data-toggle='tooltip']`).tooltip({
            html: true,
            placement: 'right',
            container: 'body'
        })
    }
}