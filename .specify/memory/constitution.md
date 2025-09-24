<!--
Sync Impact Report:
Version: 模板 → 1.0.0 (初始化)
修改的原則: 無 (新建)
新增區域: 所有核心原則和治理架構
移除區域: 無
模板需要更新: 
- ✅ spec-template.md (已檢查相容性)
- ✅ plan-template.md (已檢查相容性)  
- ✅ tasks-template.md (已檢查相容性)
後續待辦事項: 無
-->

# Shadcn Table Vue Constitution

## 核心原則

### I. Component-First 組件優先
每個功能都應該作為可重用的 Vue 組件來實作。組件必須是自包含的、可獨立測試的且有完整文件。明確的用途是必要的 - 不允許僅為組織目的而存在的組件。每個組件都必須符合 shadcn-ui 的設計原則與 Vue 3 Composition API 最佳實務。

**理由**: 確保程式碼的可重用性、可維護性和一致性，同時遵循現代 Vue 開發標準。

### II. Nuxt Layer 架構
專案必須維持作為 Nuxt Layer 的架構完整性。所有功能都應該透過標準的 Nuxt Layer API 暴露，包括 composables、components、utils 和 modules。支援多語系 (i18n) 是必要的。

**理由**: 確保其他 Nuxt 專案能夠輕鬆擴展和使用此 layer，同時維持 Nuxt 生態系統的最佳實務。

### III. TypeScript-First (不可協商)
所有程式碼必須使用 TypeScript 撰寫。型別定義必須完整且準確。任何 `any` type 的使用都必須有明確的理由和註釋。介面和型別必須匯出以供消費者使用。

**理由**: 確保型別安全、提升開發體驗和程式碼品質，減少執行時錯誤。

### IV. Data Table 功能完整性
Data Table 必須支援核心功能：排序、篩選、分頁、欄位顯示/隱藏、欄位固定、列選擇、展開/收摺。每個功能都必須透過對應的 composable 暴露，並支援伺服器端和客戶端模式。

**理由**: 提供完整的 data table 解決方案，滿足企業級應用的需求。

### V. Performance & Accessibility 效能與無障礙
所有組件必須支援 lazy loading 和虛擬滾動（適用時）。必須遵循 WCAG 2.1 AA 標準的無障礙要求。支援鍵盤導航和 screen reader。效能監控和最佳化是強制性的。

**理由**: 確保應用程式對所有使用者都能提供良好的體驗，包括身心障礙者。

## 技術約束

所有組件必須基於 Reka UI 和 Tailwind CSS 構建。使用 Tanstack Vue Table 作為核心 data table 邏輯。支援 Vue 3.3+ 和 Nuxt 3.19+。必須與 shadcn-nuxt 完全相容。使用 VueUse 提供的 utilities 來增強功能性。

所有樣式必須通過 Tailwind CSS 類別實現，支援 dark mode 和主題客製化。組件必須支援 controlled 和 uncontrolled 模式。

## 開發工作流程

所有新功能必須先建立 playground 範例來展示用法。程式碼必須通過 ESLint 檢查。提交訊息必須遵循 Conventional Commits 規範。

所有 composables 必須有完整的 JSDoc 註釋。組件的 props 和 emits 必須有詳細的 TypeScript 定義。API 設計必須一致且直觀。

## Governance

本 Constitution 優先於所有其他開發實務。所有的 PR 和 code review 都必須驗證是否符合這些原則。複雜性必須有合理的理由。

修改此 Constitution 需要：
1. 提出修改建議並說明理由  
2. 團隊討論和同意
3. 更新相關文件和模板
4. 遷移現有程式碼（如需要）

所有開發決策都必須考慮使用者體驗、可維護性和擴展性。

**Version**: 1.0.0 | **Ratified**: 2024-09-24 | **Last Amended**: 2024-09-24
