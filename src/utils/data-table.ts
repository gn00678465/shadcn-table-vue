import type { Column } from '@tanstack/vue-table'
import type { CSSProperties } from 'vue'

interface Common {
  boxShadow?: string
  opacity?: number
  zIndex?: number
  additionalStyles?: CSSProperties
}

export interface PinningStyleOptions extends Common {
  // 是否顯示邊界陰影
  withBorder?: boolean
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

  // 添加這個函數，用於計算精確的 pixel 值
  const getPrecisePixelValue = (value: number): string => {
    // 避免浮點數計算誤差，四捐五入到兩位小數
    return `${Math.round(value * 100) / 100}px`
  }

  const styles: CSSProperties = {
    // 基本定位和尺寸
    left: isPinned === 'left' ? getPrecisePixelValue(column.getStart('left')) : undefined,
    right: isPinned === 'right' ? getPrecisePixelValue(column.getAfter('right')) : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),

    // 添加硬件加速和防抖動屬性
    transform: isPinned ? 'translateZ(0)' : undefined,
    willChange: isPinned ? 'transform' : undefined,
    backfaceVisibility: isPinned ? 'hidden' : undefined,

    boxShadow: common.boxShadow ?? defaultBoxShadow,
    opacity: isPinned ? common.opacity : 1,
    zIndex: isPinned ? zIndex : 0,
  }

  // 添加任何額外樣式
  if (isPinned && common.additionalStyles) {
    Object.assign(styles, common.additionalStyles)
  }

  return styles
}
