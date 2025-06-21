import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

const REPOSITORY_TOP = path.join(__dirname, '../')
const PREFIX = 'cdk-lambda-ts-2';

// #!/usr/bin/env node

export class CdkLamdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, `${PREFIX}-bucket`, {
      bucketName: PREFIX,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const resizeLambda = new NodejsFunction(this, `${PREFIX}-lambda-resize`, {
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP, 'lambdas/resize/src/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
    })
    bucket.grantPut(resizeLambda);
    bucket.grantReadWrite(resizeLambda);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new LambdaDestination(resizeLambda),
      { prefix: 'original/' }
    )
  }
}
