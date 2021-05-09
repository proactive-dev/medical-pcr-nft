import React, { useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Descriptions, Modal, Spin } from 'antd'
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
import { findGender, findResult, timestamp2Date } from '../../util/helpers'

const CertificateQRReader = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {contract} = chain
  const {intl} = props
  const [qrCodeModalOpen, setQRCodeModalOpen] = useState(false)
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
          name: ethers.utils.parseBytes32String(result['request']['name']),
          birthDate: ethers.utils.parseBytes32String(result['request']['birth']),
          gender: parseInt(result['request']['gender']),
          sample: ethers.utils.parseBytes32String(result['sample']),
          testMethod: ethers.utils.parseBytes32String(result['testMethod']),
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

  const showQRCodeModal = () => {
    setQRCodeModalOpen(true)
  }

  const closeQRCodeModal = e => {
    setQRCodeModalOpen(false)
  }

  const handleQrCodeScan = (value) => {
    setQRCodeModalOpen(false)
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
    setQRCodeModalOpen(false)
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

  const {name, birthDate, gender, sample, testMethod, result, resultDate, issuedAt, expireAt} = certificate

  return (
    <Spin spinning={loader}>
      <Button className="gx-mt-md-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>} onClick={showQRCodeModal}>
        &nbsp;<FormattedMessage id="scan.qrCode"/>
      </Button>
      {
        !_.isEmpty(certificate) && !_.isEmpty(organization) &&
        <>
          <Alert
            message={`${intl.formatMessage({id: 'issue.date'})} ${issuedAt}`}
            description={`${intl.formatMessage({id: 'expire.date'})} ${expireAt}`}
            type={getExpireStatus(issuedAt)}/>
          <Descriptions
            className="gx-mt-md-4"
            layout="vertical"
            bordered
            column={{xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1}}
            size={'small'}>
            <Descriptions.Item label={intl.formatMessage({id: 'name'})} span={2}>{name}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'birthDate'})}>{birthDate}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'gender'})}>
              {gender ? intl.formatMessage({id: `gender.${findGender(gender)}`}) : ''}
            </Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'collection.sample'})}>{sample}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'test.method'})}>{testMethod}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'test.result'})}>
              {result ? intl.formatMessage({id: `test.result.${findResult(result)}`}) : ''}
            </Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'test.result.date'})}>{resultDate}</Descriptions.Item>
            <Descriptions.Item label={intl.formatMessage({id: 'organization.name'})} span={4}>
              {organization.name}
            </Descriptions.Item>
          </Descriptions>
        </>
      }
      {
        qrCodeModalOpen &&
        <Modal
          visible={true}
          footer={null}
          onOk={closeQRCodeModal}
          onCancel={closeQRCodeModal}>
          <div className={'gx-text-center'}>
            <QrReader
              style={{height: 250, width: 250, margin: 'auto'}}
              delay={QRREADER_TIMEOUT}
              onScan={handleQrCodeScan}
              onError={handleQrCodeError}
            />
          </div>
        </Modal>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(CertificateQRReader))
