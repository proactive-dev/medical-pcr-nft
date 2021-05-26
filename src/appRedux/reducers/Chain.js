import { SET_CONTRACT, SET_IPFS, SET_ROLES } from '../../constants/ActionTypes'

const INIT_STATE = {
  ipfs: null,
  contract: null,
  certContract: null,
  address: null,
  roles: {}
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case SET_IPFS:
      return {
        ...state,
        ipfs: action.payload
      }
    case SET_CONTRACT:
      const {contract, certContract, address} = action.payload
      return {
        ...state,
        address,
        contract,
        certContract
      }
    case SET_ROLES:
      return {
        ...state,
        roles: action.payload
      }
    default:
      return state
  }
}
