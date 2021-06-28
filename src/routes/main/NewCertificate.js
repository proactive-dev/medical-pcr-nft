import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { DatePicker, Divider, Form, Input, Select, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import { Font, pdf } from '@react-pdf/renderer'
import { COMMON_DATE_FORMAT, ERROR, NOTIFY_LINK, SUCCESS, TEST_RESULT } from '../../constants/AppConfigs'
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
import moment from 'moment'

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
          email: bigNumberArrayToString(result['user']['mail'])
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
          name: bigNumberArrayToString(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: bigNumberArrayToString(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: bigNumberArrayToString(result['mail'])
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
      ethers.utils.formatBytes32String(values.sampleId),
      ethers.utils.formatBytes32String(values.sample),
      ethers.utils.formatBytes32String(values.collectionMethod),
      ethers.utils.formatBytes32String(values.collectionDate.format(COMMON_DATE_FORMAT)),
      ethers.utils.formatBytes32String(values.testMethod),
      values.testResult,
      ethers.utils.formatBytes32String(values.testResultDate.format(COMMON_DATE_FORMAT)),
      fileHash
    ).then((result) => {
      dispatch(hideLoader())
      notify({
        to: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        resultDate: values.testResultDate.format(COMMON_DATE_FORMAT),
        issuer: organization.name
      })
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.mint'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const notify = async (values) => {
    dispatch(showLoader())
    await fetch(NOTIFY_LINK, {
      method: 'POST',
      body: JSON.stringify(values)
    })

    dispatch(hideLoader())
  }

  return (
    <Spin spinning={loader}>
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
        layout={'vertical'}
        ref={formRef}
        onFinish={submit}>
        <FormItem
          name="sampleId"
          label={intl.formatMessage({id: 'collection.sampleId'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="sample"
          label={intl.formatMessage({id: 'collection.sample'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="collectionMethod"
          label={intl.formatMessage({id: 'collection.method'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="collectionDate"
          label={intl.formatMessage({id: 'collection.date'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <DatePicker
            className="gx-mt-1 gx-mb-1"
            format={COMMON_DATE_FORMAT}
            disabledDate={(current) => {
              return moment() < current
            }}/>
        </FormItem>
        <FormItem
          name="testMethod"
          label={intl.formatMessage({id: 'test.method'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
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
        <FormItem
          name="testResultDate"
          label={intl.formatMessage({id: 'test.result.date'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <DatePicker
            className="gx-mt-1 gx-mb-1"
            format={COMMON_DATE_FORMAT}
            disabledDate={(current) => {
              return moment() < current
            }}/>
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
