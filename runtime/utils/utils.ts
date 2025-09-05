import type { CSSProperties } from 'vue'

/**
 * 從 CSSProperties 物件中排除指定的屬性
 *
 * @param obj 原始的 CSS 屬性物件
 * @param keys 要排除的屬性名稱陣列
 * @returns 新的 CSSProperties 物件，不包含指定的屬性
 */
export function omit(obj: CSSProperties, keys: Array<keyof CSSProperties>): CSSProperties {
  const result = { ...obj } as Record<string, any>

  for (const key of keys) {
    delete result[key]
  }

  return result as CSSProperties
}

/**
 * 從 CSSProperties 物件中選取指定的屬性
 *
 * @param obj 原始的 CSS 屬性物件
 * @param keys 要選取的屬性名稱陣列
 * @returns 新的 CSSProperties 物件，只包含指定的屬性
 */
export function pick(obj: CSSProperties, keys: Array<keyof CSSProperties>): CSSProperties {
  const result = {} as Record<string, any>

  for (const key of keys) {
    if (key in obj) {
      // 使用中間變數和型別轉換解決型別問題
      const objAny = obj as Record<string, any>
      result[key] = objAny[key]
    }
  }

  return result as CSSProperties
}
