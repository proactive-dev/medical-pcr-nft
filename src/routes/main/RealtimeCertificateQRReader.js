import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import AWS from 'aws-sdk'
import { jsonToCSV } from 'react-papaparse'
import { openNotificationWithIcon } from '../../components/Messages'
import {
  AWS_ACCESS,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET,
  COMMON_DATE_FORMAT,
  ERROR,
  QRREADER_TIMEOUT
} from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import QrReader from 'react-qr-reader'
import { decrypt } from '../../util/crypto'
import { ethers } from 'ethers'
import { timestamp2Date } from '../../util/helpers'

const s3 = new AWS.S3({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS,
  secretAccessKey: AWS_SECRET
})

const RealtimeCertificateQRReader = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract} = chain
  const {intl} = props
  const [certificate, setCertificate] = useState({})

  const fetchCertificate = async (id) => {
    dispatch(showLoader())
    contract.getCertificate(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result) || _.isEmpty(result['fileHash'])) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _cert = {
          resultDate: ethers.utils.parseBytes32String(result['resultDate']),
          collectionDate: ethers.utils.parseBytes32String(result['collectionDate']),
          issuedAt: timestamp2Date(result['issuedAt'].toNumber()),
          expireAt: timestamp2Date(result['expireAt'].toNumber())
        }
        uploadCSV(result['request']['userAccount'])
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

  const uploadCSV = async (account) => {
    dispatch(showLoader())
    const csv = [
      {
        timestamp: '?????????????????????',
        reader: '?????????ID',
        account: 'QR?????????ID'
      },
      {
        timestamp: new Date().getTime(),
        reader: address,
        account: account
      }]
    const params = {
      Bucket: AWS_BUCKET,
      Key: `pcrpass-${new Date().getTime()}.csv`,
      ACL: 'public-read',
      Body: jsonToCSV(csv, {header: false}),
      ContentType: 'text/csv'
    }
    try {
      await s3.upload(params).promise()
      dispatch(hideLoader())
    } catch (e) {
      dispatch(hideLoader())
      console.log('Upload CSV Error:', e)
    }
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
