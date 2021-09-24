const express = require('express');

const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { S3Client } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const s3Bucket = process.env.AWS_S3_BUCKET_NAME;

async function generateUploadUrl({ type }) {
  /**
   * We generate a new uuid as name, to prevent conflicting filenames.
   * You can install this package with `npm i uuid`
   */
  const name = uuidv4();
  const expiresInMinutes = 1;
  return await createPresignedPost(s3Client, {
    Bucket: s3Bucket,
    Key: `test-public/${name}`,
    Expires: expiresInMinutes * 60, // the url will only be valid for 1 minute
    Conditions: [["eq", "$Content-Type", type]],
  });
}


const router = express.Router();

router.post("/generate-upload-url", async function (req, res) {
  try {
    const type = req.body.type;
    if (!type) {
      return res.status(400).json("invalid request body");
    }
    const data = await generateUploadUrl({ type });
    return res.json(data);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

module.exports = router;
