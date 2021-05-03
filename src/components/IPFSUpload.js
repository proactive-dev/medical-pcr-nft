import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Spin, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const IPFSUpload = ({onSubmit}) => {
  const [file, setFile] = useState(null)
  const loader = useSelector(state => state.progress.loader)

  return (
    <Spin spinning={loader}>
      <Upload
        fileList={file ? [file] : []}
        maxCount={1}
        beforeUpload={() => {
          return false
        }}
        onChange={(param) => setFile(param.file)}
        onRemove={() => setFile(null)}>
        <Button icon={<UploadOutlined/>}><FormattedMessage id={'select.file'}/></Button>
      </Upload>
      <Button className="gx-mt-4 login-form-button" type="primary" disabled={!file} onClick={() => onSubmit(file)}>
        <FormattedMessage id={'upload'}/>
      </Button>
    </Spin>
  )
}

export default withRouter(injectIntl(IPFSUpload))
