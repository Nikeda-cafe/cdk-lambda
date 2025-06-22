import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client
} from "@aws-sdk/client-s3";
import 'dotenv/config';

const bucketName = process.env.BUCKET_NAME;

async function main() {
  const s3Client = new S3Client()
  const key = 'original/react.png'; // Adjust the key as needed

  const input: GetObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
  }
  const command = new GetObjectCommand(input)
  const result = await s3Client.send(command)
  if (!result.Body) {
    throw Error('No body in the response');
  }
  const body = await result.Body.transformToByteArray()
  console.log(body)
}
main()