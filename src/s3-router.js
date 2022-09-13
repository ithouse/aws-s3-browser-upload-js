const express = require('express');

const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const client = new S3Client({ region: process.env.AWS_REGION });
const s3Bucket = process.env.AWS_S3_BUCKET_NAME;
//const bucketPrefix = 'test-public/';
const bucketPrefix = 'hospital_photos/';

const generateUploadUrl =  ({ type }) => {
  /**
   * We generate a new uuid as name, to prevent conflicting filenames.
   * You can install this package with `npm i uuid`
   */
  const name = uuidv4();
  const expiresInMinutes = 1;
  return createPresignedPost(client, {
    Bucket: s3Bucket,
    Key: `${bucketPrefix}${name}`,
    Expires: expiresInMinutes * 60, // the url will only be valid for 1 minute
    Conditions: [["eq", "$Content-Type", type]],
  });
};

const listObjects = () => {
  const input = {
    Bucket: s3Bucket,
    Prefix: bucketPrefix,
  }
  const command = new ListObjectsV2Command(input);
  return client.send(command);
};

const getFileUrl = (Key) => {
  const getObjectParams = {
    Bucket: s3Bucket,
    Key,
  }
  const command = new GetObjectCommand(getObjectParams);
  return getSignedUrl(client, command, { expiresIn: 3600 })
  .then((url) => {
    const data = {};
    data[Key] = url;
    return Promise.resolve(data);
  });
};

const router = express.Router();

router.post("/generate-upload-url", (req, res) => {
  const type = req.body.type;
  if (!type) {
    return res.status(400).json("invalid request body");
  }
  generateUploadUrl({ type })
  .then(data => {
    return res.json(data);
  })
  .catch(e => {
    return res.status(500).json(e.message);
  });
});

router.get("/get-files", (req, res) => {
  listObjects()
  .then(async (data) => {
    const { Contents } = data;
    // return JSON.stringify(data,null,2);
    return Promise.all(Contents.map((item) => getFileUrl(item.Key)));
  })
  .then((data) => {
    return res.json(data);
  })
  .catch(e => {
    return res.status(500).json(e.message);
  });
});

module.exports = router;
