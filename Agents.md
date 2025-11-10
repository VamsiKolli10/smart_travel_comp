# Smart Travel Companion - Agent Guide

## Project Overview

Smart Travel Companion is a full-stack web application that provides travel-related services including translation, phrasebooks, and accommodation search. The application is built using a React frontend with a Node.js/Express backend, with Firestore as the primary database.

## Architecture Overview

The project is divided into two main components:

1. **Frontend** (travel-app-fe): React application with Material-UI for the user interface
2. **Backend** (travel-app-be): Node.js/Express API server with Firebase integration

## Directory Structure

```
travel-app-be/
├── src/
│   ├── app.js                  # Main application entry point
│   ├── config/                 # Configuration files
│   │   ├── firebase.js         # Firebase client config
│   │   └── firebaseAdmin.js    # Firebase Admin SDK config
│   ├── controllers/            # Route controllers
│   │   ├── translationController.js
│   │   ├── phrasebookController.js
│   │   └── savedPhraseController.js
│   ├── middleware/             # Express middleware
│   │   ├── authenticate.js     # Authentication middleware
│   │   └── requireFields.js    # Field validation middleware
│   ├── routes/                 # API routes
│   │   ├── translationRoutes.js
│   │   ├── phrasebookRoutes.js
│   │   ├── savedPhraseRoutes.js
│   │   └── staysRoutes.js
│   ├── stays/                  # Stays-related utilities
│   │   └── providers/          # Third-party service providers
│   ├── lib/                    # External library wrappers
│   │   └── openrouterClient.js # OpenRouter API client
│   └── utils/                  # Utility functions
│       ├── errorHandler.js     # Error handling utilities
│       ├── rateLimiter.js      # Rate limiting implementation
│       ├── security.js         # Security utilities
│       └── validation.js       # Input validation utilities
├── functions/                  # Firebase Cloud Functions
└── firebase.json               # Firebase configuration
```

```
travel-app-fe/
├── public/                     # Static assets
├── src/
│   ├── components/             # React components
│   │   ├── common/             # Shared components
│   │   ├── layout/             # Layout components
│   │   ├── pages/              # Page components
│   │   └── stays/              # Stays-related components
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.jsx     # Authentication context
│   │   ├── AnalyticsContext.jsx
│   │   ├── AppearanceContext.jsx
│   │   └── FeatureFlagsContext.jsx
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API service layer
│   │   ├── api.js              # Base API client
│   │   ├── auth.js             # Authentication services
│   │   ├── stays.js            # Stays API services
│   │   ├── translation.js      # Translation services
│   │   ├── phrasebook.js       # Phrasebook services
│   │   └── savedPhrases.js     # Saved phrases services
│   ├── store/                  # Redux store
│   │   ├── index.js            # Store configuration
│   │   └── slices/             # Redux slices
│   ├── constants/              # Application constants
│   ├── data/                   # Static data
│   ├── styles/                 # CSS styles
│   ├── firebase.js             # Firebase configuration
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Application entry point
│   └── theme.js                # MUI theme configuration
```

## Key Technologies

### Backend

- **Node.js & Express**: Web server framework
- **Firebase**: Authentication, Firestore database, Cloud Functions
- **OpenRouter**: AI text generation for phrasebooks
- **@xenova/transformers**: Text translation
- **Helmet**: Security headers
- **CORS**: Cross-Origin Resource Sharing
- **express-rate-limit**: Rate limiting

### Frontend

- **React**: UI framework
- **Material-UI (MUI)**: Component library and styling
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **React Query**: Server state management
- **Axios**: HTTP client
- **Firebase**: Authentication and client SDK

## Data Flow

### Authentication Flow

1. User enters credentials in the frontend
2. Frontend sends request to Firebase Authentication
3. Firebase returns JWT token
4. Frontend stores token and adds it to API requests
5. Backend middleware validates token
6. Protected routes are then accessible

### API Request Flow

1. Frontend components trigger API calls through service layer
2. Service layer (axios) sends HTTP requests to backend
3. Express router processes the request
4. Middleware validates authentication, rate limits, and security
5. Controller processes the request and interacts with Firestore
6. Controller returns formatted response
7. Service layer processes response and updates frontend state

### Stays Search Flow

1. User enters search parameters (destination, filters)
2. Frontend sends request to `/api/stays/search`
3. Backend geocodes destination (if provided) using Google Places API
4. Backend searches for accommodations using Google Places Nearby Search
5. Results are filtered, paginated, and formatted
6. Response is sent back to frontend
7. Frontend displays results in list or map view

