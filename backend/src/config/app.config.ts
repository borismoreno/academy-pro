import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const awsRegion = process.env.AWS_REGION;
  if (!awsRegion) {
    throw new Error('AWS_REGION environment variable is required');
  }

  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
  if (!awsAccessKeyId) {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
  }

  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!awsSecretAccessKey) {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
  }

  const awsSesFromEmail = process.env.AWS_SES_FROM_EMAIL;
  if (!awsSesFromEmail) {
    throw new Error('AWS_SES_FROM_EMAIL environment variable is required');
  }

  const awsSesName = process.env.AWS_SES_NAME;
  if (!awsSesName) {
    throw new Error('AWS_SES_NAME environment variable is required');
  }

  const awsS3BucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!awsS3BucketName) {
    throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL environment variable is required');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    frontendUrl,
    awsRegion,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsSesFromEmail,
    awsSesName,
    awsS3BucketName,
  };
});
