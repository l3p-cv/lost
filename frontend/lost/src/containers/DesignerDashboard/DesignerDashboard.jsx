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

    const annoLabels = {
        labels: ['Cat', 'Dog', 'Monkey', 'Giraffe', 'Gereon', 'Lizard', 'Lama'],
        datasets: [
            {
                label: 'Annotated Labels',
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 0,
                hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                hoverBorderColor: 'rgba(255,99,132,1)',
                data: [30, 59, 80, 81, 56, 55, 40],
            },
        ],
    };

    const annoTypes = {
        labels: ['bbox', 'line', 'point', 'image', 'polygon'],
        datasets: [
            {
                label: 'Annotation Types',
                backgroundColor: 'rgba(255,99,132,0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 0,
                hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                hoverBorderColor: 'rgba(255,99,132,1)',
                data: [59, 80, 56, 55, 40],
            },
        ],
    };

    const options = {
        // tooltips: {
        //   enabled: false,
        //   custom: customTooltips
        // },
        maintainAspectRatio: false
    }

    return (
        <BaseContainer>
            <CRow>
                <CCol sm="6" lg="3">
                    <CWidgetBrand
                        color="twitter"
                        rightHeader="20"
                        rightFooter="Today"
                        leftHeader="1.100"
                        leftFooter="All time"
                    >
                    <h2>Annotations</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetBrand
                        color="twitter"
                        rightHeader="21"
                        rightFooter="Today"
                        leftHeader="1.101"
                        leftFooter="All time"
                    >
                    <h2>Annotasks</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetBrand
                        color="twitter"
                        rightHeader="22"
                        rightFooter="Today"
                        leftHeader="1.102"
                        leftFooter="All time"
                    >
                    <h2>Time per Annotation</h2>
                    </CWidgetBrand>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetBrand
                        color="twitter"
                        rightHeader="23"
                        rightFooter="Today"
                        leftHeader="1.103"
                        leftFooter="All time"
                    >
                    <h2>Processed images</h2>
                    </CWidgetBrand>
                </CCol>
            </CRow>
            
            <CRow>
                <CCol sm="6" lg="3">
                    <CWidgetDropdown
                        color="gradient-warning"
                        header="9.823"
                        text="Annos / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[78, 81, 80, 45, 34, 12, 40]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="warning"
                                label="Members"
                                labels="months"
                            />
                        }
                    >
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetDropdown
                        color="gradient-warning"
                        header="500"
                        text="Annotasks / Day"
                        footerSlot={
                            <ChartLineSimple
                                className="mt-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgba(255,255,255,.2)"
                                dataPoints={[4,0,4]}
                                options={{ elements: { line: { borderWidth: 2.5 } } }}
                                pointHoverBackgroundColor="warning"
                                label="Members"
                                labels="months"
                            />
                        }
                    >
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetDropdown
                        color="gradient-info"
                        header="9.823"
                        text="Members online"
                        footerSlot={
                            <ChartLineSimple
                                pointed
                                className="mt-3 mx-3"
                                style={{ height: '70px' }}
                                dataPoints={[1, 18, 9, 17, 34, 22, 11]}
                                pointHoverBackgroundColor="info"
                                options={{ elements: { line: { tension: 0.00001 } } }}
                                label="Members"
                                labels="months"
                            />
                        }
                    >
                        <CDropdown>
                            <CDropdownToggle caret={false} color="transparent">
                                <CIcon name="cil-location-pin" />
                            </CDropdownToggle>
                            <CDropdownMenu className="pt-0" placement="bottom-end">
                                <CDropdownItem>Action</CDropdownItem>
                                <CDropdownItem>Another action</CDropdownItem>
                                <CDropdownItem>Something else here...</CDropdownItem>
                                <CDropdownItem disabled>Disabled action</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </CWidgetDropdown>
                </CCol>

                <CCol sm="6" lg="3">
                    <CWidgetDropdown
                        color="gradient-danger"
                        header="9.823"
                        text="Members online"
                        footerSlot={
                            <ChartBarSimple
                                className="mt-3 mx-3"
                                style={{ height: '70px' }}
                                backgroundColor="rgb(250, 152, 152)"
                                label="Members"
                                labels="months"
                            />
                        }
                    >
                        <CDropdown>
                            <CDropdownToggle
                                caret
                                className="text-white"
                                color="transparent"
                            >
                                <CIcon name="cil-settings" />
                            </CDropdownToggle>
                            <CDropdownMenu className="pt-0" placement="bottom-end">
                                <CDropdownItem>Action</CDropdownItem>
                                <CDropdownItem>Another action</CDropdownItem>
                                <CDropdownItem>Something else here...</CDropdownItem>
                                <CDropdownItem disabled>Disabled action</CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
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
