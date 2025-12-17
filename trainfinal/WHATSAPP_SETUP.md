# WhatsApp Notification Setup

## Overview
The system now sends WhatsApp notifications to passengers after successful booking with their ticket details.

## Features Added
1. ✅ Phone number field in passenger information
2. ✅ WhatsApp notification sent to first passenger's phone
3. ✅ Message includes: PNR, train details, journey date, amount
4. ✅ Automatic notification after successful payment

## Setup Instructions

### 1. Get Twilio Account (Free Trial Available)
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your phone number

### 2. Get Twilio Credentials
1. Go to https://console.twilio.com
2. Copy your **Account SID**
3. Copy your **Auth Token**

### 3. Enable WhatsApp Sandbox
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join the sandbox by sending a code to the Twilio WhatsApp number
3. Copy the **WhatsApp Sandbox Number** (e.g., +14155238886)

### 4. Configure Environment Variables
Edit `backend/.env` and add:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 5. Test the Feature
1. Restart your backend server
2. Create a booking with a phone number (format: +911234567890)
3. Complete the payment
4. Check WhatsApp for the notification!

## Phone Number Format
- Must include country code
- Format: `+[country_code][number]`
- Example: `+911234567890` (India)
- Example: `+14155551234` (USA)

## Production Setup
For production use:
1. Upgrade to a paid Twilio account
2. Request WhatsApp Business API access
3. Get your own WhatsApp Business number approved
4. Update the `TWILIO_WHATSAPP_NUMBER` in .env

## Troubleshooting
- **No message received**: Check if phone number is in correct format with country code
- **Twilio error**: Verify credentials in .env file
- **Sandbox error**: Make sure the recipient has joined the Twilio sandbox
- **Message not sent**: Check backend console for error logs

## Note
- WhatsApp notifications are optional - bookings work without Twilio setup
- If Twilio credentials are not configured, bookings proceed normally without notifications
- Only the first passenger receives the WhatsApp notification
