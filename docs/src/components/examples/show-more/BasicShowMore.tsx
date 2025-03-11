import { ShowMore } from '@re-dev/react-truncate'
import React from 'react'
import { EW } from '@/components/examples/Widgets'
import { type Languages, useLang } from '@/i18n'

export const BasicShowMore: React.FC<{
  lang: Languages
}> = ({ lang }) => {
  const { isZh } = useLang(lang)

  return (
    <EW.Container>
      <ShowMore lines={3} separator={isZh ? '' : ' '}>
        <EW.Content isZh={isZh} shorter />
      </ShowMore>
    </EW.Container>
  )
}
