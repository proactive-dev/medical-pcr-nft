import { SET_CONTRACT, SET_IPFS, SET_ROLES } from '../../constants/ActionTypes'

const INIT_STATE = {
  ipfs: null,
  contract: null,
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
      const {contract, address} = action.payload
      return {
        ...state,
        address,
        contract
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
