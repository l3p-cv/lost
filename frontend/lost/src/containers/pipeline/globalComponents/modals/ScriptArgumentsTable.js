import React from 'react'
import HelpButton from '../../../../components/HelpButton'

const ArgumentsTable = (props) => {
    if (props.data) {
        return (
            <div style={{ marginLeft: 15, marginRight: 15 }}>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(props.data).map((key) => {
                            return (
                                <tr key={key}>
                                    <th>
                                        {key}{' '}
                                        <HelpButton
                                            id={key}
                                            text={props.data[key].help}
                                        />
                                    </th>
                                    <td>
                                        <input
                                            onInput={props.onInput}
                                            className="form-control"
                                            data-ref={key}
                                            defaultValue={props.data[key].value}
                                            disabled={props.onInput ? '' : 'disabled'}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    } else {
        return <></>
    }
}

export default ArgumentsTable
