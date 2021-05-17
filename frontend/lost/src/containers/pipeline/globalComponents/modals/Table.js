import React from 'react'

export default (props) => {
    return(
        <table className="table table-hover">
            <tbody>
            {props.data.map((el)=>{

                    return(
                        <tr key={el.key}>
                            <td><strong>{el.key}</strong></td>
                            <td style={el.valueStyle?el.valueStyle:{}}>{el.value}</td>
                        </tr>
                    )
                
            })}
            </tbody>
        </table>
    )

}