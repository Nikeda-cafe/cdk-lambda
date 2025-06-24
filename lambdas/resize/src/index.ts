import { Handler, S3Event, S3Handler } from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import Jimp from "jimp";
import path from "path";
import { getImageFromS3, putImageToS3 } from "../../common/src/index.js";

const DIRECTORY = 'resize'; // Directory to save resized images
export const handler: S3Handler = async (event: S3Event) => {
  const s3Client = new S3Client()

  for (const record of event.Records) {
    // 1. download the file from S3
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const parsedKey = path.parse(key);

    const image = await getImageFromS3(s3Client, bucket, key);

    const width = image.getWidth();
    const height = image.getHeight();

    const resizedWidth = Math.floor(width * 0.5);
    const resizedHeight = Math.floor(height * 0.5);

    image.resize(resizedWidth, resizedHeight); // Resize to half the original size

    // 3. upload the file to S3
    const mime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(mime);

    const uploadKey = `${DIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}`;
    await putImageToS3(s3Client, bucket, uploadKey, imageBuffer);
  }
}