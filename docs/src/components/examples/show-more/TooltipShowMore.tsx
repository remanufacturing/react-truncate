import { ShowMore } from '@re-dev/react-truncate'
import React, { useMemo } from 'react'
import { EW } from '@/components/examples/Widgets'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import type { Languages } from '@/i18n'

export const TooltipShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const isZh = useMemo(() => {
    return lang === 'zh'
  }, [lang])

  const content = useMemo(() => {
    return <EW.Content isZh={isZh} shorter />
  }, [isZh])

  const testIdPrefix = useMemo(() => {
    return `docs-tooltip-show-more-${lang}`
  }, [lang])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <EW.Container data-testid={testIdPrefix}>
            <ShowMore separator={isZh ? '' : ' '} more={null}>
              {content}
            </ShowMore>
          </EW.Container>
        </TooltipTrigger>

        <TooltipContent data-testid={`${testIdPrefix}-content`}>
          <div className="max-w-96">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
