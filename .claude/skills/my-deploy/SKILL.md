---
name: my-deploy
description: Deploy this app to production (build, rsync to Nginx www dir, pm2 restart, git push)
disable-model-invocation: true
allowed-tools: Bash(npm *) Bash(rsync *) Bash(pm2 *) Bash(git *)
---

Deploy EasyCRM to the local Nginx/pm2 production environment:

1. Run `npm run build` from the project root (`/Users/lioneljones/DevProjects/Programming/AIProjects/easycrmlocal`)
2. Sync built files to the Nginx www directory:
   ```
   rsync -a --exclude='node_modules' --exclude='.git' \
     /Users/lioneljones/DevProjects/Programming/AIProjects/easycrmlocal/ \
     /opt/homebrew/var/www/easycrmlocal/
   ```
3. Restart the pm2 process: `pm2 restart easycrmlocal`
4. Verify it came back up: `pm2 status`
5. Push any local changes to GitHub:
   ```
   if [ -n "$(git status --porcelain)" ]; then
     git add -A
     git commit -m "ci: post-build update [skip ci]"
   fi
   git push origin main
   ```

The app will be live at http://localhost:8080 within a few seconds.
