import React from 'react'

const SimpleTable = ({ elements, className, showLines }) => {
    return elements.map((el, i) => {
        return (
            <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                style={{ display: 'flex',flexDirection: 'row', borderBottom: i !== elements.length - 1 ? '2px solid gray': undefined, textAlign: 'center'}}
            >
                <div
                    style={{width: '50%', borderRight: '2px solid gray', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                    {el.left}
                </div>
                <div style={{width: '50%', padding:10 , display: 'flex', alignItems: 'center', justifyContent: 'center'}} >{el.right}</div>
            </div>
        )
    })
}

SimpleTable.defaultProps = {
    showLines: true,
    className: '',
    elements: [],
}

export default SimpleTable
