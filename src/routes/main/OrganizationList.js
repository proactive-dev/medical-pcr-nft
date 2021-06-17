import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { List, Spin } from 'antd'
import { ethers } from 'ethers'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { ERROR, TYPE_ORGANIZATION, VIEW } from '../../constants/AppConfigs'
import { bigNumberArrayToString, findRole } from '../../util/helpers'

const OrganizationList = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl} = props
  const {contract} = chain
  const [organizations, setOrganizations] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    dispatch(showLoader())
    contract.getOrganizations().then((result) => {
      dispatch(hideLoader())
      let _organizations = []
      result[0].forEach((account, index) => {
        _organizations.push({
          role: result[1][index]['role'],
          account: account,
          name: bigNumberArrayToString(result[1][index]['name']),
          streetAddress: bigNumberArrayToString(result[1][index]['streetAddress']),
          phone: ethers.utils.parseBytes32String(result[1][index]['phone']),
          mail: bigNumberArrayToString(result[1][index]['mail']),
          representative: ethers.utils.parseBytes32String(result[1][index]['representative'])
        })
      })
      setOrganizations(_organizations)
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  return (
    <Spin spinning={loader}>
      <List
        bordered
        header={<div>{organizations.length} {intl.formatMessage({id: 'organizations'})}</div>}
        dataSource={organizations}
        renderItem={item =>
          <List.Item key={item.id}>
            <List.Item.Meta
              title={`${item.name}(${intl.formatMessage({id: `role.${findRole(item.role)}`})})`}
              description={item.streetAddress}
            />
            <Link to={`/${TYPE_ORGANIZATION}/${VIEW}/${item.account}`} className="gx-pointer gx-link gx-text-underline">
              <FormattedMessage id="detail"/>
            </Link>
          </List.Item>
        }
      />
    </Spin>
  )
}

export default withRouter(injectIntl(OrganizationList))
