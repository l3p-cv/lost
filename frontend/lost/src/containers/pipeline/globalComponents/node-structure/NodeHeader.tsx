import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface NodeHeaderProps {
  bgColorClass?: string
  icon: IconProp
  title: string
}

const NodeHeader: React.FC<NodeHeaderProps> = ({ bgColorClass = '', icon, title }) => {
  return (
    <div className={`${bgColorClass} graph-node-title`}>
      <span className="graph-node-title-icon">
        <FontAwesomeIcon icon={icon} />
      </span>
      <span className="graph-node-title-text">{title}</span>
    </div>
  )
}

export default NodeHeader
