# Supabase Setup Guide

This guide walks you through setting up Supabase for your project.

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (this is your `SUPABASE_SERVICE_ROLE_KEY`) - Keep this secret!

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** 
- Never commit `.env.local` to git (it should be in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS - keep it secret!

## Step 4: Apply Migrations

You've already applied the initial schema. Now apply the auth integration migration:

```bash
supabase migration up
```

Or manually run `002_auth_integration.sql` in the Supabase SQL Editor.

## Step 5: Set Up Row Level Security (RLS) Policies

After enabling RLS on all tables, you need to create policies. Here are some example policies:

### Basic RLS Policies

```sql
-- Projects: Users can view projects they participate in
CREATE POLICY "Users can view projects they participate in"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_participants
      WHERE user_id = auth.uid()
    )
  );

-- Projects: Users can create projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (true); -- Or add your own logic

-- Projects: Users can update projects they participate in
CREATE POLICY "Users can update projects they participate in"
  ON projects FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM project_participants
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

### Quick RLS Setup Script

For development, you might want to temporarily disable RLS or allow all operations:

```sql
-- ⚠️ WARNING: Only for development!
-- Allow all operations (bypass RLS)
CREATE POLICY "Allow all operations" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON areas FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tasks FOR ALL USING (true);
-- ... etc for other tables
```

**For production**, create proper policies based on your access control requirements.

## Step 6: Migrate Existing Data (Optional)

If you have existing JSON data you want to migrate:

1. Create a migration script that reads from your JSON files
2. Insert data into Supabase using the `supabaseAdmin` client
3. See `supabase/migrations/003_migrate_data.sql` (create this if needed)

## Step 7: Update Your Code

### Option A: Gradual Migration (Recommended)

Keep both `lib/data.ts` (JSON) and `lib/data-supabase.ts` (Supabase) and switch gradually:

```typescript
// In your API routes, you can conditionally use either:
import * as data from "@/lib/data"; // JSON
// or
import * as data from "@/lib/data-supabase"; // Supabase
```

### Option B: Full Migration

Replace all imports of `@/lib/data` with `@/lib/data-supabase`:

```typescript
// Before
import { getProjects } from "@/lib/data";

// After
import { getProjects } from "@/lib/data-supabase";
```

**Note:** The Supabase functions are async, so you'll need to `await` them:

```typescript
// Before (synchronous)
const projects = getProjects();

// After (async)
const projects = await getProjects();
```

## Step 8: Test Your Setup

1. Start your dev server: `npm run dev`
2. Try creating a project, task, etc.
3. Check Supabase dashboard to see if data appears
4. Verify RLS policies are working correctly

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has all required variables
- Restart your dev server after adding env variables

### "Row Level Security policy violation"
- Check your RLS policies in Supabase dashboard
- For development, you can temporarily use `supabaseAdmin` which bypasses RLS

### "Foreign key constraint violation"
- Make sure related records exist (e.g., user exists before creating project participant)
- Check that IDs match the UUID format

## Next Steps

1. **Set up authentication** - Integrate Supabase Auth for user sign-up/login
2. **Create proper RLS policies** - Based on your access control needs
3. **Add indexes** - If you notice slow queries, add indexes on frequently queried columns
4. **Set up backups** - Configure Supabase backups for production

