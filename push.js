import { promises as fs } from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

const ENDPOINT = 'https://b69e6553df50cda7d78b13947363a2f5.r2.cloudflarestorage.com';
const ACCESS_KEY_ID = 'f9757c40ced8c69c449fe5cf780b3e4a';
const SECRET_ACCESS_KEY = '8d8fcf92ed124cef1447e4e9169907c91aa84a56bd48173edc8d8959dd4bf21a';
const BUCKET = 'ql-media';

const client = new S3Client({
  region: 'auto',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const folders = [
  './video/absolute',
  './video/finance',
  './video/general',
  './video/upgrade',
  './video/lose',
];

async function upload() {
  for (const folder of folders) {
    let files;
    try {
      files = await fs.readdir(folder);
    } catch (err) {
      console.error(`Ошибка чтения папки ${folder}:`, err);
      continue;
    }

    for (const file of files) {
      const filePath = path.join(folder, file);
      const Key = path.join(path.basename(folder), file).replace(/\\/g, '/');
      let Body;
      try {
        Body = await fs.readFile(filePath);
      } catch (err) {
        console.error(`Ошибка чтения файла ${filePath}:`, err);
        continue;
      }
      const ContentType = mime.lookup(filePath) || 'application/octet-stream';

      try {
        await client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key,
            Body,
            ContentType,
          })
        );
        console.log(`Загружен файл: ${Key}`);
      } catch (err) {
        console.error(`Ошибка загрузки файла ${Key}:`, err);
      }
    }
  }
}

upload().catch(err => {
  console.error('Фатальная ошибка при загрузке:', err);
});


