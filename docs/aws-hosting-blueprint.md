# AWS Hosting Blueprint for Digital Addressing System

## Executive Summary

This blueprint outlines the architecture, services, and requirements for hosting the digital addressing system on Amazon Web Services (AWS). It provides a scalable, secure, and cost-effective solution leveraging AWS managed services.

## Architecture Overview

### High-Level AWS Architecture

```
Internet Gateway
    ↓
Application Load Balancer (ALB)
    ↓
Amazon ECS/EKS Cluster (Multi-AZ)
    ↓
├── Frontend (React/Vite)
├── API Gateway
├── Lambda Functions (Edge Functions)
└── Backend Services
    ↓
├── Amazon RDS PostgreSQL (Multi-AZ)
├── Amazon ElastiCache (Redis)
├── Amazon S3 (File Storage)
├── Amazon Cognito (Authentication)
└── Amazon OpenSearch (Search)
```

## AWS Services Mapping

### Core Infrastructure
- **Compute**: Amazon ECS with Fargate or Amazon EKS
- **Load Balancing**: Application Load Balancer (ALB)
- **CDN**: Amazon CloudFront
- **DNS**: Amazon Route 53
- **VPC**: Virtual Private Cloud with public/private subnets

### Database & Storage
- **Primary Database**: Amazon RDS PostgreSQL (Multi-AZ)
- **Cache**: Amazon ElastiCache for Redis
- **File Storage**: Amazon S3 with CloudFront
- **Backup**: AWS Backup service
- **Search**: Amazon OpenSearch Service

### Application Services
- **Authentication**: Amazon Cognito
- **API Gateway**: AWS API Gateway
- **Functions**: AWS Lambda
- **Message Queue**: Amazon SQS
- **Notifications**: Amazon SNS
- **Email**: Amazon SES

### Security & Compliance
- **WAF**: AWS WAF
- **Secrets**: AWS Secrets Manager
- **Identity**: AWS IAM
- **Encryption**: AWS KMS
- **Compliance**: AWS Config, AWS CloudTrail

### Monitoring & Operations
- **Monitoring**: Amazon CloudWatch
- **Logging**: AWS CloudWatch Logs
- **Tracing**: AWS X-Ray
- **Alerting**: Amazon SNS + CloudWatch Alarms

## Detailed Architecture

### Network Architecture
```
VPC (10.0.0.0/16)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   ├── NAT Gateways
│   ├── Application Load Balancer
│   └── Bastion Hosts (optional)
└── Private Subnets (10.0.10.0/24, 10.0.11.0/24)
    ├── ECS/EKS Cluster
    ├── RDS Database
    ├── ElastiCache
    └── Lambda Functions (in VPC)
```

### Container Orchestration Options

#### Option 1: Amazon ECS with Fargate (Recommended)
- **Pros**: Serverless, no EC2 management, automatic scaling
- **Cons**: Slight cost premium, less customization
- **Use Case**: Simplified operations, automatic scaling

#### Option 2: Amazon EKS
- **Pros**: Full Kubernetes features, portability, extensive ecosystem
- **Cons**: More complex management, higher operational overhead
- **Use Case**: Advanced orchestration needs, hybrid deployments

### Database Configuration

#### Primary Database: Amazon RDS PostgreSQL
```yaml
Engine: PostgreSQL 15+
Instance Class: db.r6g.large (production)
Storage: gp3 SSD, 100GB initial, auto-scaling enabled
Multi-AZ: Yes (for high availability)
Backup: 7-day retention, automated backups
Encryption: KMS encryption at rest
```

#### Cache: Amazon ElastiCache for Redis
```yaml
Engine: Redis 7.x
Node Type: cache.r6g.large
Cluster Mode: Enabled (for scaling)
Encryption: In-transit and at-rest
Backup: Daily automatic snapshots
```

## Bill of Materials (BOM)

### Production Environment

#### Compute Resources
- **ALB**: 1 Application Load Balancer
- **ECS Cluster**: 3-6 Fargate tasks (2 vCPU, 4GB RAM each)
- **Lambda Functions**: 10-15 functions, various memory allocations

#### Database & Storage
- **RDS PostgreSQL**: db.r6g.large (Multi-AZ)
- **ElastiCache**: cache.r6g.large (3-node cluster)
- **S3**: Standard storage with Intelligent Tiering
- **CloudFront**: Global distribution

#### Networking
- **VPC**: 1 VPC with 4 subnets (2 public, 2 private)
- **NAT Gateways**: 2 (one per AZ)
- **Route 53**: Hosted zone + health checks

