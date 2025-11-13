# API Documentation

## API Overview

This API provides endpoints for user management, translation services, phrase generation, saved phrases, and lodging searches. The API is built with Express.js and uses Firestore as its primary database.

## Error Handling

The API implements a standardized error handling system to provide consistent error responses across all endpoints:

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      /* Optional additional error context */
    }
  }
}
```

### Error Codes

The following error codes are used throughout the API:

- **INTERNAL_ERROR**: Generic server error
- **NOT_FOUND**: Requested resource not found
- **BAD_REQUEST**: Invalid request parameters
- **UNAUTHORIZED**: Authentication required or failed
- **FORBIDDEN**: Insufficient permissions
- **METHOD_NOT_ALLOWED**: HTTP method not supported
- **DB_ERROR**: Database operation error
- **DB_NOT_FOUND**: Document or collection not found in database
- **VALIDATION_ERROR**: Request validation failed
- **EXTERNAL_SERVICE_ERROR**: Error from external API or service
- **EXTERNAL_SERVICE_TIMEOUT**: External service timeout
- **CORS_ERROR**: CORS policy violation
- **RATE_LIMIT_EXCEEDED**: Request rate limit exceeded

### Error Logging

All errors are logged with context information including:

- Error message and stack trace
- Request URL and method
- User ID (if authenticated)
- Request body (sanitized)
- Additional contextual data

This information helps with debugging and monitoring the API.

## Rate Limiting

This API implements rate limiting to prevent abuse and ensure fair usage. The rate limits are applied in multiple dimensions:

1. **Role-based Limits**: Different limits based on user roles (admin, user, anonymous)

   - Admins: 120 requests per minute
   - Regular users: 60 requests per minute
   - Unauthenticated users: 20 requests per minute

2. **Endpoint-specific Limits**: Some endpoints have additional rate limits

   - `/api/users`: 20 requests per minute
   - `/api/translate`: 30 requests per minute
   - `/api/phrasebook/generate`: 10 requests per minute
   - `/api/stays/search`: 40 requests per minute

3. **Method-based Limits**: Different limits for different HTTP methods
   - GET: 100 requests per minute
   - POST: 50 requests per minute
   - PUT: 30 requests per minute
   - PATCH: 20 requests per minute
   - DELETE: 10 requests per minute

If a rate limit is exceeded, the API will return a 429 status code with a JSON error response:

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests for your role",
    "details": {
      "limit": 60,
      "windowMs": 60000,
      "resetTime": "2025-11-09T19:10:30.000Z"
    }
  }
}
```

The `resetTime` field indicates when the rate limit window will reset and new requests will be allowed.

## Security

This API implements several security measures to protect against common vulnerabilities and attacks:

### Authentication and Authorization

- **JWT Token Authentication**: All protected endpoints require a valid JWT token in the Authorization header.
- **Role-based Access Control**: Different endpoints require different roles (admin, user).
- **Token Expiration and Revocation**: Tokens are validated for expiration and revocation status.
- **IP-based Validation**: Tokens can be bound to specific IP addresses for additional security.

### Request Security

- **Request Signatures**: Sensitive endpoints require HMAC signatures in the request headers to ensure request integrity.
- **Timestamp Validation**: Requests must include a timestamp to prevent replay attacks.
- **User Agent Validation**: Unusual or missing user agents are flagged in strict mode.
- **Fingerprinting**: Each request is assigned a fingerprint based on IP, user agent, and other headers.

### Security Headers

The API includes several security headers by default:

- **Content-Security-Policy**: Restricts the sources of content that can be loaded.
- **X-XSS-Protection**: Enables browser XSS filtering.
- **X-Content-Type-Options**: Prevents MIME type sniffing.
- **X-Frame-Options**: Provides clickjacking protection.
- **Strict-Transport-Security**: Enforces HTTPS connections.

### Security Logging

The API logs security-related events, including:

- Authentication failures
- Authorization violations
- Suspicious request patterns
- Rate limit violations
- Invalid signatures or timestamps

## Endpoints

### User Management

- **GET /api/users**
  - **Description**: Fetch a list of users.
  - **Access**: Admin required.
  - **Rate Limit**: 20 requests per minute (additional to role-based limits).
- **POST /api/users**
  - **Description**: Add a new user.
  - **Access**: Admin required.
  - **Rate Limit**: 20 requests per minute (additional to role-based limits).
  - **Security**: Requires request signature.

### Profile

- **GET /api/profile**
  - **Description**: Retrieve the authenticated user's profile.
  - **Access**: Any authenticated user.

### Translation

- **POST /api/translate**

  - **Description**: Translate text.
  - **Access**: User or admin required.
  - **Rate Limit**: 30 requests per minute (additional to role-based limits).
  - **Security**: Requires request signature.
  - **Request Body**:
    ```json
    {
      "text": "Text to translate",
      "langPair": "en-es"
    }
    ```
  - **Response**:
    ```json
    {
      "translation": "Texto traducido"
    }
    ```

