# Deployment Guide for Render

## Prerequisites
1. Create a Render account at https://render.com
2. Create a PostgreSQL database on Render
3. Have your GitHub repository connected to Render

## Step-by-Step Deployment

### 1. Create PostgreSQL Database
1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name it `wendu-db`
4. Choose a region close to your users
5. Select Free tier (or paid if needed)
6. Click "Create Database"
7. Copy the "Internal Database URL" (starts with `postgresql://`)

### 2. Create Web Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `wendu-backend`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if in monorepo)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

### 3. Add Environment Variables
In the "Environment" section, add:

```
DATABASE_URL=<your-internal-database-url-from-step-1>
JWT_SECRET=<generate-a-secure-random-string>
NODE_ENV=production
FRONTEND_URL=<your-frontend-url>
PORT=<leave-empty-render-sets-this>
```

To generate a secure JWT_SECRET, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies
   - Generate Prisma client
   - Compile TypeScript
   - Run database migrations
   - Start the server

### 5. Verify Deployment
Once deployed, test your API:
```bash
curl https://your-service-name.onrender.com/api/auth/health
```

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify `tsconfig.json` is correct
- Check build logs for specific errors

### Database Connection Issues
- Verify DATABASE_URL is correct
- Use "Internal Database URL" not "External"
- Ensure database is in same region as web service

### TypeScript Compilation Errors
- Run `npm run build` locally first
- Fix any TypeScript errors before deploying

### Migration Issues
- Check Prisma schema is correct
- Ensure migrations are committed to git
- Use `prisma migrate deploy` not `prisma migrate dev` in production

## Auto-Deploy
Render automatically deploys when you push to your main branch.

## Monitoring
- View logs in Render Dashboard → Your Service → Logs
- Set up alerts for downtime
- Monitor database usage

## Scaling
- Upgrade to paid plan for:
  - No cold starts
  - More memory/CPU
  - Multiple instances
  - Better database performance
