import React from 'react'

const TitleBox = (props) => {
    return (
        <div>
            <div>Name: {props.name}</div>
            <div>timestamp: {new Date(props.timestamp).toLocaleString()}</div>
        </div>
        //     <CCard style={{ width: '200px' }}>
        //     <CCardHeader style={{ backgroundColor: '#092F38', color: 'white' }}>
        //         {' '}
        //         <FontAwesomeIcon key="icon" icon={faInfoCircle} /> Information
        //     </CCardHeader>
        //     <CCardBody>
        //         <CRow>
        //             <CCol>Name:</CCol>
        //             <CCol>{props.name}</CCol>
        //         </CRow>
        //         <hr></hr>
        //         <CRow>
        //             <CCol>Created at:</CCol>
        //             <CCol>{props.timestamp}</CCol>
        //         </CRow>
        //     </CCardBody>
        // </CCard>
    )
}

export default TitleBox
