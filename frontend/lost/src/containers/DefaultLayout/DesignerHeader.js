import React, { Component } from 'react'
import { Nav } from 'reactstrap'
import PropTypes from 'prop-types'

import ViewChanger from '../../components/ViewChanger'
import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react'
import logo from '../../assets/img/brand/fully_lost_2.png'
import sygnet from '../../assets/img/brand/lo-st.png'
import AccountDropdown from './AccountDropdown';


const propTypes = {
  children: PropTypes.node,
}

const defaultProps = {}

class DefaultHeader extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props

    return (
      <React.Fragment>
        <AppSidebarToggler className='d-lg-none' display='md' mobile />
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'LOST Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'LOST Logo' }}
        />
        <AppSidebarToggler className='d-md-down-none' display='lg' />

        <Nav className='ml-auto' navbar>
          <ViewChanger></ViewChanger>
          <AccountDropdown></AccountDropdown>
        </Nav>
        {/* <AppAsideToggler className='d-md-down-none' /> */}
        {/*<AppAsideToggler className='d-lg-none' mobile />*/}
      </React.Fragment>
    )
  }
}

DefaultHeader.propTypes = propTypes
DefaultHeader.defaultProps = defaultProps

export default DefaultHeader
