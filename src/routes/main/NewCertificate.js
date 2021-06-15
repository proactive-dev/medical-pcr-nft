import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Divider, Form, Select, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import { Font, pdf } from '@react-pdf/renderer'
import { ERROR, SUCCESS, TEST_RESULT } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import ConfirmButton from '../../components/ConfirmButton'
import UserViewForm from '../../components/UserViewForm'
import OrganizationViewForm from '../../components/OrganizationViewForm'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { bigNumberArrayToString, uploadIPFS } from '../../util/helpers'
import CertificatePDF from '../../components/CertificatePDF'
import SourceHanSansJPExtraLight from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-ExtraLight.ttf'
import SourceHanSansJPLight from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Light.ttf'
import SourceHanSansJPMedium from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Medium.ttf'
import SourceHanSansJPNormal from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Normal.ttf'
import SourceHanSansJPBold from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Bold.ttf'
import SourceHanSansJPHeavy from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Heavy.ttf'

const FormItem = Form.Item
const {Option} = Select

const formRef = React.createRef()

const NewCertificate = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract, certContract, ipfs} = chain
  const {intl, match, history} = props
  const [requestId, setRequestId] = useState(null)
  const [request, setRequest] = useState({})
  const [organization, setOrganization] = useState({})

  useEffect(() => {
    Font.register({
      family: 'SourceHanSansJP',
      fonts: [
        {src: SourceHanSansJPExtraLight, fontWeight: 200},
        {src: SourceHanSansJPLight, fontWeight: 300},
        {src: SourceHanSansJPNormal, fontWeight: 400},
        {src: SourceHanSansJPMedium, fontWeight: 500},
        {src: SourceHanSansJPBold, fontWeight: 700},
        {src: SourceHanSansJPHeavy, fontWeight: 900}
      ]
    })

    let id = match.params.id
    if (!_.isEmpty(id) && !_.isUndefined(id)) {
      setRequestId(id)
      fetchTestRequest(id)
      fetchOrganization()
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const fetchTestRequest = (id) => {
    dispatch(showLoader())
    contract.getTestRequest(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _request = {
          account: result['userAccount'],
          firstName: ethers.utils.parseBytes32String(result['user']['firstName']),
          lastName: ethers.utils.parseBytes32String(result['user']['lastName']),
          residence: bigNumberArrayToString(result['user']['residence']),
          birthDate: ethers.utils.parseBytes32String(result['user']['birth']),
          gender: parseInt(result['user']['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['user']['phone']),
          email: ethers.utils.parseBytes32String(result['user']['mail']),
          sampleId: ethers.utils.parseBytes32String(result['sampleId']),
          collectionDate: ethers.utils.parseBytes32String(result['collectionDate'])
        }
        if (_.isEmpty(_request['firstName']) || _.isEmpty(_request['lastName']) || _.isEmpty(_request['phoneNumber']) || _.isEmpty(_request['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
          window.history.back()
        } else {
          setRequest(_request)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const fetchOrganization = () => {
    dispatch(showLoader())
    contract.getOrganization(address).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _organization = {
          // role: result['role'],
          name: ethers.utils.parseBytes32String(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: bigNumberArrayToString(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail']),
          sample: ethers.utils.parseBytes32String(result['sample']),
          collectionMethod: ethers.utils.parseBytes32String(result['collectionMethod']),
          testMethod: ethers.utils.parseBytes32String(result['testMethod'])
        }
        if (_.isEmpty(_organization['name']) || _.isEmpty(_organization['phoneNumber']) || _.isEmpty(_organization['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
          window.history.back()
        } else {
          setOrganization(_organization)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const submit = async (values) => {
    if (values.testResult !== 0) { // Negative Result only
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.positiveResult'}))
      return
    }

    // Export to PDF
    const file = await pdf(
      <CertificatePDF
        id={requestId}
        request={request}
        issuer={organization}
        test={values}/>
    ).toBlob()

    // Upload to IPFS and Mint
    dispatch(showLoader())
    const fileHash = await uploadIPFS({ipfs, file})
    dispatch(hideLoader())
    if (fileHash) {
      // Mint request to smart contract
      await mintRequest(values, fileHash)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.fail2UploadIPFS'}))
    }
  }

  const mintRequest = async (values, fileHash) => {
    dispatch(showLoader())
    certContract.mintCertificate(
      Number(requestId),
      values.testResult,
      fileHash
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.mint'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  return (
    <Spin spinning={loader}>
      <Divider orientation="left" dashed={true}>
        <h3 className="gx-text-primary"><FormattedMessage id="test.result.select"/></h3>
      </Divider>
      <Form
        name="result-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={submit}>
        <FormItem
          name="testResult"
          label={intl.formatMessage({id: 'test.result'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Select className="gx-mt-1 gx-mb-1" allowClear>
            {
              TEST_RESULT.map(resultObj =>
                <Option value={resultObj.value} key={resultObj.key}>
                  {intl.formatMessage({id: `test.result.${resultObj.key}`})}
                </Option>
              )
            }
          </Select>
        </FormItem>
      </Form>
      <Divider orientation="left" dashed={true}>
        <h3 className="gx-text-primary"><FormattedMessage id="confirm.information"/></h3>
      </Divider>
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.user"/></h3>
      </Divider>
      <UserViewForm
        intl={intl}
        info={request}
        showId={true}
      />
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.test"/></h3>
      </Divider>
      <Form
        name="test-form"
        layout={'vertical'}>
        <FormItem name="sampleId" label={intl.formatMessage({id: 'collection.sampleId'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request['sampleId'] || ''}</span>
        </FormItem>
        <FormItem name="collectionDate" label={intl.formatMessage({id: 'collection.date'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request['collectionDate'] || ''}</span>
        </FormItem>
        <FormItem name="sample" label={intl.formatMessage({id: 'collection.sample'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization['sample'] || ''}</span>
        </FormItem>
        <FormItem name="collectionMethod" label={intl.formatMessage({id: 'collection.method'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization['collectionMethod'] || ''}</span>
        </FormItem>
        <FormItem name="testMethod" label={intl.formatMessage({id: 'test.method'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization['testMethod'] || ''}</span>
        </FormItem>
      </Form>
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.issuer"/></h3>
      </Divider>
      <OrganizationViewForm
        intl={intl}
        info={organization}
      />
      <ConfirmButton intl={intl} form={formRef} btnTitle={'mint'} confirmEnabled={false}/>
    </Spin>
  )
}

export default withRouter(injectIntl(NewCertificate))
