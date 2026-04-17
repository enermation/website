declare module '@chenglou/pretext' {
  export type PreparedText = unknown

  export function prepare(
    text: string,
    font: string,
    options?: {
      whiteSpace?: 'normal' | 'pre-wrap'
      wordBreak?: 'normal' | 'keep-all'
    }
  ): PreparedText

  export function layout(
    prepared: PreparedText,
    maxWidth: number,
    lineHeight: number
  ): { height: number; lineCount: number }
}
