# Deployment Strategy (Development)

## AWS Services
- EC2 or ECS
- S3 + CloudFront
- RDS
- Secrets Manager

## High-level Architecture
- Backend deployed first
- Frontend consumes backend API

## Deployment Order
1. Backend
2. Frontend

## Secrets
Managed via GitHub Secrets and AWS Secrets Manager