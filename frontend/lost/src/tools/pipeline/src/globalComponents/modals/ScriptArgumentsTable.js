import React from 'react'

const ArgumentsTable = (props) => {
    console.log('-------propssss-----------------------------');
    console.log(props);
    console.log('------------------------------------');
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
        </div>
    )
}


export default ArgumentsTable