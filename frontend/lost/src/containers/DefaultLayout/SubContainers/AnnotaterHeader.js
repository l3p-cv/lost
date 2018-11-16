import React, { Component } from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap'
import PropTypes from 'prop-types'

import { AppNavbarBrand } from '@coreui/react'
import logo from '../../../assets/img/brand/fully_lost_2.png'
import sygnet from '../../../assets/img/brand/lo-st.png'
import ViewChanger from './ViewChanger'
import AccountDropdown from './AccountDropdown'

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
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'LOST Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'LOST Logo' }}
        />
        <Nav className='d-ml-down-none' navbar>
          <NavItem className='px-3'>
            <NavLink href='/'>Dashboard</NavLink>
          </NavItem>
          <NavItem className='px-3'>
            <NavLink href='#/annotasks'>Annotation Tasks</NavLink>
          </NavItem>
        </Nav>
        <Nav className='ml-auto' navbar>
          <ViewChanger></ViewChanger>
          <AccountDropdown></AccountDropdown>
        </Nav>
      
      </React.Fragment>
    )
  }
}

DefaultHeader.propTypes = propTypes
DefaultHeader.defaultProps = defaultProps

export default DefaultHeader
