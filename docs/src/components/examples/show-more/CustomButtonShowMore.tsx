import React, { useMemo, useRef } from 'react'
import {
  ShowMore,
  type ShowMoreRef,
  type ShowMoreToggleLinesFn,
} from '@re-dev/react-truncate'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui'
import { EW } from '@/components/examples/Widgets'
import { useLang, type Languages } from '@/i18n'

const IconButton: React.FC<{
  type: 'more' | 'less'
  onClick: ShowMoreToggleLinesFn
}> = ({ type, onClick }) => {
  const Icon = useMemo(() => {
    if (type === 'less') {
      return ChevronUp
    }
    return ChevronDown
  }, [type])

  const prefix = useMemo(() => {
    return type === 'more' ? <span>…</span> : null
  }, [type])

  return (
    <>
      {prefix}

      <Button
        className="ml-2 cursor-pointer"
        variant="outline"
        size="icon-sm"
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </>
  )
}

export const CustomButtonShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)

  const ref = useRef<ShowMoreRef>(null)

  const toggleLines: ShowMoreToggleLinesFn = (e) => {
    ref.current?.toggleLines(e)
  }

  return (
    <EW.Container>
      <ShowMore
        ref={ref}
        lines={3}
        separator={isZh ? '' : ' '}
        more={<IconButton type="more" onClick={toggleLines} />}
        less={<IconButton type="less" onClick={toggleLines} />}
      >
        <EW.Content isZh={isZh} shorter />
      </ShowMore>
    </EW.Container>
  )
}
