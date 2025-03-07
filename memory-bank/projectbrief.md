# Project Brief: shadcn-table-vue

## Overview
`shadcn-table-vue` is a Vue 3 table component library built on top of TanStack Table (formerly React Table) and shadcn UI design system. It provides a comprehensive set of table functionalities with a modern design aesthetic.

## Core Requirements
1. Provide a rich set of table features:
   - Pagination
   - Row selection
   - Column visibility toggle
   - Column pinning
   - Row expansion
   - Loading states
   - Sorting (planned)
   - Filtering (planned)

2. Vue 3 Composition API:
   - Utilize Vue 3's composables pattern
   - Provide type safety with TypeScript
   - Support reactive data sources

3. Theming and Styling:
   - Follow shadcn UI design system
   - Provide customization options
   - Support both light and dark themes

4. Performance:
   - Efficient rendering for large datasets
   - Support for both client-side and server-side data processing

## Key Goals
- Create a versatile, reusable table component for Vue 3 applications
- Provide an intuitive API that follows Vue 3 conventions
- Ensure high performance and accessibility
- Build a component that works well with both simple and complex data structures
- Enable persistence of user preferences (column visibility, pinning, etc.)

## Current Focus
Recently, we've been enhancing the row selection functionality to provide better metadata about selection actions, particularly to distinguish between individual row selection and bulk actions (select all/deselect all), even when traversing between pagination states.
