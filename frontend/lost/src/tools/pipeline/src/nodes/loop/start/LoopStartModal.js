import { BaseModal } from 'l3p-frontend'


export default class LoopStartModal extends BaseModal {
    constructor(nodeModel: LoopStartModel){
        super({
            visible: false,
            title: 'Loop',
            content: /*html*/`
                <table class='table table-hover'>
                    <tbody>
                        <tr>
                            <td style='vertical-align: middle'>
                                <strong> Max Iteration: </strong>
                            </td>
                            <td>
                                <input ${nodeModel.loop.maxIteration 
                                    ? '' 
                                    : `placeholder='exit condition is in script' disabled`}
                                    data-ref='max-iteration'
                                    class='labelmax form-control'
                                    type='number'
                                    name='max_label'
                                    min='0'
                                    value='${nodeModel.loop.maxIteration}'>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `               
        })
    }
}