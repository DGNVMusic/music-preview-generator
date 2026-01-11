# Music Preview Generator

Electron app to extract the most intense section of an audio track and upload it to S3/CloudFront.

Quick start

1. Copy `.env.example` to `.env` and fill AWS settings.
2. Install deps:

```bash
npm install
```

3. Run the app:

```bash
npm start
```

Usage

- Click *Select Audio File* and choose an audio file (mp3, wav, flac).
- Configure preview length and step if desired.
- Click *Analyze & Upload*. When upload completes you'll get the CloudFront URL.

Notes

- This project uses `ffmpeg` (via `ffmpeg-static`) to analyze loudness and produce preview clips.
- The upload requires correct AWS credentials and an S3 bucket configured as the CloudFront origin. Objects are uploaded with `public-read` ACL and the CloudFront URL is returned.
