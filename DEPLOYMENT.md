# Deploying this repo to GitHub

This extension's code is already committed locally with full history. You
just need to create the GitHub repo and push it there. Two ways to do it —
pick whichever you're comfortable with.

## Option A — Command line (fastest if you already use git)

1. Go to https://github.com/new and create a **new, empty** repository.
   - Name it something like `antonys-garage-warehouse`.
   - **Don't** check "Add a README", "Add .gitignore", or "Choose a
     license" — this repo already has all three. Checking those creates
     files on GitHub that will conflict with the ones you're about to push.
   - Keep it Public (so friends can see/download it) or Private (if you'd
     rather share access individually) — your call.
2. GitHub will show you a remote URL after creating it, either:
   - HTTPS: `https://github.com/<your-username>/antonys-garage-warehouse.git`
   - SSH: `git@github.com:<your-username>/antonys-garage-warehouse.git`
3. In a terminal, inside this project folder, run:
   ```bash
   git remote add origin <the-URL-from-step-2>
   git push -u origin main
   ```
   If it asks you to log in, use a GitHub Personal Access Token as the
   password (GitHub stopped accepting plain account passwords for git over
   HTTPS) — create one at https://github.com/settings/tokens if you don't
   have one, with the `repo` scope.
4. Refresh the GitHub page — your code is live.

## Option B — GitHub Desktop (no command line)

1. Install [GitHub Desktop](https://desktop.github.com/) and sign in.
2. **File → Add local repository** → select this project folder.
3. Click **Publish repository** in the top bar. Choose public/private, then
   Publish.

That's it — same result as Option A.

## Cutting a proper "Release" (recommended)

Instead of only pointing friends at "Download ZIP" on the code page, a
**Release** gives them a clean, versioned download and is what most GitHub
projects use:

1. On your repo's GitHub page, click **Releases** (right sidebar) →
   **Create a new release**.
2. Tag: `v1.0.0`. Title: `Antony's Garage Warehouse v1.0.0`.
3. In the description, summarize what's new (or paste the feature list from
   the README).
4. Drag in the packaged `.zip` of the extension folder as a release asset
   (build one with `zip -r antonys-garage-warehouse-v1.0.0.zip .` from
   inside the project folder, excluding `.git`).
5. Click **Publish release**.

Now your README can link directly to
`https://github.com/<you>/antonys-garage-warehouse/releases/latest` and
friends always land on the newest packaged version instead of raw source.

## When you update the code later

```bash
git add -A
git commit -m "describe what changed"
git push
```
Friends who cloned the repo just run `git pull` to get updates. Friends who
downloaded a zip need to download the new one (or a new Release).
