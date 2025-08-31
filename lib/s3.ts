import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  type ServerSideEncryption,
  type PutObjectCommandInput,
  type GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const sse: ServerSideEncryption | undefined =
  (process.env.S3_SSE || "").trim() === "AES256"
    ? "AES256"
    : (process.env.S3_SSE || "").trim() === "aws:kms"
    ? "aws:kms"
    : undefined;

const bucketKeyEnabled =
  (process.env.S3_BUCKET_KEY_ENABLED || "").toLowerCase() === "true";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
});

export async function getPresignedPutUrl({
  key,
  expiresIn = 600,
}: {
  key: string;
  expiresIn?: number;
}) {
  const input: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ...(sse ? { ServerSideEncryption: sse } : {}),
    ...(sse && bucketKeyEnabled ? { BucketKeyEnabled: true } : {}),
  };
  const command = new PutObjectCommand(input);
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getPresignedGetUrl({
  key,
  expiresIn = 300,
}: {
  key: string;
  expiresIn?: number;
}) {
  const input: GetObjectCommandInput = {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  };
  const command = new GetObjectCommand(input);
  return getSignedUrl(s3Client, command, { expiresIn });
}
