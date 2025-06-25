import { Handler, S3Event, S3Handler } from "aws-lambda";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import Jimp from "jimp";
import path from "path";
import { getImageFromS3, putImageToS3 } from "../../common/src/index.js";
import { S3Message } from "../../common/src/types";
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from "@aws-sdk/client-sqs";

const DIRECTORY = 'resize'; // Directory to save resized images
const QUEUE_URL = process.env.QUEUE_URL || '';
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

    //4. send a message to SQS
    const s3Message: S3Message = { bucketName: bucket, key: uploadKey };

    //sqs client
    const sqsClient = new SQSClient();

    // sqs command
    const input: SendMessageCommandInput = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(s3Message),
    }
    const command: SendMessageCommand = new SendMessageCommand(input);
    await sqsClient.send(command)

    console.log(`Message sent to SQS for resized message: ${JSON.stringify(s3Message)}`);
  }
}