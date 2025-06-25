import { Handler, S3Event, S3Handler, SQSEvent, SQSHandler } from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import Jimp from "jimp";
import path from "path";
import { getImageFromS3, putImageToS3 } from "../../common/src/index.js";
import { S3Message } from "../../common/src/types";

const PROCESS = 'grayscale'; // Directory to save resized images
export const handler: SQSHandler = async (event: SQSEvent) => {
  const s3Client = new S3Client()

  for (const record of event.Records) {
    // 1. download the file from S3
    const message = record.body;
    const s3Message: S3Message  = JSON.parse(message);
    const bucketName = s3Message.bucketName
    const key = s3Message.key
    const parsedKey = path.parse(key)

    const image = await getImageFromS3(s3Client, bucketName, key);

    // grascale the image
    image.grayscale();

    // 3. upload the file to S3
    const mime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(mime);

    const uploadKey = `${PROCESS}/${parsedKey.name}-${PROCESS}${parsedKey.ext}`;
    await putImageToS3(s3Client, bucketName, uploadKey, imageBuffer);
  }
}