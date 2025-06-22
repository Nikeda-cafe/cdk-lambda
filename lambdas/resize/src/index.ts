import { Handler, S3Event, S3Handler } from "aws-lambda";
import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import Jimp from "jimp";
import path from "path";

const DIRECTORY = 'resize'; // Directory to save resized images
export const handler: S3Handler = async (event: S3Event) => {
  const s3Client = new S3Client()

  for (const record of event.Records) {
    // 1. download the file from S3
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const parsedKey = path.parse(key);

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    const input: GetObjectCommandInput = {
      Bucket: bucket,
      Key: key,
    }
    const command = new GetObjectCommand(input)
    const result = await s3Client.send(command)
    if (!result.Body) {
      throw Error('No body in the response');
    }
    const body = await result.Body.transformToByteArray()


    // 2.
    const bodyBuffer = Buffer.from(body);
    const image = await Jimp.read(bodyBuffer);
    image.resize(256, 256); // Resize to 256x256 pixels

    const width = image.getWidth();
    const height = image.getHeight();

    const resizedWidth = Math.floor(width * 0.5);
    const resizedHeight = Math.floor(height * 0.5);

    image.resize(resizedWidth, resizedHeight); // Resize to half the original size

    // 3. upload the file to S3
    const mime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(mime);

    const uploadKey = `${DIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}`;
    const putInput: PutObjectCommandInput = {
      Bucket: bucket,
      Key: uploadKey,
      Body: imageBuffer,
    }
    console.log(`Uploading resized image to: s3://${bucket}/${uploadKey}`);
    const putCommand = new PutObjectCommand(putInput);
    const uplaodResult = await s3Client.send(putCommand);
    console.log(uplaodResult);
  }
}