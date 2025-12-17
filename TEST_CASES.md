# Train Reservation System - 25 Test Cases

## Authentication Tests (1-5)

### Test Case 1: User Registration - Valid Data
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Register" link
3. Enter Name: "John Doe"
4. Enter Email: "john@example.com"
5. Enter Password: "john123"
6. Click "Register" button
**Expected:** User registered successfully, redirected to dashboard

### Test Case 2: User Registration - Duplicate Email
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Register" link
3. Enter existing email
4. Enter password
5. Click "Register"
**Expected:** Error message "Email already exists"

### Test Case 3: User Login - Valid Credentials
**Steps:**
1. Navigate to http://localhost:3000
2. Enter Email: "john@example.com"
3. Enter Password: "john123"
4. Click "Login"
**Expected:** Redirected to dashboard, user name displayed

### Test Case 4: User Login - Invalid Credentials
**Steps:**
1. Navigate to http://localhost:3000
2. Enter Email: "wrong@example.com"
3. Enter Password: "wrong123"
4. Click "Login"
**Expected:** Error message "Invalid credentials"

### Test Case 5: User Logout
**Steps:**
1. Login as user
2. Click "Logout" button
**Expected:** Redirected to login page, session cleared

## Train Search Tests (6-10)

### Test Case 6: Load All Trains on Dashboard
**Steps:**
1. Login as user
2. Navigate to "Search Trains" section
**Expected:** All available trains displayed in train list

### Test Case 7: Search Trains - Valid Route
**Steps:**
1. Select Source: "Mumbai"
2. Select Destination: "Delhi"
3. Select Date: Tomorrow's date
4. Click "Search"
**Expected:** Trains matching route displayed

### Test Case 8: Search Trains - No Results
**Steps:**
1. Select Source: "Mumbai"
2. Select Destination: "Mumbai"
3. Click "Search"
**Expected:** "No trains available" message

### Test Case 9: Search Trains - Missing Fields
**Steps:**
1. Leave source empty
2. Select destination
3. Click "Search"
**Expected:** Error message "Please fill all fields"

### Test Case 10: View Train Details
**Steps:**
1. Search for trains
2. View train card details
**Expected:** Train name, number, route, time, fare, seats displayed

## Booking Tests (11-18)

### Test Case 11: Add Train to Cart
**Steps:**
1. Search trains
2. Click "Add to cart" on any train
**Expected:** Redirected to Cart section, train details shown

### Test Case 12: Add Single Passenger
**Steps:**
1. Add train to cart
2. Click "+ Add passenger"
3. Enter Name: "Jane Doe"
4. Enter Age: "25"
5. Enter Gender: "F"
6. Enter Phone: "+919876543210"
**Expected:** Passenger added to table

### Test Case 13: Add Multiple Passengers
**Steps:**
1. Add train to cart
2. Add 3 passengers with different details
**Expected:** All 3 passengers shown in table

### Test Case 14: Remove Passenger
**Steps:**
1. Add 2 passengers
2. Click "Remove" on first passenger
**Expected:** Passenger removed, table updated

### Test Case 15: Select Seat - Sleeper Coach
**Steps:**
1. Add passenger
2. Click "Select seat"
3. Select Coach: "S1"
4. Click seat number "15"
5. Click "Confirm"
**Expected:** Seat S1-15 assigned with berth type (LB/MB/UB)

### Test Case 16: Select Seat - AC Coach
**Steps:**
1. Add passenger
2. Click "Select seat"
3. Select Coach: "A1"
4. Click seat number "10"
5. Click "Confirm"
**Expected:** Seat A1-10 assigned

### Test Case 17: Checkout Without Seat Assignment
**Steps:**
1. Add passenger without seat
2. Enter card details
3. Click "Pay & confirm booking"
**Expected:** Error "Please assign seats to all passengers"

### Test Case 18: Complete Booking - Card Payment
**Steps:**
1. Add train to cart
2. Add passenger with seat
3. Select Payment: "Card"
4. Enter Card: "1234 5678 9012 3456"
5. Click "Pay & confirm booking"
**Expected:** Booking confirmed, PNR generated, WhatsApp link shown

## Booking Management Tests (19-21)

### Test Case 19: View My Bookings
**Steps:**
1. Complete a booking
2. Click "My Bookings"
**Expected:** Bookings grouped by date, all details shown

### Test Case 20: Download Ticket PDF
**Steps:**
1. Go to "My Bookings"
2. Click "Download PDF" on any booking
**Expected:** PDF file downloaded with ticket details

### Test Case 21: Cancel Booking - Valid (2+ days before)
**Steps:**
1. Book ticket for 3 days later
2. Click "Cancel" button
3. Confirm cancellation
**Expected:** Booking status changed to CANCELLED, refund message shown

## Transaction Tests (22-23)

### Test Case 22: View Transaction History
**Steps:**
1. Complete a booking
2. Click "Transactions"
**Expected:** Transaction shown with train, amount, method, status

### Test Case 23: Transaction Details Accuracy
**Steps:**
1. Complete booking with ₹500
2. Check transaction
**Expected:** Amount matches, card masked (XXXX-XXXX-XXXX-3456)

## Admin Panel Tests (24-25)

### Test Case 24: Admin Login and Panel Access
**Steps:**
1. Login with admin@railway.com / admin123
2. Check visible menu items
**Expected:** Only "Admin Panel" and "Logout" visible

### Test Case 25: Admin View All Bookings and Transactions
**Steps:**
1. Login as admin
2. View Admin Panel
**Expected:** All users' bookings grouped by date, all transactions with user details shown
