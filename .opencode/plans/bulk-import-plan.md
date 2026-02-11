# Bulk Import Words Feature Plan

## Overview
Add a polished bulk import feature to allow users to import up to 300 words at once via plain text input.

## Requirements
- **Max words**: 300 per import
- **Default difficulty**: medium for all imported words
- **Duplicate handling**: Skip duplicates (keep existing)
- **Format**: Plain text only (one word per line)
- **UI/UX**: Nice, polished interface

## Implementation Plan

### 1. Store Updates (`src/store/index.ts`)
Add `addWordsBulk()` function:
- Accepts array of word objects with optional definition/example
- Enforces 300 word limit
- Skips duplicates (case-insensitive comparison)
- Returns import result stats (added, skipped, total)
- All words get "medium" difficulty by default

### 2. New Component: `BulkImportModal.tsx`
Create a modal component with:
- **Header**: Title "Bulk Import Words" with word count indicator
- **Text Area**: Large input for pasting words (one per line)
- **Live Preview**: Shows parsed word count and duplicate detection
- **Stats Display**: Shows how many will be added vs skipped
- **Progress Bar**: Visual indicator of 300 word limit
- **Action Buttons**: Import (primary) and Cancel
- **Success State**: Shows results after import

### 3. UI Integration (`src/routes/lists/$listId.tsx`)
- Add "Import Words" button next to "Add Word" button
- Use secondary/outline style to differentiate from primary action
- Open modal on click
- Show success toast after import

### 4. Styling
- Match existing dark theme (zinc color palette)
- Use existing shadcn/ui components (Dialog, Button, Textarea, Badge)
- Smooth animations and transitions
- Clear visual feedback for validation/errors

## Files to Modify
1. `src/store/index.ts` - Add bulk import function
2. `src/components/BulkImportModal.tsx` - New component (to be created)
3. `src/routes/lists/$listId.tsx` - Add import button and modal integration

## Example Usage
1. User clicks "Import Words" button
2. Modal opens with empty textarea
3. User pastes words (one per line):
   ```
   apple
   banana
   cherry
   ```
4. Live preview shows "3 words (0 duplicates)"
5. User clicks "Import 3 Words"
6. Modal shows success: "Added 3 words, skipped 0 duplicates"
7. List updates with new words (medium difficulty)

Would you like me to proceed with this implementation?