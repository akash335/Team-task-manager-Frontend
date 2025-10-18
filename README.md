# Team Task Manager (Auth + Assignments)

## Run
```bash
npm i
node server.js        # then open http://localhost:3000
# or: npm run start
```
Optional `.env`:
```
JWT_SECRET=change-me
PORT=3000
```
If `better-sqlite3` fails to install on Node 24, use LTS:
```bash
nvm install 22 && nvm use 22
npm rebuild better-sqlite3
```

- First sign up, then login.
- All users share the same task board; assign tasks to teammates.
