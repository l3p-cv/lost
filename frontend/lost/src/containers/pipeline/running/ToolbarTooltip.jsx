import { useState } from 'react'
import { Tooltip } from 'reactstrap'

const ToolbarTooltip = ({ target, text }) => {
    const [tooltipOpen, setTooltipOpen] = useState(false)

    const toggle = () => setTooltipOpen(!tooltipOpen)

    return (
        <div>
            <Tooltip
                delay={{ show: 0, hide: 0 }}
                placement="bottom"
                isOpen={tooltipOpen}
                target={target}
                toggle={toggle}
            >
                {text}
            </Tooltip>
        </div>
    )
}

export default ToolbarTooltip
