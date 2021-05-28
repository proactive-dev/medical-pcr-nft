import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Card, Col, Row } from 'antd'
import { withRouter } from 'react-router-dom'
import { ADMIN_MENUS, BUSINESS_MENUS, ISSUER_MENUS, USER_MENUS } from '../../constants/AppConfigs'

const Home = (props) => {
  const roles = useSelector(state => state.chain.roles)
  const {isAdmin, isIssuer, isBusiness} = roles
  const {history} = props

  const onClick = (path) => {
    history.push(`/${path}`)
  }

  let menus = []
  if (isAdmin) {
    menus = ADMIN_MENUS
  } else if (isIssuer) {
    menus = ISSUER_MENUS
  } else if (isBusiness) {
    menus = BUSINESS_MENUS
  } else {
    menus = USER_MENUS
  }

  return (
    <Row className="gx-pt-5 gx-pb-5">
      {
        menus.map(({path, title}) =>
          <Col span={12} xxl={8} xl={8} lg={8} md={12} sm={12} xs={12} key={path}>
            <Card className="gx-card-home"
                  bordered={false}
                  onClick={() => onClick(path)}>
              <FormattedMessage id={title}/>
            </Card>
          </Col>
        )
      }
    </Row>
  )
}

export default withRouter(Home)
