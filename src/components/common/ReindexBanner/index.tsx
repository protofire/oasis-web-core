import { Button, Grid, Typography } from '@mui/material'
import { useCallback } from 'react'
import type { ReactElement } from 'react'

import { CustomTooltip } from '@/components/common/CustomTooltip'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import useWallet from '@/hooks/wallets/useWallet'
import useDebounce from '@/hooks/useDebounce'
import css from './styles.module.css'

const DISMISS_REINDEX_BANNER_KEY = 'dismissReindexBanner'
const BANNER_DELAY = 2000

const useDismissReindexBanner = () => {
  const { safe } = useSafeInfo()

  const [dismissedBannerPerChain = {}, setDismissedBannerPerChain] = useLocalStorage<{
    [chainId: string]: { [safeAddress: string]: boolean }
  }>(DISMISS_REINDEX_BANNER_KEY)

  const dismissReindexBanner = (chainId: string) => {
    setDismissedBannerPerChain((prev) => ({
      ...prev,
      [chainId]: {
        ...dismissedBannerPerChain[chainId],
        [safe.address.value]: true,
      },
    }))
  }

  const isReindexBannerDismissed = !!dismissedBannerPerChain[safe.chainId]?.[safe.address.value]

  return {
    dismissReindexBanner,
    isReindexBannerDismissed,
  }
}

export const ReindexBanner = ({ children }: { children?: ReactElement }): ReactElement => {
  const isReindexBannerEnabled = useHasFeature(FEATURES.REINDEX_BANNER)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const { dismissReindexBanner, isReindexBannerDismissed } = useDismissReindexBanner()

  const shouldShowBanner = useDebounce(isReindexBannerEnabled && !isReindexBannerDismissed && !!wallet, BANNER_DELAY)

  const dismissBanner = useCallback(() => {
    dismissReindexBanner(safe.chainId)
  }, [dismissReindexBanner, safe.chainId])

  const onDismiss = () => {
    dismissBanner()
  }

  if (!shouldShowBanner || isReindexBannerDismissed) {
    return children ?? <></>
  }

  return (
    <>
      <CustomTooltip
        className={css.banner}
        title={
          <Grid container className={css.container}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={700}>
                Important Notice: Reindexing Safe and Transactions
              </Typography>
              <Typography mt={1} mb={1.5} variant="body2">
                Attention: Due to a necessary reindexing process for Safes and their associated transactions, some users
                might experience temporary issues with the user interface (UI). This process is crucial for ensuring the
                accuracy and security of your transaction data. We appreciate your understanding and patience as we work
                to resolve these issues promptly. Please contact support if you encounter any persistent problems.
              </Typography>
              <div className={css.buttons}>
                <Button variant="outlined" size="small" className={css.button} onClick={onDismiss}>
                  Close
                </Button>
              </div>
            </Grid>
          </Grid>
        }
        open
      >
        <span>{children}</span>
      </CustomTooltip>
    </>
  )
}
