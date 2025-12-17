# Email Notification with PDF Setup

## Overview
The system automatically sends an email with the ticket PDF attached after successful booking.

## Features
- ✅ Email sent to user's registered email
- ✅ PDF ticket attached to email
- ✅ Booking details in email body
- ✅ Professional HTML email format

## Setup Instructions

### 1. Enable Gmail App Password
1. Go to your Google Account: https://myaccount.google.com
2. Select **Security**
3. Under "Signing in to Google," select **2-Step Verification** (enable if not already)
4. At the bottom, select **App passwords**
5. Select app: **Mail**
6. Select device: **Other (Custom name)** → Enter "Train Booking"
7. Click **Generate**
8. Copy the 16-character password

### 2. Configure Environment Variables
Edit `backend/.env` and add:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### 3. Restart Backend Server
```bash
cd backend
npm start
```

### 4. Test
1. Create a booking
2. Complete payment
3. Check your email inbox for the ticket PDF!

## Email Contains
- ✅ Booking confirmation message
- ✅ PNR number
- ✅ Train details
- ✅ Journey date
- ✅ Passenger count
- ✅ Total amount
- ✅ PDF ticket attachment

## WhatsApp Link
- After booking, you'll get a popup to send WhatsApp message
- Opens WhatsApp with pre-filled booking details
- Note: WhatsApp doesn't support PDF attachments via web links
- PDF is sent via email instead

## Troubleshooting
- **Email not received**: Check spam folder
- **Authentication error**: Verify app password is correct
- **Gmail blocking**: Make sure 2-Step Verification is enabled
- **No email sent**: Check backend console for errors

## Note
Email sending is optional - bookings work without email configuration.
