import React from 'react'

interface NodeFooterProps {
    footer?: string
}

const NodeFooter: React.FC<NodeFooterProps> = ({ footer }) => {
    let className = ''

    switch (footer) {
        case 'in_progress':
            className = 'bg-orange'
            break
        case 'finished':
            className = 'bg-green'
            break
        case 'pending':
            className = 'bg-blue'
            break
        case 'script_error':
            className = 'bg-red'
            break
        default:
            className = ''
    }

    return (
        <div className={`${className} graph-node-footer`}>
            {footer?.replace('_', ' ')}
        </div>
    )
}

export default NodeFooter
