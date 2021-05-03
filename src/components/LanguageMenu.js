import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Popover } from 'antd'
import { LANGUAGES } from '../constants/AppConfigs'
import { switchLanguage } from '../appRedux/actions/Setting'

const LanguageMenu = () => {
  const locale = useSelector(state => state.settings.locale)
  const dispatch = useDispatch()
  const [popoverVisible, setPopoverVisible] = useState(false)

  const languageMenu = () => (
    <ul className="gx-sub-popover">
      {LANGUAGES.map(language =>
        <li className="gx-media gx-pointer gx-p-2" key={language.code}
            onClick={(e) => onMenuChange(language.code)}>
          <i className={`flag flag-24 gx-mr-2 flag-${language.code}`}/>
          <span className="gx-language-text">{language.name}</span>
        </li>
      )}
    </ul>
  )

  const onMenuChange = (value) => {
    setPopoverVisible(false)
    dispatch(switchLanguage(value))
  }

  const handleVisibleChange = (visible) => {
    setPopoverVisible(visible)
  }

  return (
    <Popover
      overlayClassName="gx-popover-horizantal"
      placement="bottomRight"
      content={languageMenu()}
      visible={popoverVisible}
      onVisibleChange={handleVisibleChange}
      trigger="hover">
        <span className="gx-pointer gx-flex-row gx-align-items-center">
          <i className={`flag flag-24 flag-${locale}`}/>
          <i className="icon icon-chevron-down gx-pl-2"/>
        </span>
    </Popover>
  )
}

export default LanguageMenu
