import { type TruncateProps } from '../Truncate'

export type MiddleTruncateProps = Omit<
  TruncateProps,
  'middle' | 'lines' | 'width'
>
