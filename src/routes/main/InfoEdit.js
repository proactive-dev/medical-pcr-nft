import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { DatePicker, Form, Input, Select, Spin, Upload } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import moment from 'moment'
import { isAddress } from '@ethersproject/address'
import { COMMON_DATE_FORMAT, ERROR, GENDER, ROLE, SUCCESS, TYPE_ORGANIZATION } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import ConfirmButton from '../../components/ConfirmButton'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { uploadIPFS } from '../../util/helpers'

const FormItem = Form.Item
const {Option} = Select

const formRef = React.createRef()

const InfoEdit = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract, ipfs} = chain
  const {intl, history, location, match} = props
  const [roleValue, setRoleValue] = useState(0)

  useEffect(() => {
    if (!_.isEmpty(location.state) && !_.isEmpty(location.state.info)) {
      const info = location.state.info
      if (info && info.birthDate) {
        info['birthDate'] = moment(info.birthDate, COMMON_DATE_FORMAT)
      }
      setRoleValue(info.role)
      formRef.current.setFieldsValue(info)
    }
  }, [])

  const saveUser = async (values) => {
    dispatch(showLoader())
    const photoHash = await uploadIPFS({ipfs, file: values.images[0]})
    if (photoHash) {
      contract.setPerson(
        address,
        ethers.utils.formatBytes32String(values.firstName),
        ethers.utils.formatBytes32String(values.lastName),
        ethers.utils.formatBytes32String(values.birthDate.format(COMMON_DATE_FORMAT)),
        values.gender,
        [...ethers.utils.toUtf8Bytes(values.residence)],
        ethers.utils.formatBytes32String(values.phoneNumber),
        [...ethers.utils.toUtf8Bytes(values.email)],
        photoHash
      ).then((result) => {
        dispatch(hideLoader())
        openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.user'}))
        history.push('/')
      }).catch((error) => {
        dispatch(hideLoader())
        openNotificationWithIcon(ERROR, error.message)
      })
    } else {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.fail2UploadIPFS'}))
    }
  }

  const saveOrganization = (values) => {
    dispatch(showLoader())
    contract.setOrganization(
      values.role,
      values.account,
      [...ethers.utils.toUtf8Bytes(values.name)],
      ethers.utils.formatBytes32String(values.delegateName),
      [...ethers.utils.toUtf8Bytes(values.residence)],
      ethers.utils.formatBytes32String(values.phoneNumber),
      [...ethers.utils.toUtf8Bytes(values.email)],
      ethers.utils.formatBytes32String(values.sample ? values.sample : ''),
      ethers.utils.formatBytes32String(values.collectionMethod ? values.collectionMethod : ''),
      ethers.utils.formatBytes32String(values.testMethod ? values.testMethod : '')
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.organization'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const onRoleChanged = (value) => {
    setRoleValue(value)
  }

  const normalizeFile = (e) => {
    if (e && e.file) {
      return [e.file]
    }
    if (e && e.fileList) {
      if (e.fileList.length > 1) {
        return e.fileList.shift()
      } else {
        return e.fileList[0]
      }
    }
    return []
  }

  const getUserForm = () => {
    return (
      <Form
        name="user-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={saveUser}>
        <FormItem
          name="lastName"
          label={intl.formatMessage({id: 'name.last'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="firstName"
          label={intl.formatMessage({id: 'name.first'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="residence"
          label={intl.formatMessage({id: 'address'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="birthDate"
          label={intl.formatMessage({id: 'birthDate'})}
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
          name="gender"
          label={intl.formatMessage({id: 'gender'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Select className="gx-mt-1 gx-mb-1" allowClear>
            {
              GENDER.map(gender =>
                <Option value={gender.value} key={gender.key}>
                  {intl.formatMessage({id: `gender.${gender.key}`})}
                </Option>
              )
            }
          </Select>
        </FormItem>
        <FormItem
          name="phoneNumber"
          label={intl.formatMessage({id: 'phoneNumber.example'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="email"
          label={'Email'}
          rules={[
            {type: 'email', message: intl.formatMessage({id: 'alert.invalidEmail'})},
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="images"
          label={intl.formatMessage({id: 'photo'})}
          valuePropName="fileList"
          getValueFromEvent={normalizeFile}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Upload.Dragger
            beforeUpload={() => {
              return false
            }}
            listType={'picture'}
            maxCount={1}>
            <p className="ant-upload-drag-icon">
              <PictureOutlined/>
            </p>
            <p className="ant-upload-text"><FormattedMessage id={'upload.image.text'}/></p>
            <p className="ant-upload-hint"><FormattedMessage id={'upload.image.hint'}/></p>
          </Upload.Dragger>
        </FormItem>
      </Form>
    )
  }

  const getOrganizationForm = () => {
    return (
      <Form
        name="organization-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={saveOrganization}>
        <FormItem
          name="account"
          label={'ID'}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})},
            {
              validator: (_, value) => (!value || isAddress(value)) ?
                Promise.resolve() : Promise.reject(intl.formatMessage({id: 'alert.invalidAddress'}))
            }
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="role"
          label={intl.formatMessage({id: 'role'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Select className="gx-mt-1 gx-mb-1" allowClear onChange={onRoleChanged}>
            {
              ROLE.map(role =>
                <Option value={role.value} key={role.key}>
                  {intl.formatMessage({id: `role.${role.key}`})}
                </Option>
              )
            }
          </Select>
        </FormItem>
        <FormItem
          name="name"
          label={intl.formatMessage({id: 'organization.name'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="delegateName"
          label={intl.formatMessage({id: 'organization.delegate'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="residence"
          label={intl.formatMessage({id: 'organization.address'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="phoneNumber"
          label={intl.formatMessage({id: 'phoneNumber.example'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="email"
          label={'Email'}
          rules={[
            {type: 'email', message: intl.formatMessage({id: 'alert.invalidEmail'})},
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        {
          (roleValue === 0) &&
          <>
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
              name="testMethod"
              label={intl.formatMessage({id: 'test.method'})}
              rules={[
                {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
              ]}>
              <Input className="gx-mt-1 gx-mb-1" allowClear/>
            </FormItem>
          </>
        }
      </Form>
    )
  }

  return (
    <Spin spinning={loader}>
      {
        match.params.type === TYPE_ORGANIZATION ?
          getOrganizationForm()
          :
          getUserForm()
      }
      <ConfirmButton intl={intl} form={formRef} btnTitle={'request'} confirmEnabled={false}/>
    </Spin>
  )
}

export default withRouter(injectIntl(InfoEdit))
