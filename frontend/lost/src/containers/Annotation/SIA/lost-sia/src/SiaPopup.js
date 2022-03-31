import React, { useEffect, useState, useRef } from 'react';
import {Popup} from 'semantic-ui-react'

const SiaPopup = ({content, trigger}) => {

    return <Popup inverted style={{opacity:0.9}} content={content} trigger={trigger}/>

}

export default SiaPopup