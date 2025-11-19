import { useEffect, useState } from 'react'
import * as statistics_api from '../../actions/statistics/statistics_api'

import { CCol, CContainer, CRow, CWidgetStatsD } from '@coreui/react'

import { CChart } from '@coreui/react-chartjs'
import Loading from '../../components/Loading'
import AnnosPerHour from './AnnosPerHour'

const DesignerStatistics = () => {
  const { mutate: getDesignerStatistics, data: designerStatistics } =
    statistics_api.useDesignerStatistics()
  useEffect(() => {
    getDesignerStatistics()
  }, [])

  const [labels, setLabels] = useState({ keys: [], values: [] })
  const [types, setTypes] = useState({ keys: [], values: [] })

  useEffect(() => {
    /// only when data from request is available
    if (designerStatistics === undefined) return

    // update data for annotation labels chart
    const _labels = {
      keys: [],
      values: [],
      colors: [],
    }

    for (const k in designerStatistics.labels) {
      _labels.keys.push(k)
      _labels.values.push(designerStatistics.labels[k]['value'])
      const _lblColor = designerStatistics.labels[k]['color']
      _labels.colors.push(_lblColor ? _lblColor : 'rgb(16, 81, 95,0.8)')
    }

    setLabels(_labels)

    // update data for annotation types chart
    const _types = {
      keys: [],
      values: [],
    }

    for (const k in designerStatistics.types) {
      _types.keys.push(k)
      _types.values.push(designerStatistics.types[k])
    }

    setTypes(_types)
  }, [designerStatistics])

  /// do not render component if required data is not available
  if (designerStatistics === undefined)
    return (
      <>
        <CRow style={{ display: 'flex', justifyContent: 'center', fontSize: 20 }}>
          <b>Statistics not yet available.</b>
        </CRow>
        <CRow
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: 20,
            marginTop: 5,
          }}
        >
          Let perform your first annotation right now to get your designer statistics !
        </CRow>
        <CRow style={{ display: 'flex', justifyContent: 'center' }}>
          <Loading size="3x" />
        </CRow>
      </>
    )

  const chartColors = {
    background: 'rgb(16, 81, 95,0.8)',
    borderColor: 'rgb(16, 81, 95,0.8)',
    borderWidth: 0,
    hoverBackgroundColor: 'rgb(16, 81, 95,0.4)',
    hoverBorderColor: 'rgb(16, 81, 95,0.4)',
  }

  const annoLabels = {
    labels: labels.keys,
    datasets: [
      {
        label: 'Annotated Labels',
        backgroundColor: labels.colors,
        borderColor: chartColors.borderColor,
        borderWidth: chartColors.borderWidth,
        hoverBackgroundColor: chartColors.hoverBackgroundColor,
        hoverBorderColor: chartColors.hoverBorderColor,
        data: labels.values,
      },
    ],
  }

  const annoTypes = {
    labels: types.keys,
    datasets: [
      {
        label: 'Annotation Types',
        backgroundColor: chartColors.background,
        borderColor: chartColors.borderColor,
        borderWidth: chartColors.borderWidth,
        hoverBackgroundColor: chartColors.hoverBackgroundColor,
        hoverBorderColor: chartColors.hoverBorderColor,
        data: types.values,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      maintainAspectRatio: true,
    },
  }
  return (
    <CContainer style={{ marginTop: 15 }}>
      <CRow>
        <CCol sm="5" className="mb-3">
          <h3 id="traffic" className="card-title mb-0">
            Designer statistics
          </h3>
          <div className="small text-muted">
            Statistics from you and other users working on your pipelines.
          </div>
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow>
        <CCol sm="6" lg="6" xl="3">
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + designerStatistics.annos.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annos.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotations</h2>
                    </CWidgetBrand> */}
          <CWidgetStatsD
            className="mb-4"
            color="primary"
            icon={<h3 className="text-white">Annotations</h3>}
            values={[
              {
                title: 'Today',
                value: '' + designerStatistics.annos.today,
              },
              {
                title: 'All time',
                value: '' + designerStatistics.annos.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3">
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + designerStatistics.annotasks.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annotasks.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotasks</h2>
                    </CWidgetBrand> */}
          <CWidgetStatsD
            className="mb-4"
            color="primary"
            icon={<h3 className="text-white">Annotasks</h3>}
            values={[
              {
                title: 'Today',
                value: '' + designerStatistics.annotasks.today,
              },
              {
                title: 'All time',
                value: '' + designerStatistics.annotasks.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3">
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + designerStatistics.annotime.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annotime.allTime}
                        leftFooter="All time"
                    >
                        <h2>Time per Annotation</h2>
                    </CWidgetBrand> */}
          <CWidgetStatsD
            className="mb-4"
            color="primary"
            icon={<h3 className="text-white">Time per Annotation</h3>}
            values={[
              {
                title: 'Today',
                value: '' + designerStatistics.annotime.today,
              },
              {
                title: 'All time',
                value: '' + designerStatistics.annotime.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3" className="mb-3">
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + designerStatistics.processedImages.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.processedImages.allTime}
                        leftFooter="All time"
                    >
                        <h2>Processed images</h2>
                    </CWidgetBrand> */}
          <CWidgetStatsD
            className="mb-4"
            color="primary"
            icon={<h3 className="text-white">Processed images</h3>}
            values={[
              {
                title: 'Today',
                value: '' + designerStatistics.processedImages.today,
              },
              {
                title: 'All time',
                value: '' + designerStatistics.processedImages.allTime,
              },
            ]}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="5">
          <h4 id="traffic" className="card-title mb-0">
            Annotations/Hour
          </h4>
          <div className="small text-muted">Last 7 days</div>
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow>
        <CCol sm="12" className="mb-3">
          <AnnosPerHour
            data={designerStatistics.annosPerHour}
            style={{ height: '300px', marginTop: '40px' }}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="5">
          <h4 id="traffic" className="card-title mb-0">
            Annotations / Label and Type
          </h4>
          <div className="small text-muted">Total time period</div>
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow>
        <CCol sm="12" lg="6">
          <CChart type="bar" data={annoLabels} options={chartOptions} />
        </CCol>

        <CCol sm="12" lg="6" className="mb-3">
          <CChart type="bar" data={annoTypes} options={chartOptions} />
        </CCol>
      </CRow>
    </CContainer>
  )
}
export default DesignerStatistics
