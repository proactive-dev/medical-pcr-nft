import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import { openNotificationWithIcon } from '../../components/Messages'
import { COMMON_DATE_FORMAT, ERROR, QRREADER_TIMEOUT } from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import QrReader from 'react-qr-reader'
import { decrypt } from '../../util/crypto'
import { ethers } from 'ethers'
import { timestamp2Date } from '../../util/helpers'

const RealtimeCertificateQRReader = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {contract} = chain
  const {intl} = props
  const [certificate, setCertificate] = useState({})

  const fetchCertificate = (id) => {
    dispatch(showLoader())
    contract.getCertificate(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result) || _.isEmpty(result['fileHash'])) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _cert = {
          resultDate: timestamp2Date(result['resultDate'].toNumber()),
          collectionDate: ethers.utils.parseBytes32String(result['request']['collectionDate']),
          issuedAt: timestamp2Date(result['issuedAt'].toNumber()),
          expireAt: timestamp2Date(result['expireAt'].toNumber())
        }
        setCertificate(_cert)
        setTimeout(() => {
          setCertificate({})
        }, 3000)
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const handleQrCodeScan = (value) => {
    if (!_.isEmpty(value)) {
      try {
        const _data = JSON.parse(decrypt(value))
        fetchCertificate(_data.id)
      } catch (error) {
        console.log(error)
        setCertificate({})
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
      }
    }
  }

  const handleQrCodeError = (err) => {
    let msg = intl.formatMessage({id: 'alert.qrCodeError'})
    if (!_.isEmpty(err) && !_.isEmpty(err.message)) {
      msg = msg + ':' + err.message
    }
    setCertificate({})
    openNotificationWithIcon(ERROR, msg)
  }

  const getExpireStatus = (_date) => {
    const timeDiff = moment.duration(moment().diff(moment(_date, COMMON_DATE_FORMAT))).asHours()
    switch (true) {
      case (timeDiff <= 72):
        return 'info'
      case (timeDiff <= 96):
        return 'success'
      case (timeDiff <= 120):
        return 'warning'
      default:
        return 'error'
    }
  }

  const {
    collectionDate
  } = certificate

  return (
    <Spin spinning={loader}>
      <div className={'gx-text-center'}>
        <QrReader
          style={{height: 250, width: 250, margin: 'auto'}}
          delay={QRREADER_TIMEOUT}
          onScan={handleQrCodeScan}
          onError={handleQrCodeError}
        />
      </div>
      {
        !_.isEmpty(certificate) &&
        <img src={require(`assets/images/${getExpireStatus(collectionDate)}.svg`)}
             alt={getExpireStatus(collectionDate)}/>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(RealtimeCertificateQRReader))
