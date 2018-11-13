import { BaseModal } from 'pipRoot/l3pfrontend/index'


export default class LoopRunningModal extends BaseModal {
    constructor(nodeModel){
        const params = {
            id: `${nodeModel.peN}`,
            title: 'Loop',
            content: `
                <table class='table table-hover'>
                    <tr>
                        <td>
                            <strong>Element ID: </td>
                        <td>${nodeModel.id}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Loop ID: </td>
                        <td>${nodeModel.loop.id}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>is Breakloop: </td>
                        <td>${nodeModel.loop.isBreakLoop}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Iteration: </td>
                        <td>${nodeModel.loop.iteration}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Max Iteration: </td>
                        <td>${nodeModel.loop.maxIteration?nodeModel.loop.maxIteration: Number.POSITIVE_INFINITY}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>pe Jump Id: </td>
                        <td>${nodeModel.loop.peJumpId}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Status: </td>
                        <td data-ref= 'state'>${nodeModel.state.value.replace('_', ' ')}</td>
                    </tr>
                </table>`   
        }
        super(params)
    }
}