// Cliente Cloudflare R2 (compatível com S3)
// Uso: upload de assets gerados (vídeos, imagens)

import { S3Client } from '@aws-sdk/client-s3'

let _client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!_client) {
    const accountId = process.env.R2_ACCOUNT_ID
    if (!accountId) throw new Error('R2_ACCOUNT_ID não configurado')
    if (!process.env.R2_ACCESS_KEY_ID) throw new Error('R2_ACCESS_KEY_ID não configurado')
    if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error('R2_SECRET_ACCESS_KEY não configurado')

    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return _client
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? 'nexus-studio-dev'
