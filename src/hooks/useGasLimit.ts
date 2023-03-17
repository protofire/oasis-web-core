import { useEffect, useMemo } from 'react'
import { BigNumber, utils } from 'ethers'
import type Safe from '@safe-global/safe-core-sdk'
import { encodeSignatures } from '@/services/tx/encodeSignatures'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import chains from '@/config/chains'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { useSafeSDK } from './coreSDK/safeCoreSDK'
import useIsSafeOwner from './useIsSafeOwner'
import { Errors, logError } from '@/services/exceptions'

const getEncodedSafeTx = (safeSDK: Safe, safeTx: SafeTransaction, from?: string): string => {
  const EXEC_TX_METHOD = 'execTransaction'

  return safeSDK
    .getContractManager()
    .safeContract.encode(EXEC_TX_METHOD, [
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
      safeTx.data.safeTxGas,
      0,
      safeTx.data.gasPrice,
      safeTx.data.gasToken,
      safeTx.data.refundReceiver,
      encodeSignatures(safeTx, from),
    ])
}

const incrementByPercentage = (value: BigNumber, percentage: number): BigNumber => {
  return value.mul(100 + percentage).div(100)
}

const useGasLimit = (
  safeTx?: SafeTransaction,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const safeSDK = useSafeSDK()
  const web3ReadOnly = useWeb3ReadOnly()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const walletAddress = wallet?.address
  const isOwner = useIsSafeOwner()
  const currentChainId = useChainId()

  const encodedSafeTx = useMemo<string>(() => {
    if (!safeTx || !safeSDK || !walletAddress) {
      return ''
    }
    return getEncodedSafeTx(safeSDK, safeTx, isOwner ? walletAddress : undefined)
  }, [safeSDK, safeTx, walletAddress, isOwner])

  const operationType = useMemo<number>(
    () => (safeTx?.data.operation == OperationType.DelegateCall ? 1 : 0),
    [safeTx?.data.operation],
  )

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber>(() => {
    if (!safeAddress || !walletAddress || !encodedSafeTx || !web3ReadOnly) return

    if (currentChainId === chains.sapphire && safeTx) {
      const { data, to, value } = safeTx.data

      if (data === '0x' && value === '0' && to === safeAddress) {
        // cancellation
        return Promise.resolve(BigNumber.from(80_000))
      } else if (data === '0x' && value !== '0' && utils.isAddress(to)) {
        // sending native token
        return Promise.resolve(BigNumber.from(100_000))
      } else if (data.startsWith('0xa9059cbb') && value === '0' && utils.isAddress(to)) {
        // transfer erc20 token
        return Promise.resolve(BigNumber.from(150_000))
      } else if (data.startsWith('0x42842e0e') && value === '0' && utils.isAddress(to)) {
        // transfer erc1155 token
        return Promise.resolve(BigNumber.from(150_000))
      } else if (data.startsWith('0xf8dc5dd9') && value === '0' && to === safeAddress) {
        // remove owner
        return Promise.resolve(BigNumber.from(70_000))
      } else if (data.startsWith('0x0d582f13') && value === '0' && to === safeAddress) {
        // add owner
        return Promise.resolve(BigNumber.from(130_000))
      } else if (data.startsWith('0xe318b52b') && value === '0' && to === safeAddress) {
        // swap owners
        return Promise.resolve(BigNumber.from(100_000))
      } else if (data.startsWith('0x694e80c3') && value === '0' && to === safeAddress) {
        // changing the threshold
        return Promise.resolve(BigNumber.from(70_000))
      } else {
        // Something else...
        return Promise.resolve(BigNumber.from(3_500_000))
      }
    }

    return web3ReadOnly
      .estimateGas({
        to: safeAddress,
        from: walletAddress,
        data: encodedSafeTx,
        type: operationType,
      })
      .then((gasLimit) => {
        // Due to a bug in Nethermind estimation, we need to increment the gasLimit by 30%
        // when the safeTxGas is defined and not 0. Currently Nethermind is used only for Gnosis Chain.
        if (currentChainId === chains.gno) {
          const incrementPercentage = 30 // value defined in %, ex. 30%
          const isSafeTxGasSetAndNotZero = !!safeTx?.data?.safeTxGas
          if (isSafeTxGasSetAndNotZero) {
            return incrementByPercentage(gasLimit, incrementPercentage)
          }
        }

        return gasLimit
      })
  }, [currentChainId, safeAddress, safeTx, walletAddress, encodedSafeTx, web3ReadOnly, operationType])

  useEffect(() => {
    if (gasLimitError) {
      logError(Errors._612, gasLimitError.message)
    }
  }, [gasLimitError])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
