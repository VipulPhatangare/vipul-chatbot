# Deployment Guide for Render

## 🚀 Deploy to Render

### Step 1: Prepare Your Repository

Make sure all your changes are committed and pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `VipulPhatangare/vipul-chatbot`
4. Configure the service:
   - **Name**: `vipul-chatbot` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or your preferred plan)

### Step 3: Set Environment Variables

⚠️ **CRITICAL**: Add these environment variables in Render:

1. In your Render service dashboard, go to **"Environment"** tab
2. Add the following variables:

```
MONGODB_URI=mongodb+srv://synthomind:kEB5OOanYGOlyL9L@cluster.4kercf5.mongodb.net/vipul-bot?retryWrites=true&w=majority&appName=Cluster

N8N_WEBHOOK_URL=https://n8n.srv1162962.hstgr.cloud/webhook-test/72068513-7580-4d03-a068-8a2b6692f306

PORT=10000

NODE_ENV=production

BOT_NAME=Vipul's Assistant
```

**Important Notes:**
- `PORT` is usually set automatically by Render to `10000`, but you can verify this
- Make sure there are no extra spaces or quotes around the values
- Click **"Save Changes"** after adding each variable

### Step 4: Deploy

1. Click **"Create Web Service"** or **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the deployment logs for any errors
3. Wait for the build to complete (usually 2-5 minutes)

### Step 5: Verify Deployment

Once deployed, your app will be available at:
```
https://your-service-name.onrender.com
```

Test these endpoints:
- **Main App**: `https://your-service-name.onrender.com/`
- **Health Check**: `https://your-service-name.onrender.com/api/health`

The health check should return:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "webhook": "configured",
  "environment": {
    "nodeVersion": "v18.x.x",
    "platform": "linux",
    "port": 10000
  },
  "timestamp": "2025-12-04T..."
}
```

## 🔍 Troubleshooting Common Issues

### Issue 1: 500 Error on `/api/chat`

**Causes:**
- Environment variables not set correctly
- MongoDB connection failed
- n8n webhook URL is wrong or unreachable

**Solution:**
1. Check Render logs: Service → **"Logs"** tab
2. Verify all environment variables are set correctly
3. Test MongoDB connection string separately
4. Test n8n webhook with curl or Postman

### Issue 2: MongoDB Connection Failed

**Error message:** `MongoDB connection error`

**Solution:**
1. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Check if your MongoDB URI includes the database name
3. Ensure password doesn't contain special characters that need URL encoding

**Steps to check MongoDB Atlas:**
- Go to MongoDB Atlas → **Network Access**
- Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
- This is necessary because Render's IP addresses change

### Issue 3: n8n Webhook Not Responding

**Error message:** `Unable to reach webhook`

**Solution:**
1. Verify your n8n workflow is **activated**
2. Test webhook directly:
   ```bash
   curl -X POST https://your-n8n-url/webhook-test/your-id \
     -H "Content-Type: application/json" \
     -d '{"message":"test","sessionId":"test"}'
   ```
3. Check n8n workflow executions for errors

### Issue 4: App Sleeps on Free Tier

**Issue:** Free Render instances sleep after 15 minutes of inactivity

**Solution:**
1. Upgrade to paid tier for 24/7 uptime
2. Or use a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 5 minutes
3. Set up monitoring: `https://your-service-name.onrender.com/api/health`

### Issue 5: Environment Variables Not Loading

**Solution:**
1. Don't use quotes around values in Render's environment variables
2. Restart the service after adding/changing variables
3. Check for typos in variable names (case-sensitive)

## 📊 Monitoring Your Deployment

### Check Logs in Real-Time
In Render dashboard:
- Go to your service
- Click **"Logs"** tab
- Watch for startup messages:
  - ✅ Connected to MongoDB
  - 🚀 Server running on http://...
  - 🔧 Environment Check

### Monitor Health
Set up external monitoring for:
- `https://your-service-name.onrender.com/api/health`
- Check every 5 minutes
- Alert if down for > 2 checks

## 🔐 Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS only** (Render does this automatically)
4. **Rotate credentials** periodically
5. **Monitor logs** for suspicious activity

## 📱 Custom Domain (Optional)

To use your own domain:
1. Go to your Render service → **"Settings"** → **"Custom Domain"**
2. Add your domain (e.g., `chatbot.yourdomain.com`)
3. Update DNS records as instructed by Render
4. Wait for SSL certificate to be issued (automatic)

## 🆘 Need Help?

If deployment fails:

1. **Check Render Logs**: Look for specific error messages
2. **Run Config Check Locally**: `npm run check`
3. **Test Health Endpoint**: Visit `/api/health` after deployment
4. **Contact Support**: 
   - Render Community: https://community.render.com/
   - MongoDB Support: https://support.mongodb.com/
   - n8n Forum: https://community.n8n.io/

## ✅ Post-Deployment Checklist

- [ ] Service deployed successfully
- [ ] Health check returns "ok"
- [ ] MongoDB shows "connected"
- [ ] Webhook shows "configured"
- [ ] Can send test message through UI
- [ ] n8n workflow receives and responds
- [ ] Chat history is being saved
- [ ] Mobile interface works correctly
- [ ] Set up monitoring/alerting

---

**Congratulations! Your chatbot is now live! 🎉**