### Translation Flow

1. User enters text to translate
2. Frontend sends request to `/api/translate`
3. Backend uses @xenova/transformers to translate text
4. Result is sent back to frontend
5. Frontend displays translated text

### Phrasebook Generation Flow

1. User specifies topic and language pair
2. Frontend sends request to `/api/phrasebook/generate`
3. Backend uses OpenRouter API to generate phrases
4. Phrases are formatted and sent back to frontend
5. Frontend displays generated phrases
6. User can save phrases to their personal collection

## Important Components and Patterns

### Backend Patterns

- **Error Handling**: Centralized in errorHandler.js with standardized error responses
- **Rate Limiting**: Implemented in rateLimiter.js with role-based and endpoint-specific limits
- **Security**: Enhanced in security.js with request validation and security headers
- **Authentication**: Handled by authenticate.js middleware
- **Validation**: Field validation in requireFields.js and validation.js

### Frontend Patterns

- **Context API**: Used for global state (auth, appearance, feature flags)
- **Service Layer**: Abstracts API calls from components
- **Error Boundaries**: Catches and handles React component errors
- **Custom Hooks**: Encapsulate complex logic and state management
- **Protected Routes**: Restrict access to authenticated users

## Key Data Models

### User

```javascript
{
  uid: string,
  email: string,
  name: string,
  roles: [string],
  createdAt: timestamp,
  settings: {
    language: string,
    notifications: boolean,
    theme: string
  }
}
```

### Saved Phrase

```javascript
{
  id: string,
  phrase: string,
  transliteration: string,
  meaning: string,
  usageExample: string,
  topic: string,
  sourceLang: string,
  targetLang: string,
  createdAt: timestamp,
  userId: string
}
```

### Stay

```javascript
{
  id: string,
  name: string,
  type: string,
  description: string,
  rating: number,
  reviewsCount: number,
  photos: [{ url: string }],
  price: {
    priceLevel: string,
    nightlyRate: number
  },
  amenities: [string],
  location: {
    address: string,
    lat: number,
    lng: number,
    distanceKm: number
  },
  provider: {
    name: string,
    deeplink: string
  }
}
```

## Security Features

### Authentication & Authorization

- JWT token authentication
- Role-based access control
- Token expiration and revocation
- IP-based validation

### Request Security

- Request signatures (HMAC)
- Timestamp validation
- User agent validation
- Request fingerprinting

### Security Headers

- Content-Security-Policy
- X-XSS-Protection
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security

## Testing Strategy

The project uses Jest for unit testing, with tests organized in **tests** directories next to the code they test. The frontend also uses React Testing Library for component tests.

## Deployment

The application is deployed using Firebase Hosting for the frontend and Firebase Cloud Functions for the backend. Environment variables are managed through Firebase and .env files for local development.

## Common Tasks and Their Locations

### Modifying API Endpoints

- **Backend**: Add or modify routes in `/travel-app-be/src/routes/`
- **Controllers**: Update business logic in `/travel-app-be/src/controllers/`

### Adding New Frontend Pages

- **Components**: Create in `/travel-app-fe/src/components/pages/`
- **Routes**: Add to the main router in `/travel-app-fe/src/App.jsx`

### Database Operations

- **Firestore**: Use the Firebase Admin SDK in backend
- **Client SDK**: Use in frontend for user-specific operations

### Error Handling

- **Standardize errors**: Modify `/travel-app-be/src/utils/errorHandler.js`
- **Frontend error display**: Update error handling in services and components

### Rate Limiting

- **Modify limits**: Update `/travel-app-be/src/utils/rateLimiter.js`
- **Add endpoint-specific limits**: Add to route files

## Recommendations for AI Agents

1. Before making changes, review the existing error handling, rate limiting, and security patterns to maintain consistency.
2. Test changes thoroughly in the development environment before deploying.
3. Document any new API endpoints, parameters, or responses in the API_Documentation.md file.
4. Follow the existing code style and patterns found in the codebase.
5. For UI changes, test across different screen sizes using the responsive design utilities.
6. Be mindful of rate limits when testing backend endpoints.
7. When making database changes, consider the offline capabilities of the client SDK.

## Development Workflow

1. Set up local development environment following the README.md instructions
2. Create a feature branch for new development
3. Implement changes with proper error handling and security considerations
4. Add tests for new functionality
5. Update documentation as needed
6. Submit pull request for review
7. Address feedback and merge to main branch
8. Changes are automatically deployed via CI/CD
