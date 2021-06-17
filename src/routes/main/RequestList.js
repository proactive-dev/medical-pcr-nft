import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { List, Spin } from 'antd'
import { ethers } from 'ethers'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { CERTIFICATE, ERROR, NEW } from '../../constants/AppConfigs'
import { bigNumberArrayToString, timestamp2Date } from '../../util/helpers'

const RequestList = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl} = props
  const {address, contract} = chain
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    dispatch(showLoader())
    contract.getTestRequestsByIssuer(address).then((result) => {
      dispatch(hideLoader())
      let _requests = []
      result[0].forEach((id, index) => {
        if (result[1][index]['issuedAt'].toNumber() === 0) {
          _requests.push({
            id: id.toNumber(),
            account: result[1][index]['account'],
            firstName: ethers.utils.parseBytes32String(result[1][index]['user']['firstName']),
            lastName: ethers.utils.parseBytes32String(result[1][index]['user']['lastName']),
            residence: bigNumberArrayToString(result[1][index]['user']['residence']),
            birthDate: ethers.utils.parseBytes32String(result[1][index]['user']['birth']),
            gender: parseInt(result[1][index]['user']['gender']),
            phoneNumber: ethers.utils.parseBytes32String(result[1][index]['user']['phone']),
            email: bigNumberArrayToString(result[1][index]['user']['mail']),
            requestedAt: timestamp2Date(result[1][index]['requestedAt'].toNumber())
          })
        }
      })
      setRequests(_requests)
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  return (
    <Spin spinning={loader}>
      <List
        bordered
        header={<div>{requests.length} {intl.formatMessage({id: 'requests'})}</div>}
        dataSource={requests}
        renderItem={item =>
          <List.Item key={item.id}>
            <List.Item.Meta
              title={`${item.lastName} ${item.firstName}`}
              description={item.requestedAt}
            />
            <Link to={`/${CERTIFICATE}/${NEW}/${item.id}`} className="gx-pointer gx-link gx-text-underline">
              <FormattedMessage id="issue.certificate"/>
            </Link>
          </List.Item>
        }
      />
    </Spin>
  )
}

export default withRouter(injectIntl(RequestList))
