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

const ExpandButton: React.FC = () => {
  return (
    <DialogTrigger asChild>
      <span>
        <span>…</span>

        <Button
          className="ml-2 cursor-pointer"
          variant="outline"
          size="icon-sm"
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

  const dialogTitle = useMemo(() => {
    return getTranslation(lang, 'example.dialogTitle')
  }, [lang])

  const content = useMemo(() => {
    return <EW.Content isZh={isZh} shorter />
  }, [isZh])

  return (
    <Dialog>
      <EW.Container>
        <ShowMore separator={isZh ? '' : ' '} more={<ExpandButton />}>
          {content}
        </ShowMore>
      </EW.Container>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="!mt-6">{content}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
