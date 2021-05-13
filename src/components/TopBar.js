import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Layout } from 'antd'
import { toggleCollapsedSideNav } from '../appRedux/actions/Setting'
import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, TAB_SIZE } from '../constants/ThemeSetting'

const {Header} = Layout

const TopBar = () => {
  const dispatch = useDispatch()
  const settings = useSelector(state => state.settings)
  const {navCollapsed, navStyle, width} = settings

  return (
    <Header>
      {
        navStyle === NAV_STYLE_DRAWER || ((navStyle === NAV_STYLE_FIXED || navStyle === NAV_STYLE_MINI_SIDEBAR) && width < TAB_SIZE) ?
          <div className="gx-linebar gx-mr-3">
            <i className="gx-icon-btn icon icon-menu"
               onClick={() => dispatch(toggleCollapsedSideNav(!navCollapsed))}
            />
          </div>
          :
          null
      }
      <Link to="/" className="gx-d-block gx-d-lg-none gx-pointer">
        <img alt="" src={require('assets/images/w-logo.svg')}/>
      </Link>
    </Header>
  )
}

export default TopBar
