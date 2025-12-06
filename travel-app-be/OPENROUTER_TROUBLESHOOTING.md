# OpenRouter API Troubleshooting Guide

## Current Status (as of Dec 6, 2025)

✅ **All models are working correctly:**

- `tngtech/deepseek-r1t2-chimera:free` - ✅ Working
- `openai/gpt-oss-20b:free` - ✅ Working
- `z-ai/glm-4.5-air:free` - ✅ Working

## Common Causes of 503 Errors

### 1. **Intermittent Service Issues** (Most Common)

- **Cause:** Temporary server overload or maintenance on OpenRouter's side
- **Solution:** The fallback mechanism should handle this automatically
- **Status:** ✅ Your model chain is configured correctly for fallbacks

### 2. **Rate Limiting**

- **Cause:** Exceeding OpenRouter's rate limits
- **Symptoms:** 429 or 503 errors during high traffic
- **Solution:**
  - Monitor your usage in OpenRouter dashboard
  - Implement client-side rate limiting
  - Use exponential backoff for retries

### 3. **Network/Timeout Issues**

- **Cause:** Slow network connections or client-side timeouts
- **Symptoms:** Timeout errors interpreted as 503
- **Solution:**
  - Increased timeout to 60 seconds (implemented)
  - Check network connectivity

### 4. **Model Availability**

- **Cause:** Specific models temporarily unavailable
- **Solution:** Your 3-model chain provides good redundancy

## Diagnostic Tools Created

### 1. **Enhanced OpenRouter Client** (`src/lib/openrouterClient.js`)

- ✅ Added detailed logging for each API call
- ✅ Enhanced error reporting with status codes
- ✅ Improved timeout handling (60 seconds)
- ✅ Better fallback mechanism logging

### 2. **Diagnostic Script** (`diagnose-503.js`)

- Tests each model individually
- Shows real-time status of all models
- Identifies which models are failing

### 3. **Monitoring Script** (`monitor-openrouter.js`)

- Continuous monitoring every 30 seconds
- Tracks 503 errors in real-time
- Logs performance metrics

## Quick Fixes to Try

### 1. **Restart Your Server**

```bash
cd travel-app-be
npm run dev  # or your start command
```

### 2. **Test Individual Models**

```bash
cd travel-app-be
node diagnose-503.js
```

### 3. **Monitor in Real-time**

```bash
cd travel-app-be
node monitor-openrouter.js
```

### 4. **Check Environment Variables**

```bash
cd travel-app-be
node -e "require('dotenv').config(); console.log('API Key:', process.env.OPENROUTER_API_KEY ? '✅ Found' : '❌ Missing'); console.log('Model Chain:', process.env.OPENROUTER_MODEL_CHAIN);"
```

## Configuration Review

### Your Current Model Chain

```
OPENROUTER_MODEL_CHAIN=openai/gpt-oss-20b:free,tngtech/deepseek-r1t2-chimera:free,z-ai/glm-4.5-air:free
```

**Analysis:** ✅ Good configuration with 3 different free models for redundancy

### Fallback Model

```
FALLBACK_MODEL=gpt-4o-mini
```

**Note:** This is a paid model. Consider using a free fallback if budget is a concern.

## Recommended Actions

### 1. **Immediate (Done)**

- ✅ Enhanced error logging in OpenRouter client
- ✅ Created diagnostic tools
- ✅ Verified all models are working

### 2. **Monitor (Recommended)**

- Run the monitoring script to catch future 503 errors
- Check logs regularly for patterns

### 3. **Optimize (Optional)**

- Consider adding a free fallback model instead of gpt-4o-mini
- Implement client-side caching for frequently requested content
- Add exponential backoff for retries

## If 503 Errors Persist

1. **Check OpenRouter Status**

   - Visit [OpenRouter Status Page](https://status.openrouter.ai/)
   - Check for known issues

2. **Review Your Usage**

   - Log into OpenRouter dashboard
   - Check rate limits and usage statistics
   - Look for error patterns

3. **Contact Support**
   - If issues persist, contact OpenRouter support
   - Provide logs from the enhanced client

## Test Commands Summary

```bash
# Quick test
cd travel-app-be
node test-openrouter.js

# Detailed diagnosis
node diagnose-503.js

# Continuous monitoring
node monitor-openrouter.js

# Run tests
npm test
```

## Log Analysis

The enhanced OpenRouter client will now log:

- ✅ Which model succeeded
- ❌ Which models failed and why
- 🚨 503 errors specifically
- ⏱️ Response times
- 📊 Success/failure rates

Check your server logs for these enhanced messages to identify patterns.
