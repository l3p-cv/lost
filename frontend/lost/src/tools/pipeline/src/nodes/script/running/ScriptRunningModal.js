import { BaseModal } from 'l3p-frontend'


export default class ScriptRunningModal extends BaseModal {
    constructor(nodeModel){
		const { peN, script, progress, id, errorMsg, state } = nodeModel
        super({
            id: peN,
            title: 'Script',
            content: /*html*/`
				// name and description.
                <table class='table table-hover'>
                    <tr>
                        <td class='colon'><strong>Script Name</strong></td>
                        <td>${script.name}</td>
                    </tr>
                    <tr>
                        <td class='colon'><strong>Description</strong></td>
                        <td>${script.description}</td>
                    </tr>
                </table>

				// progress bar.
                <div class='container'>
                    <div class='progress'>
                        <div data-ref='progress-bar' class='progress-bar' role='progressbar' 
                            style='width:${progress.value}%'>
                            <p data-ref='progress-bar-text' class='color-black'>
                                ${progress.value}%
                            </p>
                        </div>
                    </div>
                </div>

				// hidden information.
                <a class='cursor-pointer ${ script.errorMsg !== null ? `color-red` : `` }' data-ref='more-information-link'>
                    <u>More informations</u> &nbsp;
                    <i data-ref='more-information-icon' class='fa fa-chevron-down '></i>
                </a>
                <div class='panel-group'>
                    <div class='panel panel-primary no-border'>
                        <div data-ref='collapse-this' class='panel-collapse collapse'>
                            <div class='panel-body'>
                                <table class='table table-hover'>
                                    <tbody>
                                        <tr>
                                            <td class='colon'><strong>Element ID</td>
                                            <td>${id}</td>
                                        </tr>
                                        <tr>
                                            <td class='colon'><strong>Script ID</td>
                                            <td>${script.id}</td>
                                        </tr>
                                        <tr data-ref='error-msg' class='color-red' style='${errorMsg.value === '' ? `display: none` : ''}'>
                                            <td class='colon'><strong>Error Message</strong></td>
                                            <td data-ref='error-msg-text' class='word-break'>${errorMsg.value}</td>
                                        </tr>
                                        <tr>
                                            <td class='colon'><strong>Language</strong></td>
                                            <td class='word-break'>${script.language}</td>
                                        </tr>
                                        <tr>
                                            <td class='colon'><strong>Path</strong></td>
                                            <td class='word-break'>${script.path}</td>
                                        </tr>
                                        <tr>
                                            <td class='colon'><strong>State</strong></td>
                                            <td data-ref='status' class='word-break'>${state.value.replace('_', ' ')}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                ${(script.arguments === '' || script.arguments === undefined || script.arguments === null) 
									? ''
									: /*html*/`
										<h4>Arguments Table</h4>
										// INLINE STYLES...
										<div style='margin-left: 15px; margin-right: 15px;'>
											<table class='table table-bordered'>
												<thead>
													<tr><th>Key</th><th>Value</th></tr>
												</thead>
												<tbody>
													${Object.keys(script.arguments).map(element => /*html*/`
														<tr>
															<th>${element}</th>
															<td>
																<input class='form-control' data-ref='${element}' value='${script.arguments[element].value}' disabled />
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
    }
}