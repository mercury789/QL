import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import mime from 'mime-types'

const ENDPOINT = 'https://b69e6553df50cda7d78b13947363a2f5.r2.cloudflarestorage.com'
const ACCESS_KEY_ID = 'f9757c40ced8c69c449fe5cf780b3e4a'
const SECRET_ACCESS_KEY = '8d8fcf92ed124cef1447e4e9169907c91aa84a56bd48173edc8d8959dd4bf21a'
const BUCKET = 'ql-media'

const client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
})

const folders = [
  './video/absolute',
  './video/finance',
  './video/general',
  './video/upgrade',
  './video/lose',
]

const upload = async () => {
  for (const folder of folders) {
    const files = fs.readdirSync(folder)
    for (const file of files) {
      const filePath = path.join(folder, file)
      const Key = path.join(path.basename(folder), file).replace(/\\/g, '/')
      const Body = fs.readFileSync(filePath)
      const ContentType = mime.lookup(filePath) || 'application/octet-stream'

      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key,
          Body,
          ContentType,
        })
      )
    }
  }
}

upload()
