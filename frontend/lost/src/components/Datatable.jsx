import PropTypes from 'prop-types'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import { CBadge } from '@coreui/react'
import './datatable.css'

const Datatable = ({
  key,
  noText = true,
  pageSize = 10,
  data = [],
  columns = [],
  onRowClick = () => {},
  height = undefined,
  manual = false,
  isLoading = false,
  onFetchData,
  pages,
  getTrProps,
}) => {
  const datatableOnRowClick = (state, rowInfo, column, instance) => {
    let color
    if (rowInfo) {
      color = rowInfo.original.selected ? '#add8e6' : null
      if (rowInfo.original.is_zone_golden_sample || rowInfo.original.isGoldenSample) {
        color = 'wheat'
      }
    }
    const defaultProps = {
      onClick: () => (onRowClick ? onRowClick(rowInfo.original) : null),
      style: {
        background: color,
      },
    }
    return getTrProps
      ? { ...defaultProps, ...getTrProps(state, rowInfo, column, instance) }
      : defaultProps
  }

  return (
    <ReactTable
      // sorted={[{ id: 'idx', desc: false }]}
      onFetchData={onFetchData}
      pages={pages}
      key={key}
      loading={isLoading}
      style={{ width: '100%', height: height || undefined }}
      noDataText={noText ? '' : 'No rows found'}
      showPageSizeOptions={manual || data.length > pageSize}
      showPageJump
      manual={manual}
      defaultPageSize={pageSize}
      // pageSize={pageSize}
      showPagination={manual || data.length > pageSize}
      getTrProps={datatableOnRowClick}
      data={data}
      columns={columns}
      className="-striped -highlight"
    />
  )
}

Datatable.propTypes = {
  onFetchData: PropTypes.any,
  isLoading: PropTypes.bool,
  manual: PropTypes.bool,
  pages: PropTypes.any,
  key: PropTypes.instanceOf(PropTypes.object),
  noText: PropTypes.bool,
  pageSize: PropTypes.number,
  data: PropTypes.array,
  columns: PropTypes.array,
  onRowClick: PropTypes.func,
  height: PropTypes.any,
  getTrProps: PropTypes.func,
}

const smallText = (text) => <p className="small text-muted">{text}</p>

// https://codesandbox.io/s/react-hooks-usestate-xx4l1
// Custom Cells

const RenderBadge = ({ text, color, onClick }) => (
  <div>
    <CBadge color={color} onClick={onClick || null}>
      {text}
    </CBadge>
  </div>
)

const RenderTitleSubtitle = ({ top, bottom }) => (
  <>
    <p style={{ margin: 0 }}>{top}</p>
    {smallText(bottom)}
  </>
)

const RenderStatus = ({ lastActive }) => {
  lastActive.setHours(lastActive.getHours() + 2)
  const fifteenSecondsAgo = new Date()
  fifteenSecondsAgo.setSeconds(fifteenSecondsAgo.getSeconds() - 15)
  let status = 'Online'
  if (lastActive < fifteenSecondsAgo) {
    status = 'Offline'
  }
  return (
    <div>
      <CBadge color={status === 'Online' ? 'success' : 'danger'}>{status}</CBadge>
      {smallText(`Last Active: ${lastActive.toLocaleString()}`)}
    </div>
  )
}

Datatable.RenderStatus = RenderStatus
Datatable.RenderBadge = RenderBadge
Datatable.RenderTitleSubtitle = RenderTitleSubtitle
export default Datatable
