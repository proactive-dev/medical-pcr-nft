import React, { useEffect, useState } from 'react'
import { injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import { Document, Page, pdfjs } from 'react-pdf'
import { openNotificationWithIcon } from '../../components/Messages'
import { ERROR } from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { ipfsLink } from '../../util/helpers'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const CertificateView = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, match} = props
  const {contract} = chain
  const [fileHash, setFileHash] = useState('')

  useEffect(() => {
    let _id = match.params.id
    if (!_.isEmpty(_id) && !_.isUndefined(_id)) {
      fetchData(_id)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const fetchData = (id) => {
    dispatch(showLoader())
    contract.getCertificate(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result) || _.isEmpty(result['fileHash'])) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        setFileHash(result['fileHash'])
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  return (
    <Spin spinning={loader}>
      <Document file={ipfsLink(fileHash)}>
        <Page pageNumber={1}/>
      </Document>
    </Spin>
  )
}

export default withRouter(injectIntl(CertificateView))
