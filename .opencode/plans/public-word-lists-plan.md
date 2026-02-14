# Public Word Lists Feature Plan

## Overview
Add public word lists using a single table with `isPublic` and `isSystem` flags. Lists created by admin via the Convex dashboard will be marked as `isSystem: true` and `isPublic: true`, making them visible to all users including non-authenticated users.

## Current State
- **Schema**: Uses `wordLists` table with `userId` field for ownership
- **Access Control**: All current queries use `authQuery` (requires authentication)
- **Frontend**: Lists page at `/lists` is authenticated-only

## Schema Changes

**File**: `convex/functions/schema.ts`

Update `wordLists` table:
```typescript
wordLists: defineEnt({
  name: v.string(),
  description: v.optional(v.string()),
  totalPracticeTime: v.number(),
  isPublic: v.boolean(),      // NEW: Visible to everyone
  isSystem: v.boolean(),      // NEW: Created by admin
  createdBy: v.id("user"),    // NEW: Who created it
  category: v.optional(v.string()), // NEW: "GRE", "SAT", "TOEFL", "General", "Business"
  difficulty: v.optional(v.string()), // NEW: "easy", "medium", "hard"
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .deletion("soft")
  .edge("user", { to: "user", field: "userId" })
  .edges("words", { to: "words", ref: "listId", deletion: "soft" }),
```

**Field Descriptions**:
- `isPublic`: Controls visibility (true = anyone can view/practice)
- `isSystem`: Marks admin-created lists via dashboard (true = system list)
- `createdBy`: Tracks ownership for both user and system lists
- `category`: Predefined categories for organization
- `difficulty`: Difficulty level for filtering

**Rationale**:
- Single table for all lists (simpler schema)
- `isSystem` distinguishes admin lists from user lists
- `isPublic` controls visibility independently
- Words remain in single table (no duplication)

## Backend Changes

**File**: `convex/functions/wordLists.ts`

### New Queries

#### 1. `getPublicLists` (publicQuery)
Returns all active public system lists.

**Input**: None  
**Output**: Array of public lists with word count  
**Auth**: Not required  
**Query**:
```typescript
const lists = await ctx
  .table("wordLists")
  .filter((q) => q.and(
    q.eq(q.field("isPublic"), true),
    q.eq(q.field("isSystem"), true),
    q.eq(q.field("deletionTime"), undefined)
  ))
  .order("desc");
```

#### 2. `getPublicListById` (publicQuery)
Returns single public list with all words.

**Input**: `{ listId: Id<"wordLists"> }`  
**Output**: List with words array  
**Auth**: Not required  
**Validation**: Check `isPublic === true`

### Modified Queries

#### 3. `getUserLists` (authQuery) - MODIFIED
**Change**: Only return user's private lists (exclude system lists).

**Query**:
```typescript
const lists = await ctx
  .table("wordLists")
  .filter((q) => q.and(
    q.eq(q.field("isSystem"), false),
    q.eq(q.field("createdBy"), ctx.userId),
    q.eq(q.field("deletionTime"), undefined)
  ))
  .order("desc");
```

### New Admin Mutations

#### 4. `createPublicList` (authMutation with admin check)
Creates a new public system list.

**Input**:
```typescript
{
  name: string,
  description?: string,
  category?: "GRE" | "SAT" | "TOEFL" | "General" | "Business",
  difficulty?: "easy" | "medium" | "hard"
}
```

**Output**: `{ id: Id<"wordLists"> }`

**Logic**:
- Verify admin role
- Insert with `isPublic: true, isSystem: true, createdBy: ctx.userId`

#### 5. `updatePublicList` (authMutation with admin check)
Updates public list metadata.

**Input**:
```typescript
{
  listId: Id<"wordLists">,
  name?: string,
  description?: string,
  category?: string,
  difficulty?: string,
  isPublic?: boolean
}
```

**Validation**:
- Verify admin role
- Check `isSystem === true`
- List exists and not deleted

#### 6. `addWordsToPublicList` (authMutation with admin check)
Bulk add words to public list.

**Input**:
```typescript
{
  listId: Id<"wordLists">,
  words: string[]  // Array of words to add
}
```

**Validation**:
- Verify admin role
- Check `isSystem === true`
- Insert words with `listId`

#### 7. `removeWordFromPublicList` (authMutation with admin check)
Remove single word from public list.

**Input**: `{ wordId: Id<"words"> }`

**Validation**:
- Verify admin role
- Check word belongs to system list

#### 8. `deletePublicList` (authMutation with admin check)
Soft delete public list and all its words.

**Input**: `{ listId: Id<"wordLists"> }`

**Validation**:
- Verify admin role
- Check `isSystem === true`
- Soft delete cascades to words

## Frontend Changes

### New Pages

#### Route: `/discover`
Public lists discovery page - visible to all users.

**Features**:
- Grid view of all public system lists
- Display: name, description, category, difficulty, word count
- Click card to view list details
- "Practice" button (redirects to auth if not logged in)
- Loading skeletons

**Components**:
- `PublicListCard` - Individual list display
- `PublicListsGrid` - Grid layout
- `DiscoverPage` - Main page component

#### Route: `/discover/$listId`
Public list detail page.

**Features**:
- List metadata (name, description, category, difficulty)
- All words in the list
- Word count
- "Practice This List" button
- Back to discover link

