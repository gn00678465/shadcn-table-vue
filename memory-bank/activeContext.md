# Active Context: shadcn-table-vue

## Current Development Focus
We are currently working on two key improvements to the table component:

1. Enhancing the row selection functionality in the `useTableRowSelection` composable to provide better metadata about selection actions. The primary goal is to correctly identify different selection actions (individual selection vs. bulk actions) even when paginating through the table.

2. Fixing UI issues that affect the table experience:
   - Resolving horizontal scroll jittering for pinned elements
   - Ensuring proper centering of checkboxes in selection columns

## Recent Changes
1. Enhanced the `useTableRowSelection` composable with a metadata system that tracks:
   - Selection action type: 'check', 'uncheck', 'checkAll', 'uncheckAll'
   - The affected row data for individual selections
   - The empty `undefined` row value for bulk actions

2. Fixed horizontal scroll jittering for pinned elements:
   - Optimized scroll synchronization using `requestAnimationFrame`
   - Implemented precise pixel value calculations to avoid floating point errors
   - Added hardware acceleration to pinned elements using CSS transforms
   - Added stability-enhancing CSS rules to prevent visual jitter

3. Improved checkbox centering in selection columns:
   - Added comprehensive detection of checkbox elements in table cells
   - Implemented flexbox-based centering for selection cells
   - Added explicit props to mark selection columns (isSelectionCell/isSelectionHeader)
   - Ensured cross-browser compatibility with multiple selector patterns

4. Implemented a sophisticated behavior detection system:
   - Added `analyzeUpdater` function to detect user intent from update patterns
   - Implemented a caching system to maintain selected row data across pagination
   - Added logic to correctly identify bulk actions vs. individual selections

5. Fixed issues with row selection behavior:
   - Corrected action type detection when switching between pages
   - Fixed issues with maintaining selected rows when paginating
   - Ensured row data is correctly included in callbacks

## Design Decisions

### Row Selection Metadata
We've decided to include a `meta` parameter in the `onUpdateCheckedRowKeys` callback with the following structure:
```typescript
interface RowSelectionMeta<TData> {
  row: TData | undefined;
  action: 'check' | 'uncheck' | 'checkAll' | 'uncheckAll';
}
```

This allows consuming components to understand the nature of the selection change:
- For individual row selection/deselection: `row` contains the data and `action` is 'check' or 'uncheck'
- For bulk operations: `row` is `undefined` and `action` is 'checkAll' or 'uncheckAll'

### Selection Behavior Detection
We're using a combination of update pattern analysis and state comparison to accurately detect user intent:
- Direct analysis of updater functions to determine if it's a bulk operation
- Tracking of added/removed keys to identify individual changes
- Custom detection logic for special cases (e.g., selecting most rows = checkAll)

### Data Caching Strategy
A Map-based cache stores the complete data for selected rows, enabling:
- Data retrieval even when rows aren't in the current page
- Correct metadata generation for deselection operations
- Consistent data availability across all table states

## Current Challenges

1. **Behavior Detection Accuracy**: Ensuring accurate detection of bulk vs. individual selection in edge cases
2. **Callback Integration**: Making sure the metadata system integrates well with existing callback patterns
3. **Cache Synchronization**: Keeping the row data cache in sync with external data changes

## Next Steps

1. Complete testing of the enhanced row selection functionality across various scenarios
2. Update documentation to reflect the new metadata capabilities
3. Consider similar metadata patterns for other interactive features (sorting, filtering)
4. Explore performance optimizations for large datasets with many selected rows
