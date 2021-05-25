// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require("hardhat");

const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2
}

// eslint-disable-next-line no-unused-vars
function getSignatures (contract) {
  return Object.keys(contract.interface.functions)
}

function getSelectors (contract) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [])
  return selectors
}

async function deployFacets (...facets) {
  const instances = []
  for (let facet of facets) {
    let constructorArgs = []
    if (Array.isArray(facet)) {
      ;[facet, constructorArgs] = facet
    }
    const factory = await ethers.getContractFactory(facet)
    const facetInstance = await factory.deploy(...constructorArgs)
    await facetInstance.deployed()
    const tx = facetInstance.deployTransaction
    const receipt = await tx.wait()
    console.log(`${facet} deployed to: ${facetInstance.address}`)
    console.log(`${facet} deploy gas used: ${receipt.gasUsed}`)
    instances.push(facetInstance)
  }
  return instances
}

async function main() {
  const accounts = await ethers.getSigners()
  const owner = await accounts[0].getAddress()

  let [
    roleFacet,
    userFacet,
    organizationFacet,
    requestFacet,
    certificateFacet
  ] = await deployFacets(
    'PCRRoleFacet',
    'PCRUserFacet',
    'PCROrganizationFacet',
    'PCRRequestFacet',
    'PCRCertificateFacet'
  )

  const facets = [
    ['PCRRoleFacet', roleFacet],
    ['PCRUserFacet', userFacet],
    ['PCROrganizationFacet', organizationFacet],
    ['PCRRequestFacet', requestFacet],
    ['PCRCertificateFacet', certificateFacet]
  ]

  console.log('---------------')
  console.log('Setting up DiamondCut args...')

  const diamondCut = []
  for (const [name, deployedFacet] of facets) {
    console.log(`----- ${name} -----`)
    console.log(getSignatures(deployedFacet))
    diamondCut.push([
      deployedFacet.address,
      FacetCutAction.Add,
      getSelectors(deployedFacet)
    ])
  }

  console.log('---------------')
  console.log(`Deploying Diamond....`)

  const diamondFactory = await ethers.getContractFactory('Diamond')
  const deployedDiamond = await diamondFactory.deploy(diamondCut, [owner])
  await deployedDiamond.deployed()
  const result = await deployedDiamond.deployTransaction.wait()
  if (!result.status) {
    console.log('Deploying diamond TRANSACTION FAILED!!! ---------------')
    console.log('See block explorer app for details.')
    console.log('Transaction hash:' + deployedDiamond.deployTransaction.hash)
    throw (Error('failed to deploy diamond'))
  }
  console.log('Diamond deploy transaction hash:' + deployedDiamond.deployTransaction.hash)
  console.log('Diamond deployed to:', deployedDiamond.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
