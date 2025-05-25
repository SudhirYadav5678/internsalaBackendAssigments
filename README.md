# Project Setup

## To run the program:

1. Install dependencies  
   ```bash
   npm install

MONGO_URI=your_mongodb_connection_string,
PORT=8000,
CORS="*",
DB_NAME=InternsalaBackend,
ACCESS_TOKEN_SECRET=your_access_token_secret,
ACCESS_TOKEN_EXPIRY=10d,
REFRESH_TOKEN_SECRET=your_refresh_token_secret,
REFRESH_TOKEN_EXPIRY=2d,
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name,
CLOUDINARY_API_KEY=your_cloudinary_api_key,
CLOUDINARY_API_SECRET=your_cloudinary_api_secret,

npm run dev
