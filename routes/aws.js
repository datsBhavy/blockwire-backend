const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

router.get("/get-presigned-url", (req, res) => {
  const { fileName, fileType } = req.query;

  const params = {
    Bucket: BUCKET_NAME,
    Key: `images/${Date.now()}_${fileName}`, // Add a timestamp to make filenames unique
    Expires: 60, // URL expiry time in seconds
    ContentType: fileType,
    ACL: "public-read", // Make the file publicly accessible
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      console.error("Error generating pre-signed URL:", err);
      return res.status(500).json({ error: "Error generating pre-signed URL" });
    }
    res.status(200).json({ url });
  });
});

module.exports = router;