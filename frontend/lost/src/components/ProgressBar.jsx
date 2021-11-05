import React from 'react'

const getColor = (value) => {
    // value from 0 to 1
    const hue = (value * 120).toString(10)
    return ['hsl(', hue, ',100%,35%)'].join('')
}

const Progress = ({ value }) => (
    <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-300 shadow">
            <div
                style={{ width: `${value * 100}%`, backgroundColor: getColor(value) }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center fade-in"
            />
        </div>
    </div>
)

export default Progress
