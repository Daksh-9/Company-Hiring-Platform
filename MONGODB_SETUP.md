# MongoDB Atlas Connection Setup

## Step 1: Install Dependencies
Run the following command to install the dotenv package:
```bash
npm install
```

## Step 2: Set Up Environment Variables
Create a `.env` file in the root directory of your project with the following content:

```
MONGODB_URI=mongodb+srv://dbuser:YOUR_ACTUAL_PASSWORD_HERE@cluster0.sx83e.mongodb.net/hiring_platform
PORT=5000
NODE_ENV=development
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD_HERE` with the actual password for your `dbuser` account.

## Step 3: Update Database Access
1. Go to your MongoDB Atlas dashboard
2. Navigate to "Database Access" in the left sidebar
3. Find the `dbuser` account
4. Click "Edit" and set a password if you haven't already
5. Use this password in your `.env` file

## Step 4: Network Access
1. In MongoDB Atlas, go to "Network Access"
2. Add your IP address or use `0.0.0.0/0` for development (allows all IPs)
3. Click "Add IP Address"

## Step 5: Test Connection
Run the server to test the connection:
```bash
npm run server
```

You should see:
```
🔗 Attempting to connect to MongoDB Atlas...
📍 Using MongoDB Atlas cluster: cluster0.sx83e.mongodb.net
✅ Successfully connected to MongoDB!
📊 Database: hiring_platform
👥 Collection: users
```

## Connection String Format
Your connection string should look like this:
```
mongodb+srv://dbuser:your_password@cluster0.sx83e.mongodb.net/hiring_platform
```

## Troubleshooting
- Make sure your password doesn't contain special characters that need URL encoding
- Ensure your IP address is whitelisted in Network Access
- Check that the `dbuser` has the correct permissions in Database Access
- Verify the cluster name and database name are correct 