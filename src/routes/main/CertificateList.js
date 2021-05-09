import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Button, List, Modal, Spin } from 'antd'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { ERROR, FILTER_ME } from '../../constants/AppConfigs'
import { ipfsLink, timestamp2Date } from '../../util/helpers'
import { encrypt } from '../../util/crypto'
import { ethers } from 'ethers'

const CertificateList = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, match} = props
  const {address, contract} = chain
  const [filter, setFilter] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let _filter = match.params.filter
    if (!_.isEmpty(_filter) && !_.isUndefined(_filter)) {
      setFilter(_filter)
      fetchData(_filter)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const buildQR = (certificate) => {
    const {id} = certificate
    const data2Show = {id, timestamp: Date.now()}
    return encrypt(JSON.stringify(data2Show))
  }

  const fetchData = (_filter) => {
    dispatch(showLoader())
    if (_filter === FILTER_ME) {
      contract.getCertificates(address).then((result) => {
        dispatch(hideLoader())
        let _certificates = []
        result[0].forEach((id, index) => {
          _certificates.push({
            id: id.toNumber(),
            name: ethers.utils.parseBytes32String(result[1][index]['request']['name']),
            fileHash: result[1][index]['fileHash'],
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
            fileHash: result[1][index]['fileHash'],
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
            {
              (filter === FILTER_ME) &&
              <Button className="gx-link gx-text-underline gx-mb-0" type="link" onClick={() => setSelected(item)}>
                <FormattedMessage id="show.qrcode"/>
              </Button>
            }
            <a className="gx-link gx-text-underline" href={ipfsLink(item.fileHash)} target="_blank"
               rel="noopener noreferrer">
              <FormattedMessage id="detail"/>
            </a>
          </List.Item>
        }
      />
      {
        (filter === FILTER_ME) && !!selected &&
        <Modal
          visible={!!selected}
          footer={null}
          onOk={() => setSelected(null)}
          onCancel={() => setSelected(null)}>
          <h4 className={'gx-m-2'}>{`${intl.formatMessage({id: 'issue.date'})} ${selected.issuedAt}`}</h4>
          <span className={'gx-m-2'}>{`${intl.formatMessage({id: 'expire.date'})} ${selected.expireAt}`}</span>
          <br/>
          <div className={'gx-text-center gx-mt-4'}>
            <h3 className={'gx-font-weight-bold gx-text-primary'}>{selected.name}</h3>
            <QRCode
              value={buildQR(selected)}
              size={240}
              level="H"/>
            <br/>
          </div>
        </Modal>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(CertificateList))
