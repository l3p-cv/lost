import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import actions from '../../actions'
import * as statistics_api from '../../actions/statistics/statistics_api'

import {
    CWidgetDropdown,
    CRow,
    CCol,
    CDropdown,
    CDropdownMenu,
    CDropdownItem,
    CDropdownToggle,
    CWidgetBrand
} from '@coreui/react'

import {CChart} from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import ChartLineSimple from './ChartLineSimple'
import ChartBarSimple from './ChartBarSimple'
import BaseContainer from '../../components/BaseContainer'

const DesignerDashboard = () => {
    const dispatch = useDispatch()
    const { mutate: getPersonalStatistics, data: personalStatistics } =
    statistics_api.usePersonalStatistics()
    useEffect(() => {
        dispatch(actions.setNavbarVisible(true))
        getPersonalStatistics()
    }, [])

    console.log(personalStatistics)

    if(personalStatistics === undefined){
        return(<div>Loading...</div>)
    }

    const chartColors = {
        background: 'rgb(16, 81, 95,0.8)',
        borderColor: 'rgb(16, 81, 95,0.8)',
        borderWidth: 0,
        hoverBackgroundColor:'rgb(16, 81, 95,0.4)',
        hoverBorderColor: 'twitter'
    }

    const annoLabels = {
        labels: ['Cat', 'Dog', 'Monkey', 'Giraffe', 'Gereon', 'Lizard', 'Lama'],
        datasets: [
            {
                label: 'Annotated Labels',
                backgroundColor: chartColors.background,
                borderColor: chartColors.borderColor,
                borderWidth: chartColors.borderWidth,
                hoverBackgroundColor: chartColors.hoverBackgroundColor,
                hoverBorderColor: chartColors.hoverBorderColor,
                data: [30, 59, 80, 81, 56, 55, 40],
            }
        ],
    };

    const annoTypes = {
        labels: ['bbox', 'line', 'point', 'image', 'polygon'],
        datasets: [
            {
                label: 'Annotation Types',
                backgroundColor: chartColors.background,
                borderColor: chartColors.borderColor,
                borderWidth: chartColors.borderWidth,
                hoverBackgroundColor: chartColors.hoverBackgroundColor,
                hoverBorderColor: chartColors.hoverBorderColor,
                data: [59, 80, 56, 55, 40],
            },
        ],
    };

    const options = {
        maintainAspectRatio: true
    }

    return (
        <BaseContainer>
            <CRow>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader="20"
                        rightFooter="Today"
                        leftHeader="1.100"
                        leftFooter="All time"
                    >
                    <h2>Annotations</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader="21"
                        rightFooter="Today"
                        leftHeader="1.101"
                        leftFooter="All time"
                    >
                    <h2>Annotasks</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader="22"
                        rightFooter="Today"
                        leftHeader="1.102"
                        leftFooter="All time"
                    >
                    <h2>Time per Annotation</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetBrand
                        color="primary"
                        rightHeader="350"
                        rightFooter="Today"
                        leftHeader="1.103"
                        leftFooter="All time"
                    >
                    <h2>Processed images</h2>
                    </CWidgetBrand>
                </CCol>
            </CRow>
            
            <CRow>
                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header="Ø 9.823"
                        text="Annos / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[78, 81, 80, 45, 34, 12, 40]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Annotations"
                                labels="days"
                            />
                        }
                    >
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header="Ø 500"
                        text="Annotasks / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[4,0,4]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Annotasks"
                                labels="days"
                            />
                        }
                    >
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header="Ø 534"
                        text="Time per Annotation / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[998,569,332,998,200,569,332]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Seconds"
                            />
                        }
                    >
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="6" xl="3">
                    <CWidgetDropdown
                        color="primary"
                        header="Ø 500"
                        text="Processed Images / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[50,400,300,150,800,600,350]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="primary"
                                label="Images"
                            />
                        }
                    >
                        {/* <CDropdown>
                            <CDropdownToggle caret={false} color="transparent">
                                <CIcon name="cil-location-pin" />
                            </CDropdownToggle>
                            <CDropdownMenu className="pt-0" placement="bottom-end" backgroundColor="red">
                                <CDropdownItem>Action</CDropdownItem>
                                <CDropdownItem>Another action</CDropdownItem>
                                <CDropdownItem>Something else here...</CDropdownItem>
                                <CDropdownItem disabled>Disabled action</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown> */}
                    </CWidgetDropdown>
                </CCol>
            </CRow>

            <CRow>
                <CCol sm="12" lg="6">
                    <CChart type="bar" datasets={annoLabels.datasets} options={options} labels={annoLabels.labels}/>
                </CCol>

                <CCol sm="12" lg="6">
                    <CChart type="bar" datasets={annoTypes.datasets} options={options} labels={annoTypes.labels}/>
                </CCol>
            </CRow>
        </BaseContainer>
    )
}
export default DesignerDashboard
