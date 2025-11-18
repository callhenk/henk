#!/bin/bash

# Twilio Setup Verification Script
# This script helps verify your Twilio configuration for the Voice SDK

echo "=========================================="
echo "Twilio Setup Verification"
echo "=========================================="
echo ""

# Load environment variables
if [ -f "apps/web/.env.local" ]; then
    source apps/web/.env.local
else
    echo "❌ Error: apps/web/.env.local not found"
    exit 1
fi

# Check required environment variables
echo "✓ Checking environment variables..."
echo ""

variables=(
    "TWILIO_ACCOUNT_SID"
    "TWILIO_API_KEY_SID"
    "TWILIO_API_KEY_SECRET"
    "TWILIO_TWIML_APP_SID"
    "TWILIO_PHONE_NUMBER"
)

all_set=true
for var in "${variables[@]}"; do
    value="${!var}"
    if [ -z "$value" ]; then
        echo "❌ $var is not set"
        all_set=false
    else
        # Mask sensitive values
        if [[ "$var" == *"SECRET"* ]] || [[ "$var" == *"KEY"* ]]; then
            masked="${value:0:6}..."
            echo "✓ $var = $masked"
        else
            echo "✓ $var = $value"
        fi
    fi
done

echo ""

if [ "$all_set" = false ]; then
    echo "❌ Some environment variables are missing"
    echo "Please check your .env.local file"
    exit 1
fi

# Test TwiML endpoint
echo "=========================================="
echo "Testing TwiML Endpoint"
echo "=========================================="
echo ""

TEST_NUMBER="+17753068818"
echo "Testing with phone number: $TEST_NUMBER"
echo ""

response=$(curl -s -X POST http://localhost:3000/api/twilio/twiml \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "To=%2B17753068818&CallerId=%2B17753068818")

if echo "$response" | grep -q "<Dial"; then
    echo "✓ TwiML endpoint is working!"
    echo ""
    echo "Response:"
    echo "$response"
else
    echo "❌ TwiML endpoint returned an error:"
    echo "$response"
    exit 1
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "Your TwiML endpoint is working locally, but Twilio needs to access it."
echo ""
echo "Choose one option:"
echo ""
echo "Option 1: Local Development with ngrok"
echo "---------------------------------------"
echo "1. Install ngrok: brew install ngrok"
echo "2. Start ngrok: ngrok http 3000"
echo "3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "4. Go to: https://console.twilio.com/us1/develop/voice/manage/twiml-apps/$TWILIO_TWIML_APP_SID"
echo "5. Set Voice Request URL to: https://YOUR-NGROK-URL.ngrok.io/api/twilio/twiml"
echo "6. Set Request Method to: HTTP POST"
echo "7. Save and test your call!"
echo ""
echo "Option 2: Production Testing"
echo "---------------------------------------"
echo "1. Go to: https://console.twilio.com/us1/develop/voice/manage/twiml-apps/$TWILIO_TWIML_APP_SID"
echo "2. Set Voice Request URL to: https://app.callhenk.com/api/twilio/twiml"
echo "3. Set Request Method to: HTTP POST"
echo "4. Save and test at: https://app.callhenk.com/home/calls"
echo ""
echo "=========================================="
echo ""
