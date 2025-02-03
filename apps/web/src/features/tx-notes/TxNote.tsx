import { Tooltip, Typography, Stack } from '@mui/material'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import InfoIcon from '@/public/images/notifications/info.svg'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'

export function TxNote({ txDetails }: { txDetails: TransactionDetails | undefined }) {
  // @FIXME: update CGW types to include note
  const note = (txDetails as TransactionDetails & { note: string | null })?.note

  if (!note) return null

  const creator =
    isMultisigDetailedExecutionInfo(txDetails?.detailedExecutionInfo) && txDetails?.detailedExecutionInfo.proposer

  return (
    <div>
      <Typography variant="h5" display="flex" alignItems="center" justifyItems="center">
        Note
        <Tooltip
          title={
            <Stack direction="row" gap={1}>
              <span>By </span>
              {creator ? (
                <EthHashInfo avatarSize={20} address={creator.value} showName onlyName />
              ) : (
                <span>transaction creator</span>
              )}
            </Stack>
          }
          arrow
        >
          <Typography color="text.secondary" component="span" height="1em">
            <InfoIcon height="100%" />
          </Typography>
        </Tooltip>
      </Typography>

      <Typography p={2} mt={1} borderRadius={1} bgcolor="background.main">
        {note}
      </Typography>
    </div>
  )
}
