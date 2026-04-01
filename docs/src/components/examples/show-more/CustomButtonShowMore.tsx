import {
  ShowMore,
  type ShowMoreRef,
  type ShowMoreToggleLinesFn,
} from '@re-dev/react-truncate'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useMemo, useRef } from 'react'
import { EW } from '@/components/examples/Widgets'
import { Button } from '@/components/ui'
import { type Languages, useLang } from '@/i18n'

const IconButton: React.FC<{
  type: 'more' | 'less'
  isZh: boolean
  onClick: ShowMoreToggleLinesFn
}> = ({ type, isZh, onClick }) => {
  const Icon = useMemo(() => {
    if (type === 'less') {
      return ChevronUp
    }
    return ChevronDown
  }, [type])

  const prefix = useMemo(() => {
    return type === 'more' ? <span>…</span> : null
  }, [type])

  const label = useMemo(() => {
    if (isZh) {
      return type === 'more' ? '展开' : '收起'
    }

    return type === 'more' ? 'Show More' : 'Show Less'
  }, [isZh, type])

  return (
    <>
      {prefix}

      <Button
        className="ml-2 cursor-pointer"
        variant="outline"
        size="icon-sm"
        onClick={onClick}
        aria-label={label}
        title={label}
      >
        <Icon className="size-4" />
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
    <EW.Container data-testid={`docs-custom-show-more-${lang}`}>
      <ShowMore
        ref={ref}
        lines={3}
        separator={isZh ? '' : ' '}
        more={<IconButton type="more" isZh={isZh} onClick={toggleLines} />}
        less={<IconButton type="less" isZh={isZh} onClick={toggleLines} />}
      >
        <EW.Content isZh={isZh} shorter />
      </ShowMore>
    </EW.Container>
  )
}
