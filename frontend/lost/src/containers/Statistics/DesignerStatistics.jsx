import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'
import * as statistics_api from '../../actions/statistics/statistics_api'

import { CRow, CCol, CWidgetBrand } from '@coreui/react'

import AnnosPerHour from './AnnosPerHour'
import { CChart } from '@coreui/react-chartjs'
import Loading from '../../components/Loading'

import BaseContainer from '../../components/BaseContainer'

const DesignerStatistics = () => {
    const dispatch = useDispatch()
    const { mutate: getDesignerStatistics, data: designerStatistics } =
        statistics_api.useDesignerStatistics()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
        getDesignerStatistics()
    }, [])

    const [labels, setLabels] = useState({ keys: [], values: [] })
    const [types, setTypes] = useState({ keys: [], values: [] })

    useEffect(() => {
        /// only when data from request is available
        if (designerStatistics === undefined) return

        // update data for annotation labels chart
        let _labels = {
            keys: [],
            values: [],
            colors: [],
        }

        for (var k in designerStatistics.labels) {
            _labels.keys.push(k)
            _labels.values.push(designerStatistics.labels[k]['value'])
            let _lblColor = designerStatistics.labels[k]['color']
            _labels.colors.push(_lblColor ? _lblColor : 'rgb(16, 81, 95,0.8)')
        }

        setLabels(_labels)

        // update data for annotation types chart
        let _types = {
            keys: [],
            values: [],
        }

        for (var k in designerStatistics.types) {
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
                    Let perform your first annotation right now to get your designer
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
        <BaseContainer>
            <CRow style={{ marginBottom: 10 }}>
                <CCol sm="5">
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
                    <CWidgetBrand
                        color="primary"
                        rightHeader={designerStatistics.annos.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annos.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotations</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={designerStatistics.annotasks.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annotasks.allTime}
                        leftFooter="All time"
                    >
                        <h2>Annotasks</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={designerStatistics.annotime.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.annotime.allTime}
                        leftFooter="All time"
                    >
                        <h2>Time per Annotation</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader={designerStatistics.processedImages.today}
                        rightFooter="Today"
                        leftHeader={designerStatistics.processedImages.allTime}
                        leftFooter="All time"
                    >
                        <h2>Processed images</h2>
                    </CWidgetBrand>
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
                <CCol sm="12">
                    <AnnosPerHour
                        data={designerStatistics.annosPerHour}
                        style={{ height: '300px', marginTop: '40px' }}
                    />
                </CCol>
            </CRow>
            <CRow style={{ marginBottom: 5, marginTop: 15 }}>
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
        </BaseContainer>
    )
}
export default DesignerStatistics
