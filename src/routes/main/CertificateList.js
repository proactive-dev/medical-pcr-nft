import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { List, Spin } from 'antd'
import _ from 'lodash'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { CERTIFICATE, ERROR, FILTER_ME, VIEW } from '../../constants/AppConfigs'
import { timestamp2Date } from '../../util/helpers'

const CertificateList = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, match} = props
  const {contract} = chain
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    let _filter = match.params.filter
    if (!_.isEmpty(_filter) && !_.isUndefined(_filter)) {
      fetchData(_filter)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const fetchData = (_filter) => {
    dispatch(showLoader())
    if (_filter === FILTER_ME) {
      contract.getCertificates().then((result) => {
        dispatch(hideLoader())
        let _certificates = []
        result[0].forEach((id, index) => {
          _certificates.push({
            id: id.toNumber(),
            issuedAt: timestamp2Date(result[1][index]['issuedAt'].toNumber()),
            expireAt: timestamp2Date(result[1][index]['expireAt'].toNumber())
          })
        })
        setCertificates(_certificates)
      }).catch((error) => {
        dispatch(hideLoader())
        openNotificationWithIcon(ERROR, error.message)
      })
    } else {
      contract.getAllCertificates().then((result) => {
        dispatch(hideLoader())
        let _certificates = []
        result[0].forEach((id, index) => {
          _certificates.push({
            id: id.toNumber(),
            issuedAt: timestamp2Date(result[1][index]['issuedAt'].toNumber()),
            expireAt: timestamp2Date(result[1][index]['expireAt'].toNumber())
          })
        })
        setCertificates(_certificates)
      }).catch((error) => {
        dispatch(hideLoader())
        openNotificationWithIcon(ERROR, error.message)
      })
    }
  }

  return (
    <Spin spinning={loader}>
      <List
        bordered
        header={<div>{certificates.length} {intl.formatMessage({id: 'certificates'})}</div>}
        dataSource={certificates}
        renderItem={item =>
          <List.Item key={item.id}>
            <List.Item.Meta
              title={item.issuedAt}
              description={`${intl.formatMessage({id: 'expire.date'})} ${item.expireAt}`}
            />
            <Link to={`/${CERTIFICATE}/${VIEW}/${item.id}`} className="gx-pointer gx-link gx-text-underline">
              <FormattedMessage id="detail"/>
            </Link>
          </List.Item>
        }
      />
    </Spin>
  )
}

export default withRouter(injectIntl(CertificateList))
