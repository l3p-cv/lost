import React from 'react'

const SimpleTable = ({ elements, className, showLines }) => {
    return elements.map((el, i) => {
        const borderBottom =
            i !== elements.length - 1 ? 'border-gray-400 border-b-2' : undefined
        return (
            <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={`${borderBottom} flex flex-row text-center ${className}`}
            >
                <div
                    className={`w-1/2 ${
                        showLines ? 'border-gray-400 border-r-2' : ''
                    }  p-2 content-center`}
                >
                    {el.left}
                </div>
                <div className="w-1/2 p-2">{el.right}</div>
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
