# Cloudflare Pages Setup Guide

This guide will help you deploy your app to Cloudflare Pages with Supabase client-side integration.

## Prerequisites

1. ✅ Supabase database migrated (already done)
2. ✅ Supabase project created
3. ✅ Cloudflare Pages project connected to GitHub

## Step 1: Configure Supabase Row Level Security (RLS)

For analytics tables to accept writes from the client, you need to enable RLS and configure policies in Supabase.

### Quick Setup (Recommended):

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `scripts/enable-rls-policies.sql`
3. Click **Run** to execute

This will:
- Enable RLS on all tables
- Create policies to allow public writes to analytics tables (`conversion_events`, `tab_visits`)
- Create policies to allow public reads from data tables (`conversion_ratios`, `ingredients`, `substitution_recipes`)

### Manual Setup (Alternative):

If you prefer to set up policies manually:

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. For each table, enable RLS and create the policies as shown in `scripts/enable-rls-policies.sql`

**Note:** The policies allow public writes to analytics tables. This is acceptable for analytics data, but if you need more security, you can add rate limiting or other restrictions.

## Step 2: Get Supabase Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (this is safe to expose in client-side code)

## Step 3: Configure Cloudflare Pages

1. Go to your Cloudflare Pages project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

   - **Variable name:** `VITE_SUPABASE_URL`
   - **Value:** Your Supabase project URL (from Step 2)

   - **Variable name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon/public key (from Step 2)

4. **Important:** Make sure these are set for **Production** environment (and Preview if you want)

## Step 4: Configure Build Settings

In Cloudflare Pages dashboard → **Settings** → **Builds & deployments**:

- **Build command:** `npm run build`
- **Build output directory:** `dist/public`
- **Root directory:** (leave empty, or `/` if your repo is at root)

## Step 5: Deploy

1. Commit and push your changes to GitHub
2. Cloudflare Pages will automatically rebuild
3. Your app should now work at the Cloudflare Pages URL!

## Verification

After deployment, check:
1. ✅ App loads (no 404)
2. ✅ Conversion ratios load
3. ✅ Ingredients load
4. ✅ Analytics events are being written (check Supabase dashboard → Table Editor)

## Troubleshooting

### 404 Error
- Check that **Build output directory** is set to `dist/public`
- Verify `public/_redirects` file exists and is being copied to `dist/public`

### Environment Variables Not Working
- Make sure variable names start with `VITE_` (Vite requirement)
- Rebuild the deployment after adding variables
- Check browser console for Supabase connection errors

### Supabase Connection Errors
- Verify RLS policies are set correctly
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Cloudflare
- Check browser console for specific error messages

### Analytics Not Writing
- Check Supabase RLS policies allow INSERT operations
- Check browser console for errors
- Verify Supabase credentials are correct

