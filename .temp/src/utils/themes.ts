/**
 * 將駝峰命名的屬性名轉換為帶連字符的 CSS 變數名
 * 例如：tdColor → --td-color
 */
export function toCssVarName(camelCase: string): string {
  return `--${camelCase.replace(/([A-Z])/g, '-$1').toLowerCase()}`
}
