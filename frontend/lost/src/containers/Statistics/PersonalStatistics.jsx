import { useEffect, useState } from 'react'
import * as statistics_api from '../../api/statistics'

import { CCol, CContainer, CRow, CWidgetStatsD } from '@coreui/react'
import { CChart } from '@coreui/react-chartjs'
import LineChartWidget from '../../components/LineChartWidget'
import CenteredSpinner from '../../components/CenteredSpinner'

const PersonalStatistics = () => {
  const { data: personalStatistics, isLoading } = statistics_api.usePersonalStatistics()

  const [labels, setLabels] = useState({ keys: [], values: [] })
  const [types, setTypes] = useState({ keys: [], values: [] })

  /// do not render component if required data is not available
  if (personalStatistics === undefined)
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
          Perform your first annotation right now to get your personal statistics !
        </CRow>
        <CRow style={{ display: 'flex', justifyContent: 'center' }}>
          <CenteredSpinner />
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
    maintainAspectRatio: true,
  }

  return (
    <CContainer style={{ marginTop: 15 }}>
      <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
        Dashboard
      </h3>
      <CRow>
        <CCol sm="5">
          <h2 id="traffic" className="card-title mb-2">
            Personal statistics
          </h2>
          {/* <div className="small text-muted">last seven days</div> */}
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow>
        <CCol sm="6" lg="6" xl="3">
          {/* CWidgedBrand here */}
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + personalStatistics.annos.today}
                        rightFooter="Today"
                        leftHeader={'' + personalStatistics.annos.allTime}
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
                value: '' + personalStatistics.annos.today,
              },
              {
                title: 'All time',
                value: '' + personalStatistics.annos.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3">
          {/* CWidgedBrand here */}
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + personalStatistics.annotasks.today}
                        rightFooter="Today"
                        leftHeader={'' + personalStatistics.annotasks.allTime}
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
                value: '' + personalStatistics.annotasks.today,
              },
              {
                title: 'All time',
                value: '' + personalStatistics.annotasks.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3">
          {/* CWidgedBrand here */}
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + personalStatistics.annotime.today}
                        rightFooter="Today"
                        leftHeader={'' + personalStatistics.annotime.allTime}
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
                value: '' + personalStatistics.annotime.today,
              },
              {
                title: 'All time',
                value: '' + personalStatistics.annotime.allTime,
              },
            ]}
          />
        </CCol>

        <CCol sm="6" lg="6" xl="3">
          {/* <CWidgetBrand
                        color="primary"
                        rightHeader={'' + personalStatistics.processedImages.today}
                        rightFooter="Today"
                        leftHeader={'' + personalStatistics.processedImages.allTime}
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
                value: '' + personalStatistics.processedImages.today,
              },
              {
                title: 'All time',
                value: '' + personalStatistics.processedImages.allTime,
              },
            ]}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="5">
          <h2 id="traffic" className="card-title mb-0">
            Averages
          </h2>
          <div className="text-muted mb-2">Last 7 days</div>
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow className="mb-5">
        <CCol sm="6" lg="6" xl="3" className="mb-3">
          <LineChartWidget
            title="Annotations / Day"
            value={'Ø ' + personalStatistics.annos.avg}
            chartData={personalStatistics.annos.history.week}
          ></LineChartWidget>
        </CCol>
        <CCol sm="6" lg="6" xl="3" className="mb-3">
          <LineChartWidget
            title="Annotasks / Day"
            value={'Ø ' + personalStatistics.annotasks.avg}
            chartData={personalStatistics.annotasks.history.week}
          ></LineChartWidget>
        </CCol>
        <CCol sm="6" lg="6" xl="3" className="mb-3">
          <LineChartWidget
            title="Time per Annotation / Day"
            value={'Ø ' + personalStatistics.annotime.avg}
            chartData={personalStatistics.annotime.history.week}
          ></LineChartWidget>
        </CCol>
        <CCol sm="6" lg="6" xl="3" className="mb-3">
          <LineChartWidget
            title="Processed Images / Day"
            value={'Ø ' + personalStatistics.processedImages.avg}
            chartData={personalStatistics.processedImages.history.week}
          ></LineChartWidget>
        </CCol>
      </CRow>

      <CRow>
        <CCol sm="5">
          <h2 id="traffic" className="card-title mb-0">
            Annotations / Label and Type
          </h2>
          <div className="text-muted mb-2">Total time period</div>
        </CCol>
        <CCol sm="7" className="d-none d-md-block"></CCol>
      </CRow>
      <CRow>
        <CCol sm="12" lg="6">
          <CChart type="bar" data={annoLabels} options={chartOptions} />
        </CCol>

        <CCol sm="12" lg="6">
          <CChart type="bar" data={annoTypes} options={chartOptions} />
        </CCol>
      </CRow>
    </CContainer>
  )
}
export default PersonalStatistics
