import React, { useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Descriptions, Image, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import moment from 'moment'
import { openNotificationWithIcon } from '../../components/Messages'
import { COMMON_DATE_FORMAT, ERROR, QRREADER_TIMEOUT } from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { QrcodeOutlined } from '@ant-design/icons'
import QrReader from 'react-qr-reader'
import { decrypt } from '../../util/crypto'
import { ethers } from 'ethers'
import { findResult, ipfsLink, timestamp2Date } from '../../util/helpers'

const CertificateQRReader = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {contract} = chain
  const {intl} = props
  const [qrReaderVisible, setQrReaderVisible] = useState(false)
  const [certificate, setCertificate] = useState({})
  const [organization, setOrganization] = useState({})

  const fetchCertificate = (id) => {
    dispatch(showLoader())
    contract.getCertificate(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result) || _.isEmpty(result['fileHash'])) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _cert = {
          firstName: ethers.utils.parseBytes32String(result['request']['user']['firstName']),
          lastName: ethers.utils.parseBytes32String(result['request']['user']['lastName']),
          photo: result['request']['user']['photo'],
          sampleId: ethers.utils.parseBytes32String(result['sampleId']),
          result: parseInt(result['result']),
          resultDate: ethers.utils.parseBytes32String(result['resultDate']),
          issuedAt: timestamp2Date(result['issuedAt'].toNumber()),
          expireAt: timestamp2Date(result['expireAt'].toNumber())
        }
        setCertificate(_cert)
        fetchOrganization(result['organizationAccount'])
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const fetchOrganization = (account) => {
    dispatch(showLoader())
    contract.getOrganization(account).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _info = {
          name: ethers.utils.parseBytes32String(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: ethers.utils.parseBytes32String(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        }
        if (_.isEmpty(_info['name'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        } else {
          setOrganization(_info)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const handleQrCodeScan = (value) => {
    setQrReaderVisible(false)
    if (!_.isEmpty(value)) {
      try {
        const _data = JSON.parse(decrypt(value))
        fetchCertificate(_data.id)
      } catch (error) {
        console.log(error)
        setCertificate({})
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
      }
    } else {
      setCertificate({})
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }

  const handleQrCodeError = (err) => {
    let msg = intl.formatMessage({id: 'alert.qrCodeError'})
    if (!_.isEmpty(err) && !_.isEmpty(err.message)) {
      msg = msg + ':' + err.message
    }
    setCertificate({})
    openNotificationWithIcon(ERROR, msg)
    setQrReaderVisible(false)
  }

  const getExpireStatus = (issuedAt) => {
    const timeDiff = moment.duration(moment().diff(moment(issuedAt, COMMON_DATE_FORMAT))).asHours()
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
    firstName,
    lastName,
    photo,
    sampleId,
    result,
    resultDate,
    issuedAt,
    expireAt
  } = certificate

  return (
    <Spin spinning={loader}>
      <Button className="gx-mt-md-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>}
              onClick={() => setQrReaderVisible(true)}>
        &nbsp;<FormattedMessage id="scan.qrCode"/>
      </Button>
      {
        qrReaderVisible &&
        <div className={'gx-text-center'}>
          <QrReader
            style={{height: 250, width: 250, margin: 'auto'}}
            delay={QRREADER_TIMEOUT}
            onScan={handleQrCodeScan}
            onError={handleQrCodeError}
          />
        </div>
      }
      {
        !qrReaderVisible && !_.isEmpty(certificate) && !_.isEmpty(organization) &&
        <>
          <Alert
            className={`gx-cert-description-${getExpireStatus(issuedAt)}`}
            message={`${intl.formatMessage({id: 'issue.date'})} ${issuedAt}`}
            description={`${intl.formatMessage({id: 'expire.date'})} ${expireAt}`}
            type={getExpireStatus(issuedAt)}/>
          <div className={'gx-text-center gx-mt-4'}>
            <h3 className={'gx-font-weight-bold gx-text-primary'}>{`${lastName} ${firstName}`}</h3>
            <Image className="gx-mt-1 gx-mb-1" src={ipfsLink(photo)} alt={intl.formatMessage({id: 'image'})}/>
          </div>
          <Descriptions
            bordered
            className={`gx-mt-md-4 gx-cert-description-${getExpireStatus(issuedAt)} ant-alert-${getExpireStatus(issuedAt)}`}
            column={{xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1}}
            labelStyle={{backgroundColor: 'transparent', borderColor: 'transparent'}}
            contentStyle={{backgroundColor: 'transparent', borderColor: 'transparent'}}
            size={'middle'}>
            <Descriptions.Item label={intl.formatMessage({id: 'collection.sampleId'})}>{sampleId}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'test.result'})}>
              {_.isUndefined(result) ? '' : intl.formatMessage({id: `test.result.${findResult(result)}`})}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({id: 'test.result.date'})} span={2}>
              {resultDate}
            </Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'organization.name'})} span={4}>
              {organization.name}
            </Descriptions.Item>
          </Descriptions>
        </>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(CertificateQRReader))
