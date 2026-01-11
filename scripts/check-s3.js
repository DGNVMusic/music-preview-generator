// Simple S3 connectivity check. Loads .env and calls GetBucketLocation for the configured bucket.
// Run: node scripts/check-s3.js

require('dotenv').config();
const { S3Client, GetBucketLocationCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

if (!BUCKET) {
  console.error('Missing AWS_S3_BUCKET in environment (.env).');
  process.exit(2);
}

const client = new S3Client({ region: REGION });

async function run() {
  try {
    console.log('Checking S3 access for bucket:', BUCKET);
    const cmd = new GetBucketLocationCommand({ Bucket: BUCKET });
    const res = await client.send(cmd);
    console.log('GetBucketLocation succeeded. Response:', JSON.stringify(res));
  } catch (err) {
    // Print SDK error code and message for debugging (don't log credentials)
    console.error('GetBucketLocation failed');
    if (err && err.name) console.error('Error name:', err.name);
    if (err && err.$metadata && err.$metadata.httpStatusCode) console.error('HTTP status:', err.$metadata.httpStatusCode);
    if (err && err.code) console.error('Code:', err.code);
    console.error('Message:', err.message || String(err));
    process.exit(1);
  }
}

run();
