# S7 Nebuvault API

A multi-server file hosting API built with **Node.js**, **Express**,
**MongoDB**, and **Cloudflare R2**.

Created by **SABIR7718 / (VOIDSEC)**

## Features

-   Upload files up to **250MB**
-   Multi-server **Cloudflare R2 pool**
-   Automatic server rotation
-   MongoDB file metadata storage
-   Auto-expiring files using TTL
-   Dynamic expiry based on file size
-   Automatic oldest-file cleanup when storage becomes full
-   File streaming
-   Admin clear-all endpoint
-   CORS protection
-   Rate limiting
-   Auto self-ping support
-   Custom logging using `@sabir7718/log`

------------------------------------------------------------------------

## Install

``` bash
git clone https://github.com/SABIR7718/nebuvault
cd nebuvault
npm install
```

Install required packages:

``` bash
npm install express express-rate-limit multer mongoose dotenv cors @aws-sdk/client-s3 @sabir7718/log
```

------------------------------------------------------------------------

## Environment Variables

Create a `.env` file:

``` env
PORT=3000
MONGO_URI=your_mongodb_uri

R2_BUCKET=your_bucket_name

R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

R2_ENDPOINT2=
R2_ACCESS_KEY_ID2=
R2_SECRET_ACCESS_KEY2=

CLEAR_PASSWORD=your_password

URL=https://your-api-url.com
```

Supports up to 50 R2 servers.

------------------------------------------------------------------------

## API Endpoints

### Upload

POST `/upload`

Form-data:

``` text
file = your_file
```

Response:

``` json
{
 "success": true,
 "url":"https://file.sabir7718.com/f/FILE_ID",
 "expires":"7 day(s)"
}
```

------------------------------------------------------------------------

### Download

GET `/f/:id`

Returns the uploaded file stream.

------------------------------------------------------------------------

### Clear All

POST `/clearall`

``` json
{
 "password":"your_password"
}
```

Deletes all files from MongoDB and R2.

------------------------------------------------------------------------

### Info Route

GET `/`

Shows:

-   Storage usage
-   Server stats
-   File links
-   CPU and memory info
-   Uptime

------------------------------------------------------------------------

## File Expiry

  Size      Expiry
  --------- ---------
  ≤1MB      30 days
  ≤5MB      15 days
  ≤20MB     7 days
  ≤50MB     3 days
  ≤100MB    2 days
  \>100MB   1 day

Files opened during the last 24 hours before expiry receive +1 day
extension.

------------------------------------------------------------------------

## Run

``` bash
node index.js
```

------------------------------------------------------------------------

## Author

SABIR7718

Telegram: https://t.me/SABIR7718

GitHub: https://github.com/SABIR7718

YouTube: https://youtube.com/@voidsec7718
