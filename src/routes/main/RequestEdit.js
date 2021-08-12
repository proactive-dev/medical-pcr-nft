import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Form, Input, Modal, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import Webcam from 'react-webcam'
import { ethers } from 'ethers'
import _ from 'lodash'
import { isAddress } from '@ethersproject/address'
import { QrcodeOutlined } from '@ant-design/icons'
import QrReader from 'react-qr-reader'
import {
  COMMON_DATE_FORMAT,
  ERROR,
  QRREADER_TIMEOUT,
  SUCCESS,
  TYPE_ORGANIZATION,
  TYPE_USER
} from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { bigNumberArrayToString, uploadDataURIToIPFS } from '../../util/helpers'
import UserViewForm from '../../components/UserViewForm'
import OrganizationViewForm from '../../components/OrganizationViewForm'
import moment from 'moment'

const FormItem = Form.Item

const formRef = React.createRef()

const RequestEdit = (props) => {
  const webcamRef = useRef(null)
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract, ipfs} = chain
  const {intl, history, match} = props
  const [qrCodeModalOpen, setQRCodeModalOpen] = useState(false)
  const [webcamModalOpen, setWebcamModalOpen] = useState(false)
  const [qrValue, setQrValue] = useState(null)
  const [user, setUser] = useState({})
  const [issuer, setIssuer] = useState({})

  useEffect(() => {
    if (match.params.type === TYPE_USER) {
      fetchUser(address)
    } else if (match.params.type === TYPE_ORGANIZATION) {
      fetchOrganization(address)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const saveTestRequest = async ({values, kitImgHash}) => {
    const reqParams = match.params.type === TYPE_USER ? [address, qrValue] : [qrValue, address]
    dispatch(showLoader())
    contract.newTestRequest(
      ...reqParams,
      ethers.utils.formatBytes32String(values.sampleId),
      kitImgHash,
      ethers.utils.formatBytes32String(moment.utc().format(COMMON_DATE_FORMAT))
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.request'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const fetchUser = (account) => {
    dispatch(showLoader())
    contract.getPerson(account).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _info = {
          account,
          firstName: ethers.utils.parseBytes32String(result['firstName']),
          lastName: ethers.utils.parseBytes32String(result['lastName']),
          residence: bigNumberArrayToString(result['residence']),
          birthDate: ethers.utils.parseBytes32String(result['birth']),
          gender: parseInt(result['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: bigNumberArrayToString(result['mail'])
        }
        if (_.isEmpty(_info['firstName']) || _.isEmpty(_info['lastName']) || _.isEmpty(_info['phoneNumber']) || _.isEmpty(_info['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        } else {
          setUser(_info)
        }
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
          role: result['role'],
          account,
          name: bigNumberArrayToString(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: bigNumberArrayToString(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: bigNumberArrayToString(result['mail']),
          sample: ethers.utils.parseBytes32String(result['sample']),
          collectionMethod: ethers.utils.parseBytes32String(result['collectionMethod']),
          testMethod: ethers.utils.parseBytes32String(result['testMethod'])
        }
        if (_.isEmpty(_info['name']) || _.isEmpty(_info['phoneNumber']) || _.isEmpty(_info['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        } else {
          setIssuer(_info)
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

  const showWebcamModal = () => {
    formRef.current.validateFields().then((values) => {
      setWebcamModalOpen(true)
    }).catch((errors) => {
      console.log('Form errors', errors)
    })
  }

  const closeWebcamModal = e => {
    setWebcamModalOpen(false)
  }

  const getScreenshotAndRequest = async () => {
    formRef.current.validateFields().then(async (values) => {
      const imageSrc = webcamRef.current.getScreenshot()
      const kitImgHash = await uploadDataURIToIPFS({ipfs, uri: imageSrc})

      await saveTestRequest({values, kitImgHash})
      setWebcamModalOpen(false)
    }).catch((errors) => {
      setWebcamModalOpen(false)
      console.log('Form errors', errors)
    })
  }

  const handleQrCodeScan = (value) => {
    setQRCodeModalOpen(false)
    if (isAddress(value)) {
      setQrValue(value)
      if (match.params.type === TYPE_USER) {
        fetchOrganization(value)
      } else if (match.params.type === TYPE_ORGANIZATION) {
        fetchUser(value)
      }
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidAddress'}))
    }
  }

  const handleQrCodeError = (err) => {
    let msg = intl.formatMessage({id: 'alert.qrCodeError'})
    if (!_.isEmpty(err) && !_.isEmpty(err.message)) {
      msg = msg + ':' + err.message
    }
    openNotificationWithIcon(ERROR, msg)
    setQRCodeModalOpen(false)
  }

  return (
    <Spin spinning={loader}>
      <Button className="gx-mt-md-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>} onClick={showQRCodeModal}>
        &nbsp;<FormattedMessage id="scan.qrCode"/>
      </Button>
      <UserViewForm
        intl={intl}
        info={user}
      />
      <OrganizationViewForm
        intl={intl}
        info={issuer}
      />
      <Form
        name="request-form"
        layout={'vertical'}
        ref={formRef}>
        <FormItem
          name="sampleId"
          label={intl.formatMessage({id: 'collection.kitId'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
      </Form>
      <Button
        className="gx-mt-4 login-form-button"
        type="primary"
        disabled={_.isEmpty(qrValue)}
        onClick={showWebcamModal}>
        <FormattedMessage id="request"/>
      </Button>
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
      {
        webcamModalOpen &&
        <Modal
          visible={true}
          onOk={getScreenshotAndRequest}
          onCancel={closeWebcamModal}>
          <div className={'gx-text-center'}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={250}
              videoConstraints={{facingMode: 'environment'}}
            />
          </div>
        </Modal>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(RequestEdit))