- **GET /api/translate/warmup**
  - **Description**: Warmup endpoint for translation service.
  - **Access**: Admin required.
  - **Query Parameters**:
    - `pairs`: Comma-separated list of language pairs to warm up

### Phrasebook

- **POST /api/phrasebook/generate**
  - **Description**: Generate phrases based on provided parameters.
  - **Access**: User or admin required.
  - **Rate Limit**: 10 requests per minute (additional to role-based limits).
  - **Request Body**:
    ```json
    {
      "topic": "Food",
      "sourceLang": "en",
      "targetLang": "es",
      "count": 3
    }
    ```
  - **Response**:
    ```json
    {
      "topic": "Food",
      "sourceLang": "en",
      "targetLang": "es",
      "phrases": [
        {
          "phrase": "¿Dónde está el baño?",
          "transliteration": "",
          "meaning": "Where is the bathroom?",
          "usageExample": "Disculpe, ¿dónde está el baño?"
        }
      ]
    }
    ```

### Saved Phrases

- **GET /api/saved-phrases**

  - **Description**: List saved phrases.
  - **Access**: Any authenticated user.
  - **Response**:
    ```json
    {
      "items": [
        {
          "id": "phrase_id",
          "phrase": "¿Dónde está el baño?",
          "transliteration": "",
          "meaning": "Where is the bathroom?",
          "usageExample": "Disculpe, ¿dónde está el baño?",
          "topic": "Travel",
          "sourceLang": "es",
          "targetLang": "en",
          "createdAt": "2025-11-09T12:00:00.000Z"
        }
      ]
    }
    ```

- **POST /api/saved-phrases**

  - **Description**: Add a new saved phrase.
  - **Access**: Any authenticated user.
  - **Security**: Requires request signature.
  - **Request Body**:
    ```json
    {
      "phrase": "¿Dónde está el baño?",
      "transliteration": "",
      "meaning": "Where is the bathroom?",
      "usageExample": "Disculpe, ¿dónde está el baño?",
      "topic": "Travel",
      "sourceLang": "es",
      "targetLang": "en"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "new_phrase_id"
    }
    ```

- **DELETE /api/saved-phrases/:id**
  - **Description**: Delete a saved phrase by ID.
  - **Access**: The user who created the phrase or an admin.
  - **Security**: Requires request signature.
  - **Response**:
    ```json
    {
      "ok": true
    }
    ```

### Stays

- **GET /api/stays/search**

  - **Description**: Search for lodging based on various parameters.
  - **Access**: User or admin required.
  - **Rate Limit**: 40 requests per minute (additional to role-based limits).
  - **Query Parameters**:
    - `dest`: Destination city name
    - `lat`: Latitude (required if `dest` not provided)
    - `lng`: Longitude (required if `dest` not provided)
    - `distance`: Search radius in kilometers (default: 5)
    - `type`: Comma-separated list of accommodation types
    - `amenities`: Comma-separated list of required amenities
    - `rating`: Minimum rating
    - `page`: Page number (default: 1)
    - `lang`: Language for results (default: en)
    - `checkInDate`: Check-in date (YYYY-MM-DD format, optional)
    - `checkOutDate`: Check-out date (YYYY-MM-DD format, optional)
    - `adults`: Number of adults (default: 2, optional)
  - **Response**:
    ```json
    {
      "items": [
        {
          "id": "hotel_id",
          "name": "Hotel Example",
          "type": "hotel",
          "rating": 4.5,
          "photos": [
            {
              "url": "https://example.com/photo1.jpg",
              "width": 800,
              "height": 600,
              "alt": "Hotel exterior"
            }
          ],
          "price": {
            "priceLevel": "$$"
          },
          "amenities": ["wifi", "pool", "fitness_center"],
          "location": {
            "lat": 40.7128,
            "lng": -74.006,
            "distanceKm": 1.2,
            "address": "123 Main St, New York, NY"
          },
          "provider": {
            "name": "Google Hotels",
            "deeplink": "https://hotels.google.com/hotel/example"
          }
        }
      ],
      "page": 1,
      "pageSize": 20,
      "total": 45
    }
    ```

- **GET /api/stays/photo**

  - **Description**: Fetch a photo based on URL from the Google Hotels API.
  - **Query Parameters**:
    - `photo_url`: Direct URL to the hotel photo
    - `maxWidth`: Maximum width in pixels (default: 800)
    - `maxHeight`: Maximum height in pixels
  - **Response**: Binary image data with appropriate Content-Type header