**Note**: Practice requires authentication (redirect to `/auth`)

### Modified Pages

#### Route: `/lists` (existing)
**Changes**:
- Now shows ONLY user's private lists (`isSystem: false`)
- Add empty state message for new users
- No public lists shown here anymore

#### Component: `Header.tsx`
**Changes**:
- Add "Discover" link between "Home" and "Lists"
- Visible to ALL users (authenticated or not)
- Active state styling

## Admin Workflow (Convex Dashboard)

### 1. Create Public List
```javascript
// In Convex dashboard mutations panel
await ctx.table("wordLists").insert({
  name: "GRE High Frequency Words",
  description: "Most common words appearing on the GRE",
  isPublic: true,
  isSystem: true,
  createdBy: adminUserId,  // Your user ID from users table
  category: "GRE",
  difficulty: "hard",
  totalPracticeTime: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### 2. Add Words to List
```javascript
// Add words one by one or in bulk
const words = ["abate", "aberrant", "abeyance", "abhor", "abjure"];

for (const word of words) {
  await ctx.table("words").insert({
    word: word,
    listId: publicListId,
    difficulty: "hard",
    correctCount: 0,
    incorrectCount: 0,
    streak: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
```

### 3. Update List
```javascript
// Toggle visibility or update metadata
await list.patch({
  isPublic: false,  // Hide from public
  updatedAt: Date.now(),
});
```

### 4. Delete List
```javascript
// Soft delete (cascades to words)
await list.delete();
```

## Query Key Strategy

```typescript
// Public lists - cached longer (rarely change)
["wordLists", "getPublicLists"]  // 5 min stale time
["wordLists", "getPublicListById", { listId }]  // 5 min stale time

// User lists - existing
["wordLists", "getUserLists"]

// Admin mutations invalidate public queries
// onSuccess: invalidateQueries(["wordLists", "getPublicLists"])
```

## Categories

Predefined categories for consistency:
- `"GRE"` - GRE vocabulary
- `"SAT"` - SAT vocabulary
- `"TOEFL"` - TOEFL vocabulary
- `"General"` - General vocabulary
- `"Business"` - Business English

## Difficulty Levels

- `"easy"` - Common words
- `"medium"` - Intermediate vocabulary
- `"hard"` - Advanced vocabulary

## Implementation Order

1. **Schema Migration** (5 min)
   - Add `isPublic`, `isSystem`, `createdBy`, `category`, `difficulty` fields

2. **Backend Queries** (20 min)
   - Create `getPublicLists` query
   - Create `getPublicListById` query
   - Modify `getUserLists` to exclude system lists

3. **Admin Mutations** (15 min)
   - Create `createPublicList`
   - Create `updatePublicList`
   - Create `addWordsToPublicList`
   - Create `deletePublicList`

4. **Discover Page** (25 min)
   - Create `/discover` route
   - Build `PublicListCard` component
   - Implement grid layout

5. **Public List Detail** (15 min)
   - Create `/discover/$listId` route
   - Display list with words
   - Add practice button

6. **Header Navigation** (5 min)
   - Add "Discover" link
   - Show for all users

7. **Update Lists Page** (10 min)
   - Ensure only private lists shown
   - Update empty state

8. **Testing** (15 min)
   - Test public access (no auth)
   - Test admin mutations
   - Test practice flow

**Total Estimated Time**: ~1.5 hours

## Future Enhancements (Post-MVP)

Planned features for future releases:

- [ ] **Copy/Fork**: Users can copy public list to their own lists
- [ ] **Favorites**: Users can favorite public lists
- [ ] **Ratings**: Star ratings for public lists
- [ ] **Search/Filter**: Search by name, filter by category/difficulty
- [ ] **Sorting**: Sort by popularity, newest, alphabetical
- [ ] **Word Metadata**: Add definitions, examples, pronunciation
- [ ] **Usage Analytics**: Track most practiced lists
- [ ] **Featured Lists**: Highlight specific lists on discover page
- [ ] **Categories Page**: Browse lists by category
- [ ] **User Public Lists**: Allow users to make their lists public

## Security Considerations

1. **Admin Verification**: Check admin role in all admin mutations
2. **Public Read Only**: Public queries cannot modify data
3. **No User Data Leak**: Public lists don't expose user information
4. **Soft Delete**: Public lists can be disabled without data loss

## Performance Considerations

1. **Small Dataset**: < 100 public lists expected (no pagination needed)
2. **Caching**: Long stale time for public lists (rarely change)
3. **Indexes**: Add index on `isPublic + isSystem` for fast queries
4. **Word Count**: Compute at query time or cache in list document

## Open Questions

1. **Admin Check**: How to identify admin users?
   - Option A: Hardcode admin email(s) in mutation
   - Option B: Add `isAdmin` field to user table
   - **Decision**: Option A for MVP (simpler)

2. **Word Count**: Compute dynamically or store in list?
   - Dynamic: Accurate but slower
   - Stored: Faster but needs updating
   - **Decision**: Dynamic for MVP (small dataset)

3. **Practice Flow**: Allow practice without auth?
   - Option A: Require auth (redirect to login)
   - Option B: Allow guest practice
   - **Decision**: Option A (simpler, tracks progress)

---

**Ready for Implementation**: This plan provides a complete roadmap for adding public word lists with proper separation between user and system lists while maintaining a simple single-table schema.
