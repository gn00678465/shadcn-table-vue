import type { Column } from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'

interface Common {
  boxShadow?: string
  opacity?: number
  zIndex?: number
  background?: string
  additionalStyles?: CSSProperties
}

export interface PinningStyleOptions extends Common {
  // 是否顯示邊界陰影
  withBorder?: boolean
  isSelected?: boolean
}

export function getCommonPinningStyles<TData>({
  column,
  options = {},
}: {
  column: Column<TData>
  /**
   * Show box shadow between pinned and scrollable columns.
   * @default false
   */
  options?: PinningStyleOptions
}): CSSProperties {
  const {
    withBorder = false,
    zIndex = 1,
    ...common
  } = options

  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn
    = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn
    = isPinned === 'right' && column.getIsFirstColumn('right')

  // 預設陰影效果
  const defaultBoxShadow = withBorder
    ? isLastLeftPinnedColumn
      ? '-4px 0 4px -4px hsl(var(--border)) inset'
      : isFirstRightPinnedColumn
        ? '4px 0 4px -4px hsl(var(--border)) inset'
        : undefined
    : undefined

  const styles: CSSProperties = {
    // 基本定位和尺寸
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),

    boxShadow: common.boxShadow ?? defaultBoxShadow,
    opacity: isPinned ? common.opacity : 1,
    background: isPinned ? common.background : '',
    zIndex: isPinned ? zIndex : 0,
  }

  // 添加任何額外樣式
  if (isPinned && common.additionalStyles) {
    Object.assign(styles, common.additionalStyles)
  }

  return styles
}