### Development/Staging Environment
- **Compute**: Smaller Fargate tasks (1 vCPU, 2GB RAM)
- **Database**: db.t3.medium (single AZ)
- **Cache**: cache.t3.micro (single node)
- **Reduced redundancy and backup retention**

## Cost Estimation

### Monthly AWS Costs (US East region)

#### Production Environment
```
Compute:
- ALB: $22/month
- ECS Fargate (6 tasks): $180/month
- Lambda: $50/month (estimated usage)

Database & Storage:
- RDS PostgreSQL (db.r6g.large Multi-AZ): $350/month
- ElastiCache (cache.r6g.large cluster): $280/month
- S3 Storage (500GB): $12/month
- CloudFront: $25/month

Networking:
- NAT Gateways: $90/month
- Data Transfer: $50/month

Security & Management:
- Secrets Manager: $2/month
- CloudWatch Logs: $15/month
- WAF: $20/month

Total Production: ~$1,096/month
```

#### Development Environment
```
Total Development: ~$200-300/month
```

### Additional Costs
- **Support**: Business Support ($100/month minimum)
- **Reserved Instances**: 30-50% savings for predictable workloads
- **Data Transfer**: Variable based on usage

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)
1. **VPC and Networking**
   - Create VPC with public/private subnets
   - Configure NAT Gateways and Internet Gateway
   - Set up security groups and NACLs

2. **Database Migration**
   - Create RDS PostgreSQL instance
   - Migrate schema and data from Supabase
   - Set up read replicas if needed

3. **Storage Setup**
   - Create S3 buckets for different content types
   - Configure CloudFront distribution
   - Migrate existing files

### Phase 2: Application Deployment (Week 2-3)
1. **Container Preparation**
   - Containerize applications with Docker
   - Push images to Amazon ECR
   - Create ECS task definitions

2. **Service Deployment**
   - Deploy ECS services
   - Configure load balancer
   - Set up auto-scaling policies

3. **Lambda Functions**
   - Deploy edge functions as Lambda
   - Configure API Gateway
   - Set up triggers and permissions

### Phase 3: Security & Monitoring (Week 3-4)
1. **Security Configuration**
   - Configure WAF rules
   - Set up IAM roles and policies
   - Enable encryption and secrets management

2. **Monitoring Setup**
   - Configure CloudWatch dashboards
   - Set up alarms and notifications
   - Enable AWS X-Ray tracing

### Phase 4: Testing & Go-Live (Week 4)
1. **Testing**
   - Load testing with realistic traffic
   - Security penetration testing
   - Disaster recovery testing

2. **DNS Cutover**
   - Update DNS records
   - Monitor application performance
   - Implement blue-green deployment

## Security Configuration

### Identity and Access Management
```yaml
IAM Roles:
  - ECS Task Role
  - Lambda Execution Role
  - RDS Enhanced Monitoring Role
  - CloudWatch Logs Role

Security Groups:
  - ALB Security Group (80, 443)
  - ECS Security Group (application ports)
  - RDS Security Group (5432 from ECS only)
  - Lambda Security Group (outbound only)

WAF Rules:
  - SQL injection protection
  - XSS protection
  - Rate limiting
  - Geographic restrictions
```

### Encryption Strategy
- **Data at Rest**: KMS encryption for RDS, S3, EBS
- **Data in Transit**: TLS 1.2+ for all communications
- **Application Secrets**: AWS Secrets Manager
- **API Keys**: Stored in Secrets Manager, rotated regularly

## Backup and Disaster Recovery

### Backup Strategy
```yaml
RDS Backups:
  - Automated daily backups (7-day retention)
  - Manual snapshots before major changes
  - Cross-region replication for compliance

S3 Backups:
  - Versioning enabled
  - Cross-region replication
  - Lifecycle policies for cost optimization

Application Backups:
  - Infrastructure as Code (CloudFormation/CDK)
  - Container images in ECR
  - Configuration in AWS Systems Manager
```

