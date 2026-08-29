# VoxTrail - Monitoring & Logging Guide

## Table of Contents

1. [Overview](#overview)
2. [Built-in Logging](#built-in-logging)
3. [Error Tracking](#error-tracking)
4. [Performance Monitoring](#performance-monitoring)
5. [Security Monitoring](#security-monitoring)
6. [User Analytics](#user-analytics)
7. [Infrastructure Monitoring](#infrastructure-monitoring)
8. [Alerting](#alerting)
9. [Log Analysis](#log-analysis)
10. [Best Practices](#best-practices)

## Overview

The VoxTrail application includes comprehensive logging and monitoring capabilities to ensure reliable operation in production. This guide covers all aspects of monitoring, from application logs to infrastructure metrics.

## Built-in Logging

### Application Logs

The application includes structured logging with multiple levels and categories:

#### Log Levels

- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Warning conditions that should be monitored
- **INFO**: General informational messages
- **DEBUG**: Detailed debugging information

#### Log Categories

##### Authentication Logs

```json
{
  "timestamp": "2025-11-11T07:30:00Z",
  "level": "INFO",
  "category": "auth",
  "message": "User authenticated successfully",
  "userId": "user123",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

##### API Request Logs

```json
{
  "timestamp": "2025-11-11T07:30:00Z",
  "level": "INFO",
  "category": "api",
  "message": "API request processed",
  "method": "GET",
  "path": "/api/stays/search",
  "statusCode": 200,
  "responseTime": 245,
  "userRole": "anonymous",
  "ip": "192.168.1.100"
}
```

##### Rate Limiting Logs

```json
{
  "timestamp": "2025-11-11T07:30:00Z",
  "level": "WARN",
  "category": "rate_limit",
  "message": "Rate limit exceeded",
  "userId": "anonymous",
  "ip": "192.168.1.100",
  "path": "/api/stays/search",
  "role": "anonymous",
  "requestsInWindow": 21,
  "limit": 20
}
```

##### Security Logs

```json
{
  "timestamp": "2025-11-11T07:30:00Z",
  "level": "WARN",
  "category": "security",
  "message": "Suspicious activity detected",
  "ip": "192.168.1.100",
  "path": "/api/translate",
  "userAgent": "Bot/1.0",
  "fingerprint": "abc123def456"
}
```

##### Database Operation Logs

```json
{
  "timestamp": "2025-11-11T07:30:00Z",
  "level": "INFO",
  "category": "database",
  "message": "Firestore operation completed",
  "operation": "create",
  "collection": "users/saved_phrases",
  "userId": "user123",
  "responseTime": 150
}
```

### Log Output Configuration

#### Environment Variables

```bash
# Development
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
ENABLE_DETAILED_ERROR_LOGGING=true

# Production
LOG_LEVEL=error
ENABLE_REQUEST_LOGGING=false
ENABLE_DETAILED_ERROR_LOGGING=false
```

#### Console Output

Logs are output to console in development and can be captured by container orchestration systems.

#### Structured Format

All logs follow this structure:

```json
{
  "timestamp": "ISO8601 timestamp",
  "level": "log level",
  "category": "log category",
  "message": "human readable message",
  "metadata": {
    // Additional context-specific data
  }
}
```

## Error Tracking

### Error Types

#### Application Errors

- **Translation Errors**: Model loading failures, unsupported language pairs
- **API Errors**: External service timeouts, quota exceeded
- **Database Errors**: Connection failures, permission issues
- **Validation Errors**: Invalid input data, missing required fields

#### Security Errors

- **Authentication Failures**: Invalid tokens, expired sessions
- **Authorization Failures**: Insufficient permissions
- **Rate Limit Violations**: Excessive requests
- **Suspicious Activity**: Unusual patterns, potential attacks

#### Infrastructure Errors

- **Service Unavailable**: External API down
- **Resource Exhaustion**: Memory, CPU, connection limits
- **Configuration Errors**: Missing environment variables

### Error Response Format

All errors follow a standardized format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2025-11-11T07:30:00Z",
    "requestId": "req_123456",
    "details": {
      // Additional error context
    }
  }
}
```

### Error Code Reference

| Code       | Category       | Description              |
| ---------- | -------------- | ------------------------ |
| `AUTH_001` | Authentication | Invalid token            |
| `AUTH_002` | Authentication | Expired token            |
| `AUTH_003` | Authentication | Token revoked            |
| `AUTH_004` | Authorization  | Insufficient permissions |
| `RATE_001` | Rate Limiting  | Rate limit exceeded      |
| `RATE_002` | Rate Limiting  | Burst limit exceeded     |
| `VAL_001`  | Validation     | Invalid input data       |
| `VAL_002`  | Validation     | Missing required field   |
| `API_001`  | External API   | Service unavailable      |
| `API_002`  | External API   | Quota exceeded           |
| `DB_001`   | Database       | Connection failed        |
| `DB_002`   | Database       | Permission denied        |

## Performance Monitoring

### Response Time Tracking

The application tracks response times for all endpoints:

#### Response Time Headers

```http
X-Response-Time: 245ms
X-Database-Time: 150ms
X-External-API-Time: 95ms
```

#### Performance Metrics

- **API Response Time**: End-to-end request processing time
- **Database Query Time**: Firestore operation time
- **External API Time**: Third-party service response time
- **Translation Model Load Time**: AI model initialization time

### Throughput Monitoring

#### Request Volume Tracking

- **Requests per minute**: Overall API traffic
- **Requests by endpoint**: Individual endpoint usage
- **Requests by user role**: Anonymous vs authenticated usage
- **Peak traffic times**: Traffic pattern analysis

#### Success Rate Monitoring

- **Success rate**: Percentage of successful responses (2xx)
- **Error rate**: Percentage of error responses (4xx, 5xx)
- **Timeout rate**: Percentage of timeout failures

### Resource Usage

#### Memory Usage

- **Node.js Heap Size**: Application memory consumption
- **Translation Model Cache**: AI model memory usage
- **Connection Pool Size**: Database connection usage

#### CPU Usage

- **Request Processing CPU**: CPU time per request
- **Model Inference CPU**: AI processing time
- **Database Operation CPU**: Query processing time

## Security Monitoring

### Authentication Monitoring

#### Failed Login Attempts

- Track repeated failed authentication
- Monitor login patterns by IP address
- Alert on brute force attempts

#### Token Usage

- Monitor token validation failures
- Track token expiration patterns
- Monitor concurrent sessions

### Request Security

#### Rate Limiting Metrics

- Requests blocked by role
- Rate limit reset patterns
- IP address with most violations

#### Request Pattern Analysis

- Unusual request frequencies
- Suspicious user agents
- Geographic distribution anomalies

### Data Access Monitoring

#### User Data Access

- Track user data retrieval patterns
- Monitor for unauthorized access attempts
- Log data modification operations

#### API Key Usage

- Monitor Google Places and OpenRouter calls via the built-in `trackExternalCall` utility (emits warnings when `USAGE_ALERT_FALLBACK` or service-specific thresholds are breached).
- Track per-user consumption through the new quota counters (`STAYS_*`, `POI_*`, `PHRASEBOOK_MAX_REQUESTS_PER_HOUR`, `ITINERARY_MAX_REQUESTS_PER_HOUR`) and surface those metrics alongside billing dashboards.
- Wire the warning logs into your log aggregation/alerting stack (Datadog, Cloud Logging, etc.) to receive proactive signals before hard quotas are hit.

## User Analytics

### User Behavior Tracking

#### Anonymous User Patterns

- Popular search destinations
- Peak usage times
- Session duration patterns
- Feature usage distribution

#### Authenticated User Patterns

- Registration and login rates
- Feature adoption rates
- Saved phrase usage
- Translation language preferences

### Business Metrics

#### Popular Destinations

```json
{
  "destinations": [
    { "name": "Paris", "searches": 1245 },
    { "name": "Tokyo", "searches": 987 },
    { "name": "London", "searches": 756 }
  ]
}
```

#### Feature Usage

```json
{
  "features": {
    "stays_search": 3456,
    "poi_search": 2134,
    "translation": 1876,
    "phrasebook": 987,
    "saved_phrases": 543
  }
}
```

#### Language Preferences

```json
{
  "language_pairs": [
    { "pair": "en-es", "usage": 234 },
    { "pair": "en-fr", "usage": 187 },
    { "pair": "en-de", "usage": 156 }
  ]
}
```

## Infrastructure Monitoring

### Firebase Monitoring

#### Firestore Metrics

- **Read Operations**: Number of document reads
- **Write Operations**: Number of document writes
- **Connection Count**: Active database connections
- **Query Performance**: Slow query detection

#### Authentication Metrics

- **Active Users**: Currently logged in users
- **Token Validations**: Authentication attempts
- **Registration Rate**: New user signups
- **Login Success Rate**: Successful vs failed logins

### External API Monitoring

#### Google Places API

- **Request Volume**: Number of API calls
- **Response Times**: API response latency
- **Error Rate**: Failed requests percentage
- **Quota Usage**: Daily/monthly usage tracking

#### OpenRouter API

- **Request Volume**: AI model requests
- **Token Usage**: Credit consumption
- **Model Performance**: Response quality metrics
- **Error Rate**: Model failure rate

### Server Infrastructure

#### Resource Utilization

- **CPU Usage**: Processor utilization
- **Memory Usage**: RAM consumption
- **Disk Usage**: Storage utilization
- **Network I/O**: Bandwidth usage

#### Container Monitoring

- **Container Health**: Process status
- **Restart Frequency**: Container restart count
- **Resource Limits**: Memory/CPU limits
- **Log Output**: Container standard output

## Alerting

### Critical Alerts

#### Infrastructure Alerts

- **Service Down**: Application not responding
- **Database Connection Lost**: Firestore unavailable
- **External API Failure**: Third-party service down
- **High Error Rate**: >5% error rate sustained

#### Security Alerts

- **Brute Force Attack**: Multiple failed logins
- **Rate Limit Abuse**: Excessive request rates
- **Suspicious IP Activity**: Unusual access patterns
- **Data Breach Attempt**: Unauthorized access attempts

### Warning Alerts

#### Performance Alerts

- **High Response Time**: >2s response time
- **Memory Usage**: >80% memory utilization
- **Database Slow Queries**: >1s query time
- **API Quota Warning**: 80% of quota used

#### Usage Alerts

- **User Registration Spike**: Unusual signup rate
- **Popular Destination Surge**: Search volume spike
- **Feature Usage Change**: Unusual usage patterns
- **Error Rate Increase**: Gradual error rate rise

### Alert Configuration

#### Alert Thresholds

```javascript
const ALERT_THRESHOLDS = {
  error_rate: 0.05, // 5% error rate
  response_time: 2000, // 2 second response time
  memory_usage: 0.8, // 80% memory usage
  rate_limit_violations: 100, // 100 violations per hour
  failed_logins: 50, // 50 failed logins per hour
};
```

#### Alert Recipients

- **Critical**: On-call engineer, Slack #alerts
- **Warning**: Development team, Slack #dev-alerts
- **Info**: Product team, Slack #analytics

## Log Analysis

### Query Examples

#### Find Error Patterns

```javascript
// Find most common error types
db.logs.aggregate([
  { $match: { level: "ERROR" } },
  { $group: { _id: "$code", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Find users with most authentication failures
db.logs.aggregate([
  { $match: { category: "auth", message: /failed/ } },
  { $group: { _id: "$userId", failures: { $sum: 1 } } },
  { $sort: { failures: -1 } },
]);
```

#### Performance Analysis

```javascript
// Find slowest endpoints
db.logs.aggregate([
  { $match: { category: "api" } },
  {
    $group: {
      _id: "$path",
      avgResponseTime: { $avg: "$responseTime" },
      maxResponseTime: { $max: "$responseTime" },
    },
  },
  { $sort: { avgResponseTime: -1 } },
]);

// Find peak usage times
db.logs.aggregate([
  { $match: { category: "api" } },
  {
    $group: {
      _id: { $hour: "$timestamp" },
      requests: { $sum: 1 },
    },
  },
  { $sort: { requests: -1 } },
]);
```

### Log Retention

#### Retention Policy

- **Last 30 days**: All logs retained
- **30-90 days**: Error logs only
- **90+ days**: Aggregated metrics only

#### Storage Requirements

- **Daily log volume**: ~100MB (moderate usage)
- **Monthly log volume**: ~3GB
- **Annual storage**: ~36GB (full retention)

## Best Practices

### Log Management

#### What to Log

✅ **Do Log:**

- Authentication attempts (success/failure)
- API request/response details
- Error conditions and stack traces
- Security events and violations
- Performance metrics
- Business-critical operations

❌ **Don't Log:**

- Sensitive user data (passwords, tokens)
- Credit card numbers or payment info
- Personal identifiable information (PII)
- Large request/response bodies
- Repetitive successful operations

#### Log Security

- **Sanitize sensitive data**: Remove PII from logs
- **Use structured logging**: JSON format for parsing
- **Implement log rotation**: Prevent disk space issues
- **Secure log transmission**: Encrypt logs in transit
- **Access control**: Restrict log access to authorized personnel

### Monitoring Strategy

#### Health Checks

```javascript
// Implement health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: checkDatabase(),
      external_apis: checkExternalAPIs(),
      memory_usage: checkMemory(),
      disk_space: checkDiskSpace(),
    },
  });
});
```

#### Monitoring Dashboard

Create dashboards showing:

- **Real-time API metrics**: Request rate, response time, error rate
- **User activity**: Active users, popular features, geographic distribution
- **System health**: Server resources, database performance
- **Security metrics**: Authentication failures, rate limit violations

#### Performance Baseline

Establish performance baselines for:

- **Response time**: 95th percentile < 1s
- **Error rate**: < 1% for public endpoints, < 0.1% for authenticated
- **Availability**: 99.9% uptime
- **Throughput**: Support 1000 concurrent users

### Alerting Best Practices

#### Alert Fatigue Prevention

- **Specific alerts**: Clear, actionable alerts
- **Reasonable thresholds**: Not too sensitive
- **Alert grouping**: Group related alerts
- **Escalation procedures**: Clear response protocols

#### Response Procedures

1. **Acknowledge alert**: Confirm receipt
2. **Assess severity**: Determine impact
3. **Investigate**: Check logs, metrics, recent changes
4. **Mitigate**: Take immediate corrective action
5. **Communicate**: Update stakeholders
6. **Post-mortem**: Document lessons learned

### Tool Recommendations

#### Application Performance Monitoring (APM)

- **Firebase Performance**: Built-in Firebase monitoring
- **DataDog**: Comprehensive APM solution
- **New Relic**: Performance and error tracking
- **Sentry**: Error tracking and performance monitoring

#### Infrastructure Monitoring

- **Google Cloud Monitoring**: For GCP deployments
- **AWS CloudWatch**: For AWS deployments
- **Prometheus + Grafana**: Open-source monitoring stack
- **Datadog Infrastructure**: Server and container monitoring

#### Log Management

- **Firebase Logging**: Built-in log aggregation
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Splunk**: Enterprise log analysis
- **Papertrail**: Simple log management

---

**Last Updated**: 2025-11-11  
**Version**: 1.0.0  
**Environment**: Production Ready
