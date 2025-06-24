import {
  S3Client,
  GetObjectAclCommandInput,
  GetObjectCommand,
  PutObjectCommand
 } from "@aws-sdk/client-s3";
import Jimp from "jimp";

export async function getImageFromS3(
  s3Client: any,
  bucketName: string,
  key: string
) {
  const input: GetObjectAclCommandInput = {
    Bucket: bucketName,
    Key: key,
  }
  const command = new GetObjectCommand(input)
  const result = await s3Client.send(command);
  if (!result.Body) {
    throw new Error(`No body found for key: ${key}`);
  }

  const body = await result.Body.transformToByteArray()

  const bodyBuffer = Buffer.from(body);
  const image = await Jimp.read(bodyBuffer);

  return image;
}
export async function putImageToS3(
  s3Client: any,
  bucketName: string,
  key: string,
  imageBuffer: Buffer
) {
  const putInput = {
    Bucket: bucketName,
    Key: key,
    Body: imageBuffer,
  };

  const uploadResult =  await s3Client.send(new PutObjectCommand(putInput));

  return uploadResult;
}