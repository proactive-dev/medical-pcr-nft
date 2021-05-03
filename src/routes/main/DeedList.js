import React, { useEffect, useState } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { List } from 'antd'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { ERROR, VIEW } from '../../constants/AppConfigs'

const DeedList = (props) => {
  const {intl, contract, connectedAccount} = props
  const dispatch = useDispatch()
  const [deeds, setDeeds] = useState([])

  useEffect(() => {
    getDeeds()
  }, [])

  const getDeeds = () => {
    dispatch(showLoader())
    contract.methods.getDeeds().call({from: connectedAccount.address}).then((result) => {
      dispatch(hideLoader())
      let _deeds = []
      result[0].forEach((id, index) => {
        _deeds.push({id: id, name: result[1][index]['name'], description: result[1][index]['description']})
      })
      setDeeds(_deeds)

    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  return (
    <List
      bordered
      header={<div>{deeds.length} {intl.formatMessage({id: 'deeds'})}</div>}
      dataSource={deeds}
      renderItem={item =>
        <List.Item key={item.id}>
          <List.Item.Meta
            title={
              <Link to={`/${VIEW}/${item.id}`} className="gx-pointer gx-link gx-text-underline">
                {item.name}
              </Link>
            }
            description={item.description}
          />
        </List.Item>
      }
    />
  )
}

export default withRouter(injectIntl(DeedList))
