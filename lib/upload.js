const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL; // e.g. https://dxxxxxxxx.cloudfront.net

if (!REGION || !BUCKET || !CLOUDFRONT_URL) {
  // We'll still export functions, but upload will fail with a clear message if envs missing
}

const client = new S3Client({ region: REGION });

async function uploadFile(filePath) {
  if (!REGION || !BUCKET || !CLOUDFRONT_URL) throw new Error('Missing AWS_REGION, AWS_S3_BUCKET, or CLOUDFRONT_URL in env');
  const body = fs.createReadStream(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  const key = `previews/${uuidv4()}${path.extname(filePath)}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(cmd);

  // Construct CloudFront URL (assumes path mapping)
  return `${CLOUDFRONT_URL.replace(/\/$/, '')}/${key}`;
}

module.exports = { uploadFile };