### Disaster Recovery
- **RTO**: 4 hours (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Strategy**: Multi-AZ deployment with cross-region backup
- **Testing**: Quarterly DR drills

## Performance Optimization

### Auto Scaling Configuration
```yaml
ECS Auto Scaling:
  - Target CPU: 70%
  - Target Memory: 80%
  - Min Capacity: 2
  - Max Capacity: 10

RDS Scaling:
  - Read Replicas: 2 (for read-heavy workloads)
  - Connection pooling via RDS Proxy
  - Performance Insights enabled

ElastiCache:
  - Cluster mode for horizontal scaling
  - Automatic failover
  - Reserved capacity for cost optimization
```

### CDN Configuration
```yaml
CloudFront:
  - Origin: S3 + ALB
  - Cache Behaviors: Static vs Dynamic content
  - Geographic Distribution: Global
  - Compression: Enabled
  - HTTP/2: Enabled
```

## Monitoring and Alerting

### CloudWatch Dashboards
1. **Application Health Dashboard**
   - Response times, error rates
   - Container metrics (CPU, memory)
   - Database performance

2. **Infrastructure Dashboard**
   - Network throughput
   - Load balancer metrics
   - Auto-scaling activities

3. **Security Dashboard**
   - WAF blocked requests
   - Failed authentication attempts
   - Unusual access patterns

### Alerting Strategy
```yaml
Critical Alerts:
  - Application down (response code 5xx > 5%)
  - Database connection failures
  - High error rates (> 1%)
  - Auto-scaling events

Warning Alerts:
  - High CPU utilization (> 80%)
  - Database storage > 85%
  - Unusual traffic patterns
  - Cache hit ratio < 80%
```

## Compliance and Governance

### Data Protection
- **GDPR Compliance**: Data encryption, right to be forgotten
- **Data Residency**: Region-specific deployments
- **Audit Logging**: CloudTrail for all API calls
- **Access Logging**: VPC Flow Logs, ALB access logs

### Cost Management
- **Budgets**: Monthly spending alerts
- **Cost Allocation Tags**: Department, environment, project
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical batch processing

## Operations Runbook

### Daily Operations
- Monitor CloudWatch dashboards
- Review application logs
- Check backup completion
- Validate security alerts

### Weekly Operations
- Review performance metrics
- Update security patches
- Validate disaster recovery procedures
- Cost optimization review

### Monthly Operations
- Security assessment
- Performance tuning
- Capacity planning
- DR testing

## Migration Considerations from Supabase

### Database Migration
```sql
-- Export Supabase data
pg_dump --host=db.xxx.supabase.co --port=5432 --username=postgres --dbname=postgres --clean --no-owner --no-privileges --file=supabase_export.sql

-- Import to RDS
psql --host=rds-endpoint.region.rds.amazonaws.com --port=5432 --username=postgres --dbname=postgres --file=supabase_export.sql
```

### Authentication Migration
- **From**: Supabase Auth
- **To**: Amazon Cognito
- **Strategy**: Dual authentication during transition period
- **User Migration**: Triggered migration on first login

### File Storage Migration
```bash
# Sync Supabase storage to S3
aws s3 sync supabase-bucket/ s3://your-bucket/ --recursive
```

### Edge Functions Migration
- **From**: Supabase Edge Functions (Deno)
- **To**: AWS Lambda (Node.js)
- **Strategy**: Rewrite functions for Lambda runtime
- **API Gateway**: Replace Supabase API with AWS API Gateway

## DevOps and CI/CD

### Recommended CI/CD Pipeline
```yaml
Source: GitHub/GitLab
Build: AWS CodeBuild
Deploy: AWS CodeDeploy
Pipeline: AWS CodePipeline

Environments:
  - Development (auto-deploy on merge)
  - Staging (manual approval)
  - Production (manual approval + rollback capability)
```

### Infrastructure as Code
```yaml
Tool: AWS CDK (TypeScript) or CloudFormation
Structure:
  - VPC and Networking
  - Security Groups and IAM
  - RDS and ElastiCache
  - ECS/EKS Cluster
  - Lambda Functions
  - Monitoring and Alerts
```

## Support and Maintenance

### AWS Support Plans
- **Business Support**: $100/month minimum, 1-hour response for production issues
- **Enterprise Support**: $15,000/month minimum, 15-minute response for critical issues

### Managed Services Options
- **AWS Managed Services**: Full infrastructure management
- **AWS Professional Services**: Migration and optimization consulting
- **AWS Partner Network**: Third-party managed services

## Key Recommendations

1. **Start with ECS Fargate**: Easier to manage than EKS initially
2. **Use Multi-AZ RDS**: Critical for production availability
3. **Implement Infrastructure as Code**: Use CDK or CloudFormation
4. **Enable Detailed Monitoring**: CloudWatch, X-Ray, VPC Flow Logs
5. **Plan for Growth**: Design auto-scaling from day one
6. **Security First**: WAF, encryption, least privilege access
7. **Cost Optimization**: Reserved instances, auto-scaling, lifecycle policies

## Next Steps

1. **Assessment**: Review current Supabase usage and requirements
2. **Proof of Concept**: Deploy a minimal version on AWS
3. **Migration Planning**: Detailed migration timeline and testing
4. **Team Training**: AWS services and best practices
5. **Go-Live**: Phased migration with rollback capability

This blueprint provides a comprehensive foundation for migrating your digital addressing system to AWS while maintaining security, scalability, and cost-effectiveness.