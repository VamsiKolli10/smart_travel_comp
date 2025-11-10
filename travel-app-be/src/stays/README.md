# Stays Service

This service provides accommodation search and details functionality.

## API Providers

The service currently supports two API providers for hotel and lodging data:

1. **Google Places API** (Legacy)

   - File: `providers/googlePlaces.js`
   - Description: Uses the Google Places API to search for lodging.
   - API Base URL: `https://places.googleapis.com/v1`
   - Environment Variable: `GOOGLE_PLACES_API_KEY`

2. **Google Hotels API** (New)
   - File: `providers/googleHotels.js`
   - Description: Uses the Google Hotels API to search for hotels.
   - API Base URL: `https://travel.googleapis.com/v1`
   - Environment Variable: `GOOGLE_HOTELS_API_KEY`

## Switching Providers

To use a different API provider, update the imports in `routes/staysRoutes.js` to use the desired provider:

```javascript
// For Google Places API
const {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  fetchById,
  ensureKey,
  GOOGLE_API_KEY,
  PLACES_BASE_URL,
} = require("../stays/providers/googlePlaces");

// For Google Hotels API
const {
  geocodeCity,
  nearbyLodging,
  toResultItem,
  fetchById,
  ensureKey,
  GOOGLE_HOTELS_API_KEY,
  HOTELS_BASE_URL,
} = require("../stays/providers/googleHotels");
```

## Environment Variables

Make sure to set the appropriate API key environment variable:

```
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

or

```
GOOGLE_HOTELS_API_KEY=your_google_hotels_api_key
```

## Provider-Specific Features

### Google Places API

- **Strengths**: Broader range of accommodation types, including hostels, apartments, and unique stays
- **Data Model**: Uses the Google Places data model
- **Photo Handling**: Requires special proxy endpoint to handle photos

### Google Hotels API

- **Strengths**: More detailed hotel-specific data, integration with booking information
- **Data Model**: Uses the Google Hotels data model
- **Photo Handling**: Direct photo URLs from the API
- **Search Window**: Supports date-specific searches (check-in, check-out)
- **Booking Information**: Includes booking links in the response

## Error Handling

Both providers implement the same error handling pattern:

- Standardized error responses using `createErrorResponse`
- Detailed error logging with context
- Consistent error codes (NOT_FOUND, EXTERNAL_SERVICE_ERROR, etc.)
