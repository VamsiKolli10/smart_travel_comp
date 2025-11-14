# Smart Travel Companion - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Public Endpoints](#public-endpoints)
6. [Protected Endpoints](#protected-endpoints)
7. [User Management](#user-management)
8. [Code Examples](#code-examples)

## Overview

Base URL: `https://your-api-domain.com/api`

The Smart Travel Companion API provides travel-related services including translation, phrasebooks, accommodation search, and points of interest discovery.

### Production Status

The application is **production-ready** with:

- ✅ Multi-layer rate limiting (role-based, method-based, endpoint-specific)
- ✅ Comprehensive security headers and CORS configuration
- ✅ Standardized error handling and logging
- ✅ Authentication with Firebase JWT tokens
- ✅ Role-based access control (Anonymous, User, Admin)
- ✅ Monitoring and alerting capabilities
- ✅ All user workflows tested and verified

For deployment instructions, see: `PRODUCTION_DEPLOYMENT.md`
For environment setup, see: `ENVIRONMENT_VARIABLES.md`
For monitoring guidelines, see: `MONITORING_LOGGING.md`

### Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Authentication

### Bearer Token Authentication

All protected endpoints require a Firebase JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Token Format

- Standard JWT token from Firebase Authentication
- Includes user ID, email, roles, and expiration
- Must be valid and not expired

## Rate Limiting

### Rate Limit Headers

All responses include rate limiting headers:

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60000
```

### Rate Limits by Role

| Role      | Requests/Minute | Reset Window |
| --------- | --------------- | ------------ |
| Anonymous | 20              | 60 seconds   |
| User      | 60              | 60 seconds   |
| Admin     | 120             | 60 seconds   |

### Endpoint-Specific Limits

| Endpoint                   | Requests/Minute | Notes       |
| -------------------------- | --------------- | ----------- |
| `/api/users`               | 20              | Admin only  |
| `/api/translate`           | 30              | Per user    |
| `/api/phrasebook/generate` | 10              | Per user    |
| `/api/stays/search`        | 40              | Per user    |
| `/api/stays/photo`         | 300             | Photo proxy |
| `/api/poi/search`          | 60              | Per user    |
| `/api/itinerary/generate`  | 12              | AI itinerary planner          |
| `/api/culture/brief`       | 20 / 40 / 80    | Role-based (anon/user/admin)  |
| `/api/culture/qa`          | 10              | Culture coach (per IP)        |
| `/api/culture/contextual`  | 60              | Micro-tips (per IP)           |

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Error Codes

| Code                     | HTTP Status | Description                       |
| ------------------------ | ----------- | --------------------------------- |
| `UNAUTHORIZED`           | 401         | Missing or invalid authentication |
| `FORBIDDEN`              | 403         | Insufficient permissions          |
| `NOT_FOUND`              | 404         | Resource not found                |
| `VALIDATION_ERROR`       | 400         | Invalid request data              |
| `RATE_LIMIT_EXCEEDED`    | 429         | Rate limit exceeded               |
| `EXTERNAL_SERVICE_ERROR` | 502         | External API failure              |
| `DB_ERROR`               | 500         | Database operation failed         |

## Public Endpoints

### Search Accommodations

Search for hotels and other accommodations.

**Endpoint:** `GET /api/stays/search`

**Parameters:**

- `dest` (string, optional): Destination city name
- `lat` (number, optional): Latitude coordinate
- `lng` (number, optional): Longitude coordinate
- `rating` (number, optional): Minimum rating (1-5)
- `distance` (number, optional): Search radius in km (default: 5)
- `type` (string, optional): Comma-separated accommodation types
- `amenities` (string, optional): Comma-separated required amenities
- `page` (number, optional): Page number (default: 1)
- `lang` (string, optional): Language code (default: "en")

**Response Fields:**

- `resolvedDestination` (object, optional): Present when a `dest` query was supplied and successfully geocoded. Includes `query`, `display`, `address`, `city`, `state`, `country`, `lat`, and `lng`.

**Example Request:**

```http
GET /api/stays/search?dest=Paris&distance=3&rating=4&type=hotel&lang=en
```

**Example Response:**

```json
{
  "items": [
    {
      "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Hotel Example",
      "type": "hotel",
      "description": "A beautiful hotel in Paris",
      "rating": 4.5,
      "reviewsCount": 234,
      "photos": [
        {
          "url": "https://example.com/photo.jpg"
        }
      ],
      "price": {
        "priceLevel": "$$$",
        "nightlyRate": 200
      },
      "amenities": ["WiFi", "Pool", "Gym"],
      "location": {
        "address": "123 Main St, Paris",
        "lat": 48.8566,
        "lng": 2.3522,
        "distanceKm": 1.2
      }
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 45,
  "resolvedDestination": {
    "query": "Paris",
    "display": "Paris, France",
    "address": "Paris, France",
    "city": "Paris",
    "state": "",
    "country": "France",
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

### Get Accommodation Details

Get detailed information about a specific accommodation.

**Endpoint:** `GET /api/stays/{id}`

**Parameters:**

- `lang` (string, optional): Language code (default: "en")

**Example Request:**

```http
GET /api/stays/ChIJN1t_tDeuEmsRUsoyG83frY4?lang=en
```

**Example Response:**

```json
{
  "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Hotel Example",
  "type": "hotel",
  "description": "A beautiful hotel in the heart of Paris",
  "rating": 4.5,
  "reviewsCount": 234,
  "price": {
    "priceLevel": "$$$",
    "nightlyRate": 200,
    "currency": "EUR"
  },
  "amenities": ["WiFi", "Pool", "Gym", "Restaurant"],
  "location": {
    "address": "123 Main St, Paris 75001",
    "lat": 48.8566,
    "lng": 2.3522
  },
  "photos": [
    {
      "url": "https://example.com/photo1.jpg",
      "caption": "Hotel exterior"
    }
  ]
}
```

### Proxy Accommodation Photos

Proxy endpoint for accessing accommodation photos.

**Endpoint:** `GET /api/stays/photo`

**Parameters:**

- `name` (string): Place name from Places API
- `ref` (string): Photo reference from Places API
- `maxWidth` (number, optional): Maximum width in pixels
- `maxHeight` (number, optional): Maximum height in pixels

**Example Request:**

```http
GET /api/stays/photo?ref=CnBoAAA&maxWidth=800
```

### Search Points of Interest

Search for points of interest and attractions.

**Endpoint:** `GET /api/poi/search`

**Parameters:**

- `dest` (string, optional): Destination city name
- `lat` (number, optional): Latitude coordinate
- `lng` (number, optional): Longitude coordinate
- `distance` (number, optional): Search radius in km (default: 5)
- `category` (string, optional): POI category
- `kidFriendly` (boolean, optional): Filter for kid-friendly places
- `accessibility` (boolean, optional): Filter for accessible places
- `openNow` (boolean, optional): Filter for currently open places
- `timeNeeded` (string, optional): Expected visit duration
- `cost` (string, optional): Cost level filter
- `lang` (string, optional): Language code (default: "en")
- `page` (number, optional): Page number (default: 1)

**Response Fields:**

- `resolvedDestination` (object, optional): Same structure as the stays search endpoint; returned when a textual `dest` was provided and resolved (fields: `query`, `display`, `address`, `city`, `state`, `country`, `lat`, `lng`).

**Example Request:**

```http
GET /api/poi/search?dest=Rome&distance=3&category=museum&kidFriendly=true
```

**Example Response:**

```json
{
  "items": [
    {
      "id": "ChIJ2XeUam9cHRMRIdPqlGObTpU",
      "name": "Vatican Museums",
      "category": "museum",
      "description": "World-famous museums with incredible art collections",
      "rating": 4.6,
      "reviewsCount": 15420,
      "price": {
        "priceLevel": "$$",
        "admissionPrice": 17
      },
      "location": {
        "address": "Viale Vaticano, 00165 Roma RM",
        "lat": 41.9039,
        "lng": 12.4544,
        "distanceKm": 2.1
      },
      "hours": {
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00"
      },
      "photos": [
        {
          "url": "https://example.com/poi1.jpg"
        }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20,
  "resolvedDestination": {
    "query": "Rome",
    "display": "Rome, Italy",
    "address": "Rome, Italy",
    "city": "Rome",
    "state": "",
    "country": "Italy",
    "lat": 41.9028,
    "lng": 12.4964
  }
}
```

### Itinerary

Generate an AI-assisted itinerary used by the Discover page (Itinerary planner beta) and Destination Details deep-links.

**Endpoint:** `GET /api/itinerary/generate`
**Access:** Public
**Rate Limit:** 12 requests/minute (in addition to role-based limits)

**Query Parameters:**

- One of:
  - `placeId` (string): Google Place ID (e.g., `places/ChIJ...`)
  - `dest` (string): Free-text destination (city/area) to geocode
  - `lat` (number) and `lng` (number): Coordinates to anchor the plan
- `days` (number, optional): e.g. `1`–`14` (defaults to 3 in the current implementation)
- `budget` (string, optional): `low` | `mid` | `high` (default: `mid`)
- `pace` (string, optional): `relaxed` | `balanced` | `packed` (default: `balanced`)
- `season` (string, optional): `any` | `spring` | `summer` | `autumn` | `winter` (default: `any`)
- `interests` (string, optional): Comma-separated interests (e.g., `food,culture,nightlife`)
- `lang` (string, optional): Language hint for place lookup (default: `en`)

**Example Response:**

```json
{
  "destination": { "id": "places/ChIJ...", "name": "Paris" },
  "params": {
    "days": 3,
    "budget": "mid",
    "pace": "balanced",
    "season": "any",
    "interests": "food,culture"
  },
  "days": [
    {
      "day": 1,
      "blocks": [
        {
          "title": "Morning in Le Marais",
          "description": "Coffee and pastry, architecture walk, boutique stops",
          "time": "09:00"
        }
      ]
    }
  ],
  "tips": [
    "Group nearby stops to reduce transit time.",
    "Pre-book timed entries for popular museums."
  ]
}
```

Get detailed information about a specific point of interest.

**Endpoint:** `GET /api/poi/{id}`

**Parameters:**

- `lang` (string, optional): Language code (default: "en")

**Example Request:**

```http
GET /api/poi/ChIJ2XeUam9cHRMRIdPqlGObTpU?lang=en
```

### Culture Intelligence Brief

Generate a structured etiquette brief for a destination. Responses are cached in Firestore (`cultureIntelligenceBriefs`) for 24 hours per destination/culture/language combination; bump `CULTURE_BRIEF_CACHE_VERSION` or send `refresh=1` to bypass.

- **Endpoint:** `GET /api/culture/brief`
- **Access:** Public
- **Rate Limit:** Role-based (20 req/min anonymous, 40 user, 80 admin) in addition to the global limiter

**Query Parameters:**

- `destination` (string, required): City/country or region (e.g., `Tokyo`, `Oaxaca`)
- `culture` (string, optional): Override cultural lens (defaults to `destination`)
- `language` (string, optional): ISO code for localized output (default `en`)
- `refresh` or `forceRefresh` (string, optional): `1`, `true`, or `force` skips the cache for a fresh brief

**Example Request:**

```http
GET /api/culture/brief?destination=Tokyo&language=en
```

**Example Response:**

```json
{
  "destination": "Tokyo",
  "culture": "Japan",
  "language": "en",
  "categories": {
    "greetings": [
      "Offer a slight bow when greeting elders or service staff.",
      "Use honorifics such as -san after surnames unless invited otherwise.",
      "Avoid overly firm handshakes; gentle and brief is preferred."
    ],
    "dining": [
      "Never stick chopsticks upright in rice—it resembles funeral rites.",
      "Use the opposite end of chopsticks to take food from shared plates.",
      "Slurping noodles is acceptable and can signal enjoyment."
    ],
    "dress_code": [
      "Dress smart-casual when visiting shrines or nicer restaurants.",
      "Cover shoulders and knees in religious spaces.",
      "Carry easy-to-remove shoes for homes or traditional inns."
    ],
    "gestures": [
      "Avoid pointing directly at people; use an open hand instead.",
      "Be mindful of personal space, especially on public transit.",
      "Hand items (business cards, receipts) with both hands."
    ],
    "taboos": [
      "Do not talk loudly on trains or buses.",
      "Avoid eating while walking in quiet neighborhoods.",
      "Refrain from tipping—service charges are included."
    ],
    "safety_basics": [
      "Keep cash handy; many smaller shops remain cash-first.",
      "Late-night trains stop running around midnight—plan routes ahead."
    ]
  },
  "generatedAt": "2025-02-02T09:12:44.000Z"
}
```

### Culture Coach Q&A

Conversational endpoint for follow-up etiquette or safety questions. Useful for chat-style UIs on the Destination Details page.

- **Endpoint:** `POST /api/culture/qa`
- **Access:** Public
- **Rate Limit:** 10 requests/minute per IP (layered with the global/role limiter)

**Request Body:**

```json
{
  "destination": "Mexico City",
  "culture": "Mexico",
  "language": "es",
  "question": "Is it okay to bargain at artisan markets?",
  "history": [
    { "q": "Any tipping norms for restaurants?", "a": "Leave 10-15% in MXN." }
  ]
}
```

- `destination` (string, required)
- `question` (string, required)
- `culture` (string, optional)
- `language` (string, optional, defaults to `en`)
- `history` (array, optional): Up to 6 `{ q, a }` pairs are trimmed and sanitized

**Example Response:**

```json
{
  "answer": "Polite bargaining is expected at many craft markets—start around 10% below the asking price, smile, and accept if the vendor holds firm. Chain stores or clearly marked boutiques typically do not negotiate.",
  "highlights": [
    "Use lighthearted tone; avoid aggressive haggling.",
    "Have small bills ready so you can settle quickly."
  ]
}
```

### Contextual Culture Tips

Returns 1–3 micro-tips scoped to the traveler’s immediate action (translation, phrasebook, POI, or stay detail).

- **Endpoint:** `POST /api/culture/contextual`
- **Access:** Public
- **Rate Limit:** 60 requests/minute per IP

**Request Body:**

```json
{
  "contextType": "translation",
  "destination": "Istanbul",
  "language": "tr",
  "text": "Where can I find a mosque?",
  "sourceLang": "en",
  "targetLang": "tr"
}
```

- `contextType` (string, required): `translation` | `phrasebook` | `poi` | `stay`
- Shared optional fields: `destination`, `language`
- When `contextType` is `translation`, include `text`, `sourceLang`, `targetLang`
- When `phrasebook`, send `topic` and optional `phrases[]`
- When `poi` or `stay`, pass a structured `poi`/`stay` object or `metadata`

**Example Response:**

```json
{
  "tips": [
    "When asking for a mosque, add a brief 'tesekkür ederim' (thank you) afterward.",
    "Dress modestly and have a scarf/hat ready if the person offers to guide you inside."
  ],
  "severity": "info"
}
```

### Legacy Cultural Etiquette (Compatibility)

`GET /api/cultural-etiquette` remains available for older clients and simply proxies the modern culture brief implementation. It accepts the same query parameters (`destination`, optional `culture`/`language`) but new integrations should call `/api/culture/brief` directly to benefit from caching and rate-limit headers.

## Protected Endpoints

### Translate Text

Translate text between supported language pairs.

**Endpoint:** `POST /api/translate`

**Authentication:** Required (User or Admin role)

**Request Body:**

```json
{
  "text": "Hello, how are you?",
  "langPair": "en-es"
}
```

**Supported Language Pairs:**

- `en-es` (English ↔ Spanish)
- `en-fr` (English ↔ French)
- `en-de` (English ↔ German)
- `es-fr` (Spanish ↔ French)
- `es-de` (Spanish ↔ German)
- `fr-de` (French ↔ German)

**Example Response:**

```json
{
  "translation": "Hola, ¿cómo estás?"
}
```

### Generate Phrasebook

Generate AI-powered travel phrasebooks.

**Endpoint:** `POST /api/phrasebook/generate`

**Authentication:** Required (User or Admin role)

**Request Body:**

```json
{
  "topic": "restaurant",
  "sourceLang": "en",
  "targetLang": "es"
}
```

**Parameters:**

- `topic` (string): Travel topic (e.g., "restaurant", "shopping", "emergency")
- `sourceLang` (string): Source language code
- `targetLang` (string): Target language code

**Example Response:**

```json
{
  "topic": "restaurant",
  "sourceLang": "en",
  "targetLang": "es",
  "phrases": [
    {
      "phrase": "¿Tienen una mesa para dos?",
      "transliteration": "¿Tahn een oo-nah meh-sah parah dohs?",
      "meaning": "Do you have a table for two?",
      "usageExample": "¿Tienen una mesa para dos personas, por favor?"
    },
    {
      "phrase": "¿Podría ver el menú?",
      "transliteration": "¿Poh-dree-ah vehr ehl meh-noo?",
      "meaning": "Could I see the menu?",
      "usageExample": "Al llegar al restaurante, pregunté: '¿Podría ver el menú?'"
    }
  ]
}
```

### List Saved Phrases

Get user's saved phrases.

**Endpoint:** `GET /api/saved-phrases`

**Authentication:** Required (User or Admin role)

**Example Response:**

```json
{
  "items": [
    {
      "id": "phrase_123",
      "phrase": "Hola, ¿cómo estás?",
      "transliteration": "OH-lah, KOH-moh ehs-TAHS?",
      "meaning": "Hello, how are you?",
      "usageExample": "Standard greeting when meeting someone",
      "topic": "greetings",
      "sourceLang": "es",
      "targetLang": "en",
      "createdAt": "2025-11-11T07:00:00Z"
    }
  ]
}
```

### Save Phrase

Save a phrase to user's collection.

**Endpoint:** `POST /api/saved-phrases`

**Authentication:** Required (User or Admin role)

**Request Body:**

```json
{
  "phrase": "Buen día",
  "transliteration": "Bwehn DEE-ah",
  "meaning": "Good day",
  "usageExample": "Standard greeting in the morning",
  "topic": "greetings",
  "sourceLang": "es",
  "targetLang": "en"
}
```

**Example Response:**

```json
{
  "id": "phrase_456"
}
```

### Delete Saved Phrase

Delete a saved phrase.

**Endpoint:** `DELETE /api/saved-phrases/{id}`

**Authentication:** Required (User or Admin role)

**Example Response:**

```json
{
  "ok": true
}
```

## User Management

### Get User Profile

Get current user's profile information.

**Endpoint:** `GET /api/profile`

**Authentication:** Required (any role)

**Example Response:**

```json
{
  "uid": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["user"]
}
```

### List Users (Admin Only)

Get list of all users.

**Endpoint:** `GET /api/users`

**Authentication:** Required (Admin role)

**Example Response:**

```json
[
  {
    "uid": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"],
    "createdAt": "2025-11-01T10:00:00Z"
  }
]
```

### Create User (Admin Only)

Create a new user.

**Endpoint:** `POST /api/users`

**Authentication:** Required (Admin role)

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "roles": ["user"]
}
```

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

const API_BASE = "https://your-api-domain.com/api";
const authToken = "your-jwt-token";

// Search accommodations
async function searchHotels() {
  try {
    const response = await axios.get(`${API_BASE}/stays/search`, {
      params: {
        dest: "Paris",
        distance: 3,
        rating: 4,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// Translate text
async function translateText() {
  try {
    const response = await axios.post(
      `${API_BASE}/translate`,
      {
        text: "Hello world",
        langPair: "en-es",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// Fetch a culture brief
async function fetchCultureBrief() {
  try {
    const response = await axios.get(`${API_BASE}/culture/brief`, {
      params: {
        destination: "Kyoto",
        language: "en",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}
```

### Python

```python
import requests

API_BASE = 'https://your-api-domain.com/api'
auth_token = 'your-jwt-token'
headers = {
    'Authorization': f'Bearer {auth_token}',
    'Content-Type': 'application/json'
}

def search_hotels():
    try:
        response = requests.get(
            f'{API_BASE}/stays/search',
            params={
                'dest': 'Paris',
                'distance': 3,
                'rating': 4
            },
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f'Error: {error}')

def translate_text():
    try:
        response = requests.post(
            f'{API_BASE}/translate',
            json={
                'text': 'Hello world',
                'langPair': 'en-es'
            },
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f'Error: {error}')

def get_culture_brief():
    try:
        response = requests.get(
            f'{API_BASE}/culture/brief',
            params={
                'destination': 'Seoul',
                'language': 'en'
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f'Error: {error}')
```

### cURL

```bash
# Search accommodations
curl -X GET "https://your-api-domain.com/api/stays/search?dest=Paris&distance=3" \
  -H "Content-Type: application/json"

# Translate text (authenticated)
curl -X POST "https://your-api-domain.com/api/translate" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "langPair": "en-es"
  }'

# Generate phrasebook (authenticated)
curl -X POST "https://your-api-domain.com/api/phrasebook/generate" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "restaurant",
    "sourceLang": "en",
    "targetLang": "es"
  }'

# Fetch a culture brief (public)
curl -G "https://your-api-domain.com/api/culture/brief" \
  --data-urlencode "destination=Lisbon" \
  --data-urlencode "language=pt"

# Ask the culture coach (public, rate limited)
curl -X POST "https://your-api-domain.com/api/culture/qa" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Lisbon",
    "question": "Any tipping etiquette for cafes?"
  }'
```

---

**Last Updated**: 2025-11-13
**Version**: 1.1.0
**Base URL**: https://your-api-domain.com/api
