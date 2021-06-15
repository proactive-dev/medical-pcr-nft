export const COPYRIGHT_COMPANY = 'Xyon.,Co. Ltd. All Rights Reserved.'
export const PROJECT_NAME = 'XYON CERT'
export const STORAGE_KEY = 'xy-cert'

export const LANGUAGES = [
  {
    code: 'ja',
    name: '日本語'
  }
]

// Notification constants
export const SUCCESS = 'success'
export const ERROR = 'error'
export const NOTIFICATION_TIMEOUT = 5 // seconds
export const QRREADER_TIMEOUT = 3000 // miliseconds

export const COMMON_DATE_FORMAT = 'YYYY/MM/DD'

export const DEFAULT_PRECISION = 2
export const DEFAULT_DECIMALS = 18

export const RPC_PROVIDER = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_RPC_PROVIDER_PROD : process.env.REACT_APP_RPC_PROVIDER_LOCAL
export const CONTRACT_OWNER_KEY = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PRIV_KEY_PROD : process.env.REACT_APP_PRIV_KEY_LOCAL
export const CONTRACT_STORAGE_ADDRESS = process.env.REACT_APP_STORAGE_ADDRESS
export const CONTRACT_CERT_ADDRESS = process.env.REACT_APP_CERTIFICATE_ADDRESS

export const HOME = 'home'
export const NEW = 'new'
export const EDIT = 'edit'
export const VIEW = 'view'
export const LIST = 'list'
export const SCAN = 'scan'
export const CERTIFICATE = 'certificate'
export const REQUEST = 'request'
export const TYPE_USER = 'user'
export const TYPE_ORGANIZATION = 'organization'
export const ONCE = 'once'
export const REALTIME = 'realtime'

export const GENDER = [
  {
    key: 'male', value: 0
  },
  {
    key: 'female', value: 1
  }
]

export const ROLE = [
  {
    key: 'issuer', value: 0
  },
  {
    key: 'business', value: 1
  }
]

export const TEST_RESULT = [
  {
    key: 'negative', value: 0
  },
  {
    key: 'positive', value: 1
  }
]

export const USER_MENUS = [
  {
    path: `${TYPE_USER}/${EDIT}`,
    title: 'register.me'
  },
  {
    path: `${TYPE_USER}/${VIEW}`,
    title: 'view.me'
  },
  {
    path: `${TYPE_USER}/${REQUEST}/${NEW}`,
    title: 'test.request'
  },
  {
    path: `${CERTIFICATE}/${LIST}`,
    title: 'view.my.cert'
  },
  {
    path: `${CERTIFICATE}/${SCAN}/${ONCE}`,
    title: 'read.other'
  }
]

export const BUSINESS_MENUS = [
  {
    path: `${CERTIFICATE}/${SCAN}/${ONCE}`,
    title: 'read.other'
  },
  {
    path: `${CERTIFICATE}/${SCAN}/${REALTIME}`,
    title: 'read.realtime'
  }
]

export const ADMIN_MENUS = [
  {
    path: `${TYPE_ORGANIZATION}/${LIST}`,
    title: 'organizations'
  },
  {
    path: `${TYPE_ORGANIZATION}/${EDIT}`,
    title: 'register.organization'
  },
  {
    path: `${CERTIFICATE}/${LIST}`,
    title: 'view.all.cert'
  }
]

export const ISSUER_MENUS = [
  {
    path: `${VIEW}`,
    title: 'view.me'
  },
  {
    path: `${TYPE_ORGANIZATION}/${REQUEST}/${NEW}`,
    title: 'test.request'
  },
  {
    path: `${REQUEST}/${LIST}`,
    title: 'issue.certificate.title'
  },
  {
    path: `${CERTIFICATE}/${LIST}`,
    title: 'view.all.cert'
  }
]
