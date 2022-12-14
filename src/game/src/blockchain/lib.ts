import { ethers } from 'ethers'
import { ShipToken } from '../state/stateTypes'
import { state } from '../state/state'
// import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";

const SpaceShipsAbi = require('./abi/SpaceShips.json')
const SpaceCoinsAbi = require('./abi/SpaceCoins.json')

declare var window: any
let provider: ethers.providers.Web3Provider
let signer: ethers.providers.JsonRpcSigner
let address: string
let spaceShipsContract: ethers.Contract
let spaceCoinsContract: ethers.Contract
let spaceShipsContractWithSigner: ethers.Contract
let spaceCoinsContractWithSigner: ethers.Contract

export const connectWallet = async () => {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum)

    await provider.send('eth_requestAccounts', [])

    // window.ethereum
    //   .request({
    //     method: 'wallet_switchEthereumChain',
    //     params: [{ chainId: `0x${Number(4).toString(80001)}` }],
    //   })
    //   .catch(() => {})

    window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0xB0C',
          rpcUrls: ['https://rpc.l16.lukso.network/'],
          chainName: 'L16',
          nativeCurrency: {
            name: 'LYXt',
            symbol: 'LYXt',
            decimals: 16,
          },
          blockExplorerUrls: null,
        },
      ],
    })

    const accountsRequest: string[] = await provider.send(
      'eth_requestAccounts',
      [],
    );

    signer = provider.getSigner()
    address = await signer.getAddress()

    spaceShipsContract = new ethers.Contract(state.spaceShipsContract, SpaceShipsAbi, provider)
    spaceShipsContractWithSigner = spaceShipsContract.connect(signer)

    spaceCoinsContract = new ethers.Contract(state.spaceCoinsContract, SpaceCoinsAbi, provider)
    spaceCoinsContractWithSigner = spaceCoinsContract.connect(signer)

    console.log(address)
  } catch (e: any) {
    console.log(e)
    alert(e)
  }
}

export const getShips = async () => {
  try {
    const shipId1 = await spaceShipsContractWithSigner.tokenOfOwnerByIndex(address, 1)
    const shipId2 = await spaceShipsContractWithSigner.tokenOfOwnerByIndex(address, 2)
    const shipId3 = await spaceShipsContractWithSigner.tokenOfOwnerByIndex(address, 3)
    const shipId4 = await spaceShipsContractWithSigner.tokenOfOwnerByIndex(address, 4)

    const shipCode1 = await spaceShipsContractWithSigner._tokenToShipCode(shipId1)
    const shipCode2 = await spaceShipsContractWithSigner._tokenToShipCode(shipId2)
    const shipCode3 = await spaceShipsContractWithSigner._tokenToShipCode(shipId3)
    const shipCode4 = await spaceShipsContractWithSigner._tokenToShipCode(shipId4)

    state.ownedShips = [
      {
        tokenId: shipId1,
        shipCode: shipCode1,
      },
      {
        tokenId: shipId2,
        shipCode: shipCode2,
      },
      {
        tokenId: shipId3,
        shipCode: shipCode3,
      },
      {
        tokenId: shipId4,
        shipCode: shipCode4,
      },
    ]
    console.log(state.ownedShips)
  } catch (e: any) {
    console.log(e)
    // window.location.reload()
  }
}

export const mintShip = async () => {
  const tx = await spaceShipsContractWithSigner.mintShip(address)
  const receipt = await tx.wait()
  console.log(receipt)

  // const OPERATION_CALL = 0
  // const targetPayload = spaceShipsContract.interface.encodeFunctionData('mintShip', [address])
  // let abiPayload = myUp.interface.encodeFunctionData('execute', [
  //   OPERATION_CALL,
  //   spaceShipsContract.address,
  //   0,
  //   targetPayload,
  // ])
  // await myKeyManager.connect(upOwner).execute(abiPayload)
}

export const upgradeShip = async (ship: ShipToken) => {
  const tx = await spaceShipsContractWithSigner.upgradeShip(ship.tokenId, ship.shipCode)
  const confirmation = await provider.getTransactionReceipt(tx.hash)
  console.log(confirmation)
}

export const getTokenBalance = async () => {
  const spaceCoinsBalance = await spaceCoinsContractWithSigner.balanceOf(address)
  state.spaceCoinsBalance = spaceCoinsBalance.toNumber()
  console.log(spaceCoinsBalance.toNumber(), 'SpaceCoins')
}

export const mintTokens = async () => {
  const tx = await spaceCoinsContractWithSigner.mint(address, 1000)
  const confirmation = await provider.getTransactionReceipt(tx.hash)
  console.log(confirmation)
}

export const burnTokens = async () => {
  const tx = await spaceCoinsContractWithSigner.burn(1000)
  const confirmation = await provider.getTransactionReceipt(tx.hash)
  console.log(confirmation)
}
