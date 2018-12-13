import { BaseModal } from 'l3p-frontend'


export default class LoopRunningModal extends BaseModal {
    constructor(nodeModel){
		const { id, loop, status } = nodeModel
        super({
            id: `${nodeModel.peN}`,
            title: 'Loop',
            content: /*html*/`
                <table class='table table-hover'>
                    <tr>
                        <td>
                            <strong>Element ID: </td>
                        	<td>${id}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Loop ID: </td>
                        <td>${loop.id}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Breakloop: </td>
                        <td>${loop.isBreakLoop}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Iteration: </td>
                        <td>${loop.iteration}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Max Iteration: </td>
                        <td>${loop.maxIteration ? loop.maxIteration : Number.POSITIVE_INFINITY}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Jump Id: </td>
                        	<td>${loop.peJumpId}</td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Status: </td>
                        <td data-ref= 'status'>${status.value.replace('_', ' ')}</td>
                    </tr>
                </table>
			`   
        })
    }
}