import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'
import * as statistics_api from '../../actions/statistics/statistics_api'

import { CWidgetDropdown, CRow, CCol, CWidgetBrand } from '@coreui/react'

import { CChart } from '@coreui/react-chartjs'
import ChartLineSimple from './ChartLineSimple'
import Loading from '../../components/Loading'

const PersonalStatistics = () => {
    const dispatch = useDispatch()
    const { mutate: getPersonalStatistics, data: personalStatistics } =
        statistics_api.usePersonalStatistics()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
        getPersonalStatistics()
    }, [])

    const [labels, setLabels] = useState({ keys: [], values: [] })
    const [types, setTypes] = useState({ keys: [], values: [] })

    useEffect(() => {
        /// only when data from request is available
        if (personalStatistics === undefined) return

        // update data for annotation labels chart
        let _labels = {
            keys: [],
            values: [],
            colors: [],
        }

        for (var k in personalStatistics.labels) {
            _labels.keys.push(k)
            _labels.values.push(personalStatistics.labels[k]['value'])
            let _lblColor = personalStatistics.labels[k]['color']
            _labels.colors.push(_lblColor ? _lblColor : 'rgb(16, 81, 95,0.8)')
        }

        setLabels(_labels)

        // update data for annotation types chart
        let _types = {
            keys: [],
            values: [],
        }

        for (var k in personalStatistics.types) {
            _types.keys.push(k)
            _types.values.push(personalStatistics.types[k])
        }

        setTypes(_types)
    }, [personalStatistics])

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
                    Perform your first annotation right now to get your personal
                    statistics !
                </CRow>
                <CRow style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loading size="xl" />
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
        <>
            <CRow style={{ marginBottom: 10 }}>
                <CCol sm="5">
                    <h3 id="traffic" className="card-title mb-0">
                        Personal statistics
                    </h3>
                    {/* <div className="small text-muted">last seven days</div> */}
                </CCol>
                <CCol sm="7" className="d-none d-md-block"></CCol>
            </CRow>
            <CRow>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={personalStatistics.annos.today}
                        rightFooter="Today"
                        leftHeader={personalStatistics.annos.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotations</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={personalStatistics.annotasks.today}
                        rightFooter="Today"
                        leftHeader={personalStatistics.annotasks.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotasks</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={personalStatistics.annotime.today}
                        rightFooter="Today"
                        leftHeader={personalStatistics.annotime.allTime}
                        leftFooter="All time"
                    >
                        <h2>Time per Annotation</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={personalStatistics.processedImages.today}
                        rightFooter="Today"
                        leftHeader={personalStatistics.processedImages.allTime}
                        leftFooter="All time"
                    >
                        <h2>Processed images</h2>
                    </CWidgetBrand>
                </CCol>
            </CRow>
            <CRow style={{ marginBottom: 5 }}>
                <CCol sm="5">
                    <h4 id="traffic" className="card-title mb-0">
                        Averages
                    </h4>
                    <div className="small text-muted">Last 7 days</div>
                </CCol>
                <CCol sm="7" className="d-none d-md-block"></CCol>
            </CRow>
            <CRow>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header={'Ø ' + personalStatistics.annos.avg}
                        text="Annotations / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={personalStatistics.annos.history.week}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Annotations"
                                labels="days"
                            />
                        }
                    ></CWidgetDropdown>
                </CCol>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header={'Ø ' + personalStatistics.annotasks.avg}
                        text="Annotasks / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={personalStatistics.annotasks.history.week}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Annotasks"
                                labels="days"
                            />
                        }
                    ></CWidgetDropdown>
                </CCol>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header={'Ø ' + personalStatistics.annotime.avg}
                        text="Time per Annotation / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={personalStatistics.annotime.history.week}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Seconds"
                            />
                        }
                    ></CWidgetDropdown>
                </CCol>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header={'Ø ' + personalStatistics.processedImages.avg}
                        text="Processed Images / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={
                                    personalStatistics.processedImages.history.week
                                }
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Images"
                            />
                        }
                    ></CWidgetDropdown>
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
                    <CChart
                        type="bar"
                        datasets={annoLabels.datasets}
                        options={chartOptions}
                        labels={annoLabels.labels}
                    />
                </CCol>

                <CCol sm="12" lg="6">
                    <CChart
                        type="bar"
                        datasets={annoTypes.datasets}
                        options={chartOptions}
                        labels={annoTypes.labels}
                    />
                </CCol>
            </CRow>
        </>
    )
}
export default PersonalStatistics
