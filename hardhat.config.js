/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

module.exports = {
  defaultNetwork: "private",
  networks: {
    hardhat: {
    },
    local: {
      url: process.env.REACT_APP_RPC_PROVIDER_LOCAL,
      // chainId: parseInt(process.env.REACT_APP_NETWORK_ID_LOCAL),
      accounts: [process.env.PRIV_KEY_LOCAL]
    },
    private: {
      url: process.env.REACT_APP_RPC_PROVIDER_PROD,
      chainId: parseInt(process.env.REACT_APP_NETWORK_ID_PROD),
      accounts: [process.env.PRIV_KEY_PROD]
    }
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./src/artifacts"
  }
}
