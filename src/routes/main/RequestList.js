import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Col, List, Row, Spin } from 'antd'
import { ethers } from 'ethers'
import _ from 'lodash'
import moment from 'moment'
import { CSVDownloader, CSVReader, jsonToCSV } from 'react-papaparse'
import { Font, pdf } from '@react-pdf/renderer'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { CERTIFICATE, COMMON_DATE_FORMAT, ERROR, INFO, NEW, NOTIFY_LINK, SUCCESS } from '../../constants/AppConfigs'
import { bigNumberArrayToString, timestamp2Date, uploadIPFS } from '../../util/helpers'
import CertificatePDF from '../../components/CertificatePDF'
import SourceHanSansJPExtraLight from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-ExtraLight.ttf'
import SourceHanSansJPLight from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Light.ttf'
import SourceHanSansJPMedium from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Medium.ttf'
import SourceHanSansJPNormal from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Normal.ttf'
import SourceHanSansJPBold from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Bold.ttf'
import SourceHanSansJPHeavy from '../../assets/fonts/SourceHanSansJP/SourceHanSansJP-Heavy.ttf'

const csvReaderRef = React.createRef()

const RequestList = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl} = props
  const {address, contract, certContract, ipfs} = chain
  const [requests, setRequests] = useState([])

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
    fetchData()
  }, [])

  const fetchData = () => {
    dispatch(showLoader())
    contract.getTestRequestsByIssuer(address).then((result) => {
      dispatch(hideLoader())
      let _requests = []
      result[0].forEach((id, index) => {
        if (result[1][index]['issuedAt'].toNumber() === 0) {
          _requests.push({
            id: id.toNumber(),
            account: result[1][index]['userAccount'],
            firstName: ethers.utils.parseBytes32String(result[1][index]['user']['firstName']),
            lastName: ethers.utils.parseBytes32String(result[1][index]['user']['lastName']),
            residence: bigNumberArrayToString(result[1][index]['user']['residence']),
            birthDate: ethers.utils.parseBytes32String(result[1][index]['user']['birth']),
            gender: parseInt(result[1][index]['user']['gender']),
            phoneNumber: ethers.utils.parseBytes32String(result[1][index]['user']['phone']),
            email: bigNumberArrayToString(result[1][index]['user']['mail']),
            requestedAt: timestamp2Date(result[1][index]['requestedAt'].toNumber())
          })
        }
      })
      setRequests(_requests)
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const csvHeader = () => {
    return {
      id: 'ReqID',
      account: 'ID',
      lastName: intl.formatMessage({id: 'name.last'}),
      firstName: intl.formatMessage({id: 'name.first'}),
      residence: intl.formatMessage({id: 'address'}),
      birthDate: intl.formatMessage({id: 'birthDate'}),
      gender: intl.formatMessage({id: 'gender'}),
      phoneNumber: intl.formatMessage({id: 'phoneNumber'}),
      email: 'Email',
      requestedAt: intl.formatMessage({id: 'test.request.date'}),
      sampleId: intl.formatMessage({id: 'collection.sampleId'}),
      sample: intl.formatMessage({id: 'collection.sample'}),
      collectionMethod: intl.formatMessage({id: 'collection.method'}),
      collectionDate: intl.formatMessage({id: 'collection.date'}),
      testMethod: intl.formatMessage({id: 'test.method'}),
      testResult: intl.formatMessage({id: 'test.result'}),
      testResultDate: intl.formatMessage({id: 'test.result.date'})
    }
  }

  const handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (csvReaderRef.current) {
      csvReaderRef.current.open(e)
    }
  }

  const handleOnFileLoad = async (rows) => {
    dispatch(showLoader())
    // Prepare data for certificates
    const resultData = []
    for (const [index, row] of rows.entries()) {
      if (index === 0) {
        continue // Skip CSV Header
      }
      const {data, error} = row
      if (!_.isEmpty(error) || _.isEmpty(data)) {
        continue // Skip empty rows or rows error happened
      }
      const reqId = data[0] || ''
      const account = data[1] || ''
      const email = data[8] || ''
      const sampleId = data[10] || ''
      const sample = data[11] || ''
      const collectionMethod = data[12] || ''
      const collectionDate = data[13] || ''
      const testMethod = data[14] || ''
      const testResultStr = data[15] || ''
      const testResultDate = data[16] || ''
      if (_.isEmpty(sampleId) || _.isEmpty(sample) ||
        _.isEmpty(collectionMethod) || _.isEmpty(collectionDate) ||
        _.isEmpty(testMethod) || _.isEmpty(testResultStr) || _.isEmpty(testResultDate)) {
        continue // Skip empty or invalid row
      }
      const testResult = ((testResultStr === '陰性') || (testResultStr.toLocaleUpperCase() === 'NEGATIVE') || (Number(testResultStr) === 0)) ? 0 : 1
      if (testResult !== 0) { // Negative Result only
        continue
      }
      const request = _.find(requests, {'id': Number(reqId), 'account': account, 'email': email})
      if (_.isEmpty(request) || _.isUndefined(request)) {
        continue // Skip rows that has invalid request data
      }
      const test = {
        sampleId,
        sample,
        collectionMethod,
        collectionDate: moment(collectionDate, COMMON_DATE_FORMAT),
        testMethod,
        testResult,
        testResultDate: moment(testResultDate, COMMON_DATE_FORMAT)
      }
      resultData.push({test, request})
    }
    if (_.isEmpty(resultData)) {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
      dispatch(hideLoader())
      return
    }

    // Fetch Organization
    let organization = {}
    try {
      const result = await contract.getOrganization(address)
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidIssuer'}))
        dispatch(hideLoader())
        return
      } else {
        organization = {
          name: bigNumberArrayToString(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: bigNumberArrayToString(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: bigNumberArrayToString(result['mail'])
        }
        if (_.isEmpty(organization['name']) || _.isEmpty(organization['phoneNumber']) || _.isEmpty(organization['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidIssuer'}))
          dispatch(hideLoader())
          return
        }
      }
    } catch (error) {
      openNotificationWithIcon(ERROR, error.message)
      dispatch(hideLoader())
      return
    }

    let count = 0
    // Mint Certificates and count
    for (const record of resultData) {
      const {test, request} = record

      // Export to PDF
      const file = await pdf(
        <CertificatePDF
          id={request.id}
          request={request}
          issuer={organization}
          test={test}/>
      ).toBlob()

      // Upload to IPFS
      const fileHash = await uploadIPFS({ipfs, file})
      if (!fileHash) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.fail2UploadIPFS'}))
        continue
      }

      // Mint request to smart contract
      try {
        await certContract.mintCertificate(
          Number(request.id),
          ethers.utils.formatBytes32String(test.sampleId),
          ethers.utils.formatBytes32String(test.sample),
          ethers.utils.formatBytes32String(test.collectionMethod),
          ethers.utils.formatBytes32String(test.collectionDate.format(COMMON_DATE_FORMAT)),
          ethers.utils.formatBytes32String(test.testMethod),
          test.testResult,
          ethers.utils.formatBytes32String(test.testResultDate.format(COMMON_DATE_FORMAT)),
          fileHash
        )
        notify({
          to: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          resultDate: test.testResultDate.format(COMMON_DATE_FORMAT),
          issuer: organization.name
        })
        count++
        openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.mint'}))
      } catch (error) {
        openNotificationWithIcon(ERROR, error.message)
      }
    }
    openNotificationWithIcon(INFO, intl.formatMessage({id: 'alert.success.mint.with.count'}, {
      total: rows.length,
      count: count
    }))
    dispatch(hideLoader())
    fetchData()
  }

  const notify = async (values) => {
    dispatch(showLoader())
    await fetch(NOTIFY_LINK, {
      method: 'POST',
      body: JSON.stringify(values)
    })

    dispatch(hideLoader())
  }

  const handleOnError = (err, file, inputElem, reason) => {
    openNotificationWithIcon(ERROR, 'CSV Handle Error')
    console.log(err)
  }

  const handleOnRemoveFile = (data) => {
    console.log(data)
  }

  return (
    <Spin spinning={loader}>
      {
        !_.isEmpty(requests) &&
        <Row className="gx-mt-2 gx-mb-3" justify="space-between" align={'middle'}>
          <Col span={12} xxl={12} xl={12} lg={12} md={12} sm={12} xs={24}>
            <CSVReader
              ref={csvReaderRef}
              onFileLoad={handleOnFileLoad}
              onError={handleOnError}
              noClick
              noDrag
              noProgressBar
              onRemoveFile={handleOnRemoveFile}>
              {({file}) => (
                <Button className="gx-text-underline gx-m-2 gx-p-0" type="link" onClick={handleOpenDialog}>
                  <FormattedMessage id={'csv.new.certificate'}/>
                </Button>
              )}
            </CSVReader>
          </Col>
          <Col span={12} xxl={12} xl={12} lg={12} md={12} sm={12} xs={24}>
            <CSVDownloader
              className="gx-link gx-text-underline gx-pointer gx-m-2 gx-p-0"
              data={jsonToCSV([csvHeader(), ...requests], {header: false})}
              filename={`${Date.now()}`}
              type={'link'}>
              <FormattedMessage id={'csv.download'}/>
            </CSVDownloader>
          </Col>
        </Row>
      }
      <List
        bordered
        header={<div>{requests.length} {intl.formatMessage({id: 'requests'})}</div>}
        dataSource={requests}
        renderItem={item =>
          <List.Item key={item.id}>
            <List.Item.Meta
              title={`${item.lastName} ${item.firstName}`}
              description={item.requestedAt}
            />
            <Link to={`/${CERTIFICATE}/${NEW}/${item.id}`} className="gx-pointer gx-link gx-text-underline">
              <FormattedMessage id="issue.certificate"/>
            </Link>
          </List.Item>
        }
      />
    </Spin>
  )
}

export default withRouter(injectIntl(RequestList))
