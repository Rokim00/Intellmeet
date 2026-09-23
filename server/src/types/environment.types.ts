export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  CORS_ORIGIN: string;
  AWS_ENDPOINT_URL?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_S3_BUCKET?: string;
}
