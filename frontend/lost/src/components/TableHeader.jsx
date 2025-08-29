import React from "react";
import { CCol, CRow } from "@coreui/react";
import CoreIconButton from "./CoreIconButton";
import SelectFileButton from "./SelectFileButton";

const TableHeader = ({
    headline,
    buttonStyle,
    className,
    icon=null,
    onClick=() => {},
    buttonText="",
    buttonColor="primary",
    selectFileButton=false,
    headerClassname="card-title mb-2",
    accept,
}) =>{


    return (
        <CRow>
            <CCol>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <h3 className={headerClassname}>
                        {headline}
                    </h3>
                    {!selectFileButton && (
                    <CoreIconButton
                        className={className}
                        isOutline={true}
                        color={buttonColor}
                        icon={icon}
                        text={buttonText}
                        onClick={onClick}
                        style={buttonStyle}
                    />)}
                    {selectFileButton && (
                    <SelectFileButton
                        className={className}
                        accept={accept}
                        isOutline={true}
                        color={buttonColor}
                        icon={icon}
                        text={buttonText}
                        onSelect={onClick}
                        style={buttonStyle}
                    />)}
                </div>
            </CCol>
        </CRow>
    )
}


export default TableHeader