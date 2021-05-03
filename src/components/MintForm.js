import React from 'react'
import { useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, Spin, Upload } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import ConfirmButton from './ConfirmButton'
import { ipfsLink } from '../util/helpers'

const FormItem = Form.Item
const formRef = React.createRef()

const MintForm = (props) => {
  const loader = useSelector(state => state.progress.loader)
  const {intl, connectedAccount, fileHash, onSubmit} = props

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

  return (
    <Spin spinning={loader}>
      <Form
        name="register-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={onSubmit}>
        <FormItem
          name="fileHash"
          label={intl.formatMessage({id: 'file.hash'})}>
          <a className="gx-link gx-text-underline" href={ipfsLink(fileHash)} target="_blank" rel="noopener noreferrer">
            {fileHash}
          </a>
        </FormItem>
        <FormItem
          name="name"
          label={intl.formatMessage({id: 'name'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="description"
          label={intl.formatMessage({id: 'description'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input.TextArea className="gx-mt-1 gx-mb-1"/>
        </FormItem>
        <FormItem
          name="images"
          label={intl.formatMessage({id: 'image'})}
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
      <ConfirmButton
        intl={intl}
        form={formRef}
        btnTitle={'mint'}
        confirmEnabled={connectedAccount.privateKey}/>
    </Spin>
  )
}

export default withRouter(injectIntl(MintForm))
