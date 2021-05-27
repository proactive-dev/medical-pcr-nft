import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import CustomScrollbars from '../../components/CustomScrollbars'
import SidebarLogo from './SidebarLogo'
import { THEME_TYPE_LITE } from '../../constants/ThemeSetting'
import { ADMIN_MENUS, BUSINESS_MENUS, ISSUER_MENUS, USER_MENUS } from '../../constants/AppConfigs'

const SidebarContent = () => {
  const settings = useSelector(state => state.settings)
  const roles = useSelector(state => state.chain.roles)
  const {themeType, pathname} = settings
  const {isAdmin, isIssuer, isBusiness} = roles

  const selectedKeys = pathname.substr(1)
  const defaultOpenKeys = selectedKeys.split('/')[1]

  return (
    <Fragment>
      <SidebarLogo/>
      <div className="gx-sidebar-content">
        <CustomScrollbars className="gx-layout-sider-scrollbar">
          <Menu
            defaultOpenKeys={[defaultOpenKeys]}
            selectedKeys={[selectedKeys]}
            theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
            mode="inline">
            {
              isAdmin && ADMIN_MENUS.map(({path, title}) =>
                <Menu.Item key={path}>
                  <Link to={`/${path}`}>
                    <FormattedMessage id={title}/>
                  </Link>
                </Menu.Item>
              )
            }
            {
              !isAdmin && isIssuer && ISSUER_MENUS.map(({path, title}) =>
                <Menu.Item key={path}>
                  <Link to={`/${path}`}>
                    <FormattedMessage id={title}/>
                  </Link>
                </Menu.Item>
              )

            }
            {
              !isAdmin && !isIssuer && isBusiness && BUSINESS_MENUS.map(({path, title}) =>
                <Menu.Item key={path}>
                  <Link to={`/${path}`}>
                    <FormattedMessage id={title}/>
                  </Link>
                </Menu.Item>
              )
            }
            {
              !isAdmin && !isIssuer && !isBusiness && USER_MENUS.map(({path, title}) =>
                <Menu.Item key={path}>
                  <Link to={`/${path}`}>
                    <FormattedMessage id={title}/>
                  </Link>
                </Menu.Item>
              )
            }
          </Menu>
        </CustomScrollbars>
      </div>
    </Fragment>
  )
}

export default SidebarContent
