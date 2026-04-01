import { ShowMore } from '@re-dev/react-truncate'
import { Expand } from 'lucide-react'
import React, { useMemo } from 'react'
import { EW } from '@/components/examples/Widgets'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { type Languages, getTranslation, useLang } from '@/i18n'

const ExpandButton: React.FC<{
  isZh: boolean
  testId: string
}> = ({ isZh, testId }) => {
  const label = useMemo(() => {
    return isZh ? '展开完整内容' : 'Expand full content'
  }, [isZh])

  return (
    <DialogTrigger asChild>
      <span>
        <span>…</span>

        <Button
          className="ml-2 cursor-pointer"
          variant="outline"
          size="icon-sm"
          data-testid={testId}
          aria-label={label}
          title={label}
        >
          <Expand className="size-4" />
        </Button>
      </span>
    </DialogTrigger>
  )
}

export const DialogShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)
  const testIdPrefix = `docs-dialog-show-more-${lang}`

  const dialogTitle = useMemo(() => {
    return getTranslation(lang, 'example.dialogTitle')
  }, [lang])

  const content = useMemo(() => {
    return <EW.Content isZh={isZh} shorter />
  }, [isZh])

  return (
    <Dialog>
      <EW.Container data-testid={testIdPrefix}>
        <ShowMore
          separator={isZh ? '' : ' '}
          more={<ExpandButton isZh={isZh} testId={`${testIdPrefix}-trigger`} />}
        >
          {content}
        </ShowMore>
      </EW.Container>

      <DialogContent data-testid={`${testIdPrefix}-content`}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="!mt-6">{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
