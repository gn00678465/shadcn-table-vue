import type { Column } from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'

interface PinningStyleOptions {
  opacity?: number
  zIndex?: number
  additionalStyles?: CSSProperties
}

export function getCommonPinningStyles<TData>({
  column,
  options = {},
  isAtLeftEdge = false,
  isAtRightEdge = false,
}: {
  column: Column<TData>
  /**
   * 額外的樣式選項
   * @default {}
   */
  options?: PinningStyleOptions
  /**
   * 是否位於最左側邊緣（滾動條在最左側）
   * @default true
   */
  isAtLeftEdge?: boolean
  /**
   * 是否位於最右側邊緣（滾動條在最右側）
   * @default false
   */
  isAtRightEdge?: boolean
}): CSSProperties {
  const {
    zIndex = 1,
    ...common
  } = options

  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn
    = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn
    = isPinned === 'right' && column.getIsFirstColumn('right')

  // 基於滾動位置的陰影效果
  let boxShadow: string | undefined

  // 當不在最左邊且有左側固定列時，顯示左側陰影
  if (isLastLeftPinnedColumn && !isAtLeftEdge) {
    boxShadow = '-4px 0 4px -4px  rgba(0, 0, 0, .18) inset'
  }
  // 當不在最右邊且有右側固定列時，顯示右側陰影
  else if (isFirstRightPinnedColumn && !isAtRightEdge) {
    boxShadow = '4px 0 4px -4px  rgba(0, 0, 0, .18) inset'
  }

  const styles: CSSProperties = {
    // 基本定位和尺寸
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),

    boxShadow,
    opacity: isPinned ? common.opacity : 1,
    zIndex: isPinned ? zIndex : 0,
  }

  // 添加任何額外樣式
  if (isPinned && common.additionalStyles) {
    Object.assign(styles, common.additionalStyles)
  }

  return styles
}
