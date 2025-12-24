# Migration Guide: JSON to Supabase

This guide helps you migrate from JSON file storage to Supabase.

## Quick Answer: Steps 3 & 4

### Step 3: Integrate with Supabase Auth

1. **Apply the auth integration migration:**
   ```bash
   supabase migration up
   ```
   Or run `002_auth_integration.sql` in Supabase SQL Editor.

2. **The migration includes:**
   - Optional function to sync `auth.users` to `users` table
   - Optional trigger (commented out) for automatic syncing
   - You can uncomment the trigger if you want automatic syncing

3. **For now, you can:**
   - Keep `users` table independent (current setup)
   - Or link it to `auth.users` later when you add authentication

### Step 4: Update Your Code to Use Supabase

**Option A: Install Supabase (Required First)**
```bash
npm install @supabase/supabase-js
```

**Option B: Set Environment Variables**
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Option C: Update Your Code**

You have two data access layers:
- `lib/data.ts` - JSON file storage (current)
- `lib/data-supabase.ts` - Supabase storage (new)

**Gradual Migration (Recommended):**

1. Start by updating one API route at a time
2. Change imports from `@/lib/data` to `@/lib/data-supabase`
3. Add `await` since Supabase functions are async

Example:
```typescript
// Before (synchronous)
import { getProjects } from "@/lib/data";
const projects = getProjects();

// After (async)
import { getProjects } from "@/lib/data-supabase";
const projects = await getProjects();
```

**Full Migration:**

Replace all imports across your codebase:
```bash
# Find all files using lib/data
grep -r "from \"@/lib/data\"" app/ lib/
```

Then update each file to:
1. Import from `@/lib/data-supabase` instead
2. Make functions `async` and add `await` to data calls

## Code Changes Summary

### What Changed?

1. **New Files Created:**
   - `lib/supabase/server.ts` - Server-side Supabase client
   - `lib/supabase/client.ts` - Client-side Supabase client  
   - `lib/data-supabase.ts` - Supabase data access layer
   - `lib/types/database.ts` - Database type definitions
   - `supabase/migrations/002_auth_integration.sql` - Auth integration

2. **Updated Files:**
   - `package.json` - Added `@supabase/supabase-js` dependency

3. **No Breaking Changes:**
   - Your existing `lib/data.ts` still works
   - You can migrate gradually
   - Both can coexist during migration

### Key Differences

| Aspect | JSON (`lib/data.ts`) | Supabase (`lib/data-supabase.ts`) |
|--------|---------------------|-----------------------------------|
| Storage | Local JSON files | PostgreSQL database |
| Functions | Synchronous | Async (need `await`) |
| Performance | Fast for small data | Scales to large data |
| Multi-user | File conflicts | Concurrent safe |
| Queries | In-memory filtering | Database queries |
| Relationships | Manual joins | Foreign keys + joins |

## Testing Your Migration

1. **Test in Development:**
   ```bash
   npm run dev
   ```

2. **Verify Data:**
   - Create a project → Check Supabase dashboard
   - Create a task → Verify it appears
   - Check relationships (participants, etc.)

3. **Check for Errors:**
   - Look for async/await issues
   - Verify environment variables are set
   - Check RLS policies if you get permission errors

## Common Issues & Solutions

### "Missing Supabase environment variables"
- Add `.env.local` with required variables
- Restart dev server

### "Row Level Security policy violation"
- For development: Use `supabaseAdmin` (bypasses RLS)
- For production: Create proper RLS policies
- See `supabase/SETUP.md` for RLS examples

### "Function is not async"
- Add `async` to function signature
- Add `await` before Supabase calls

### "Cannot find module '@/lib/data-supabase'"
- Make sure file exists: `lib/data-supabase.ts`
- Check TypeScript can resolve the path

## Next Steps After Migration

1. **Set up RLS policies** - See `supabase/SETUP.md`
2. **Add authentication** - Integrate Supabase Auth
3. **Migrate existing data** - If you have JSON data to import
4. **Optimize queries** - Add indexes if needed
5. **Remove JSON code** - Once fully migrated, delete `lib/data.ts`

## Need Help?

- Check `supabase/SETUP.md` for detailed setup
- See `supabase/QUERY_EXAMPLES.md` for query patterns
- Review `supabase/README.md` for schema overview