- **GET /api/stays/:id**
  - **Description**: Fetch a stay by ID.
  - **Access**: User or admin required.
  - **Query Parameters**:
    - `lang`: Language for results (default: en)
  - **Response**:
    ```json
    {
      "id": "hotel_id",
      "name": "Hotel Example",
      "type": "hotel",
      "description": "A comfortable hotel in the city center.",
      "rating": 4.5,
      "reviewsCount": 128,
      "photos": [
        {
          "url": "https://example.com/photo1.jpg",
          "width": 800,
          "height": 600,
          "alt": "Hotel exterior"
        }
      ],
      "price": {
        "priceLevel": "$$"
      },
      "amenities": ["wifi", "pool", "fitness_center"],
      "location": {
        "address": "123 Main St, New York, NY",
        "lat": 40.7128,
        "lng": -74.006,
        "distanceKm": 1.2
      },
      "phone": "+1-555-123-4567",
      "website": "https://hotel-example.com",
      "openingHours": [
        "Monday: 24 hours",
        "Tuesday: 24 hours",
        "Wednesday: 24 hours",
        "Thursday: 24 hours",
        "Friday: 24 hours",
        "Saturday: 24 hours",
        "Sunday: 24 hours"
      ],
      "provider": {
        "name": "Google Hotels",
        "deeplink": "https://hotels.google.com/hotel/example"
      },
      "thumbnail": "https://example.com/photo1.jpg"
    }
    ```

### Itinerary

- GET `/api/itinerary/generate`
  - Description: Generate a structured itinerary (1/3/7-day) for a destination using AI (OpenRouter) with a sample fallback if AI is not configured.
  - Access: Public.
  - Rate Limit: 12 requests per minute (in addition to role-based limits).
  - Query Parameters:
    - One of: `placeId` | `dest` | `lat`+`lng`
      - `placeId`: Google Place ID (e.g., `places/ChIJ...`).
      - `dest`: Free-text destination (city/area) to geocode.
      - `lat`,`lng`: Coordinates to anchor the plan.
    - `days` (optional): 1 | 3 | 7 (default: 3).
    - `budget` (optional): `low|mid|high` (default: `mid`).
    - `pace` (optional): `relaxed|balanced|packed` (default: `balanced`).
    - `season` (optional): `any|spring|summer|autumn|winter` (default: `any`).
    - `interests` (optional): Comma-separated (e.g., `food, culture`).
    - `lang` (optional): Language hint for place lookup (default: `en`).
  - Response example:
    ```json
    {
      "destination": { "id": "places/ChIJ...", "name": "Paris" },
      "params": { "days": 3, "budget": "mid", "pace": "balanced", "season": "any", "interests": "food, culture" },
      "days": [
        {
          "day": 1,
          "blocks": [
            { "title": "Activity 1", "description": "Suggested activity aligned with food", "time": "Morning" }
          ]
        }
      ],
      "tips": ["Group nearby activities to reduce transit time"]
    }
    ```

### Points of Interest (POI)

- GET `/api/poi/search`
  - Description: Search attractions and places to visit near a destination or coordinates.
  - Access: Public.
  - Rate Limit: 60 requests per minute (in addition to role-based limits).
  - Query Parameters:
    - `dest`: Free text for city/country/area (required if `lat`/`lng` not provided)
    - `lat`,`lng`: Coordinates (required if `dest` not provided)
    - `distance`: Radius in kilometers (default: 5)
    - `category`: Comma-separated categories: `museum,hike,viewpoint,food`
    - `kidFriendly`: `true|false`
    - `accessibility`: `true|false`
    - `openNow`: `true|false`
    - `timeNeeded`: `<2h|half-day|full-day`
    - `cost`: `free|paid`
    - `lang`: Result language (default: `en`)
    - `page`: Page number (default: 1)
  - Response example:
    ```json
    {
      "items": [
        {
          "id": "places/ChIJ...",
          "name": "City Museum",
          "blurb": "A comprehensive collection of local history.",
          "rating": 4.6,
          "reviewsCount": 1287,
          "categories": ["museum", "tourist_attraction"],
          "openingHours": ["Mon: Closed", "Tue: 10:00–18:00"],
          "openNow": false,
          "suggestedDuration": "half-day",
          "badges": ["Closed Mondays"],
          "photos": [{ "url": "/api/stays/photo?name=places/.../media" }],
          "thumbnail": "/api/stays/photo?name=places/.../media",
          "location": {
            "address": "123 Museum St",
            "lat": 48.8566,
            "lng": 2.3522,
            "distanceKm": 1.4
          },
          "provider": {
            "name": "Google Places",
            "deeplink": "https://maps.google.com/?cid=..."
          },
          "sourceLang": "en"
        }
      ],
      "page": 1,
      "pageSize": 20,
      "total": 37
    }
    ```

- GET `/api/poi/:id`
  - Description: Get destination details by Google Place ID (`places/<id>` or raw id).
  - Access: Public.
  - Query Parameters:
    - `lang`: Result language (default: `en`)
  - Response example:
    ```json
    {
      "id": "places/ChIJ...",
      "name": "City Museum",
      "description": "A leading museum ...",
      "rating": 4.6,
      "reviewsCount": 1287,
      "photos": [{ "url": "/api/stays/photo?name=places/.../media" }],
      "location": { "address": "123 Museum St", "lat": 48.8566, "lng": 2.3522 },
      "phone": "+33 ...",
      "website": "https://example.org",
      "openingHours": ["Mon: Closed", "Tue: 10:00–18:00"],
      "provider": { "name": "Google Places", "deeplink": "https://maps.google..." },
      "thumbnail": "/api/stays/photo?name=places/.../media"
    }
    ```
