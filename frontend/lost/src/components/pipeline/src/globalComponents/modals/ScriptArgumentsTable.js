import React from 'react'
import IconButton from '../../../../BasicComponents/IconButton'
import {faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons'
import pipelineActions from '../../../../../actions/pipeline/pipelineRunning'
import {useDispatch} from 'react-redux'


const ArgumentsTable = (props) => {
    const dispatch = useDispatch()

    const updateArguments = async () =>{
        dispatch(pipelineActions.updateArguments())
    }
    if(props.data){
        return (
            <div style={{ marginLeft: 15, marginRight: 15 }}>
                <table className="table table-bordered">
                    <thead>
                        <tr><th>Key</th><th>Value</th></tr>
                    </thead>
                    <tbody>
                        {Object.keys(props.data).map((key) => {
                            return (
                                <tr key={key}>
                                    <th>{key}</th>
                                    <td><input onInput={props.onInput} className="form-control" data-ref={key} defaultValue={props.data[key].value} disabled={props.onInput?'': 'disabled'} /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {props.showUpdateButton && (
                <IconButton
                color="success"
                icon={faCloudUploadAlt}
                text="Update Arguments"
                onClick={updateArguments}
            />

                )}

            </div>
        )
    }else {
        return(<></>)
    }
    
}


export default ArgumentsTable