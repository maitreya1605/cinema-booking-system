# PIXORA — 3–5 Minute Walkthrough Video Script for Judges

**Project Name:** PIXORA — Production-Grade Cinema Ticketing & Operations Platform  
**Target Video Duration:** 4 Minutes 15 Seconds (within 3–5 minute criteria)  
**Tone:** Confident, professional, clear, engineering-focused  

---

## Pre-Recording Checklist & Setup
1. **Backend Server Running:** In terminal: `cd backend; node server.js` (Port 8000).
2. **Frontend Dev Server Running:** In terminal: `cd frontend; npm run dev` (Port 5173).
3. **Browser Tabs Prepared:**
   - **Tab 1:** `http://localhost:5173` (Customer Discovery & Booking).
   - **Tab 2:** `http://localhost:5173/admin` (Admin Operations & Live Reports).
   - **Tab 3:** Terminal window ready to demonstrate `node test.js`.
4. **Resolution:** 1080p (1920x1080), microphone tested, notifications muted.

---

## Video Timeline & Script

---

### [0:00 - 0:40] Part 1: Project Overview & Architecture
- **On Screen:** Start on the PIXORA Home Page (`http://localhost:5173`). Scroll gently down the banner and catalog.
- **Spoken Voiceover:**
  > "Hello judges and reviewers! Welcome to **PIXORA**, a complete, production-grade web application engineered for cinema hall ticket booking and multi-screen operations.
  > 
  > Under the hood, PIXORA is built as a maintainable **modular monolith** with a React and Tailwind frontend, a Node.js and Express backend, and MongoDB with Mongoose for persistence. 
  > 
  > Our design strictly adheres to three core engineering principles:
  > 1. Complete separation of UI, business logic, and transactional persistence.
  > 2. Zero trust in frontend restrictions: every role check, status transition, and seat lock is validated server-side.
  > 3. Concurrency-safe transactions that guarantee zero double-bookings under race conditions.
  > 
  > Let's walk through the end-to-end customer journey, concurrency protections, and staff administrative operations."

---

### [0:40 - 1:35] Part 2: Customer Discovery & Seat Reservation
- **On Screen:** 
  1. On the home page, select a city from the location dropdown (e.g., *Dehradun* or *Delhi*).
  2. Click on a movie card (e.g., *The Batman* or *Spider-Man*).
  3. Land on the Movie Detail page (`/movie/:id`). Point out the genres, censorship rating, and active auditoriums.
  4. Select a date tab and click on an available showtime pill (e.g., *07:00 PM*).
  5. The clean, high-contrast **Seat Selection Popup** appears.
- **Spoken Voiceover:**
  > "Starting with customer discovery: customers can filter shows by city, browse real-time cinema listings, and inspect movie metadata including runtime, censorship rating, and auditorium audio/visual format.
  > 
  > When we select a showtime, PIXORA opens our custom seat selection modal. Notice the clean white card layout with the distinct black cinema projection screen arc at the front.
  > 
  > The hall is divided into **Classic** and **Prime** seat tiers with instant dynamic pricing. Let's select two seats—say **E4** and **E5**. The price summary updates immediately.
  > 
  > When we click 'Confirm & Pay', the backend executes an atomic reservation lock. The system places a 10-minute hold on these seats, preventing any other user from selecting them while checkout is in progress."

---

### [1:35 - 2:30] Part 3: Concurrency Defense, Sandbox Payment & Ticket Issuance
- **On Screen:**
  1. The **Payment Gateway Modal** opens with the 10-minute hold countdown timer running.
  2. *(Optional demonstration)*: Click the **'Simulate Race Condition'** button inside the modal to demonstrate User B getting rejected with HTTP 409 Conflict.
  3. Select **UPI / Card / NetBanking** in the sandbox payment modal and click **'Pay ₹...'**.
  4. A success animation triggers, and the Digital Boarding Pass confirmation appears with the generated **Booking ID**.
- **Spoken Voiceover:**
  > "To ensure critical actions are protected against stale data and race conditions, PIXORA uses atomic database conditional updates. If a concurrent user attempts to lock the exact same seat within milliseconds, the backend rejects the second request with an `HTTP 409 Conflict`, ensuring mathematically that two confirmed bookings can never occur for the same seat.
  > 
  > Now, in our sandboxed payment gateway, we simulate an instant Indian payment flow using UPI or Cards. 
  > 
  > Once the transaction completes, the server commits the reservation, updates the live show state, logs an audit record, and issues a verified digital ticket reference and validation token."

---

### [2:30 - 3:15] Part 4: Ticket Management, QR Token & Cancellation Flow
- **On Screen:**
  1. Click **'View My Tickets'** or navigate to `/tickets`.
  2. Display the booked ticket card with the unique **Booking ID**, seat badges, and digital QR code / validation token.
  3. Click the **Cancel Ticket** button (trash icon). A confirmation prompt appears with simulated refund calculation.
  4. Confirm cancellation. The ticket status updates to **Refunded / Cancelled**, and the seats are released back to the auditorium inventory.
- **Spoken Voiceover:**
  > "Navigating to 'My Booked Tickets', customers have real-time access to their boarding passes, complete with a unique booking reference and a cryptographic QR validation token.
  > 
  > Customers can also initiate self-service cancellations. When cancelled, PIXORA calculates the refund status, safely flips the booking state, and atomically releases the booked seats back into the available inventory—all recorded in the audit trail."

---

### [3:15 - 4:05] Part 5: Admin Operations, Live Occupancy & Single-Entry Gate Validation
- **On Screen:**
  1. Switch to Tab 2: `http://localhost:5173/admin`.
  2. Highlight the 4 KPI counters stretched edge-to-edge: **Gross Revenue**, **Confirmed Bookings**, **Active Screens**, and **Avg Occupancy**.
  3. Scroll down to the **Live Screen Occupancy & Sales Report** showing real-time occupancy matching bookings and cancellations.
  4. Switch to the **Ticket Validator (Entry Gate)** tab.
  5. Paste a valid Booking ID and click **'Scan & Admit Customer'**: Shows green **'Admitted / Verified'**.
  6. Click **'Scan & Admit Customer'** a second time with the same ID: Shows red **'409 Conflict / Duplicate Entry Detected'** alert!
  7. Switch to the **Audit Trail** tab to show immutable business action logs.
- **Spoken Voiceover:**
  > "Now, let's switch to the staff and administrative side at `/admin`. The route is strictly protected server-side with role-based JWT authentication.
  > 
  > In the Admin Overview, staff get an edge-to-edge operational summary: total revenue, confirmed bookings, and live screen occupancy. The Live Occupancy Report dynamically reconciles every booking and cancellation across all screening halls.
  > 
  > In the **Ticket Validator** tab, we simulate the usher check-in flow at the cinema entrance. When a ticket reference is scanned, it validates the booking and admits the patron. 
  > 
  > Crucially, if someone attempts to reuse or scan that same ticket reference again, PIXORA immediately detects the duplicate entry, rejects it with a **409 Conflict**, and protects the cinema from unauthorized access.
  > 
  > Furthermore, every material action—from screening creation to check-ins and cancellations—is permanently captured in the **Audit Trail**."

---

### [4:05 - 4:30] Part 6: Automated Test Suite & Conclusion
- **On Screen:**
  1. Switch to the terminal window.
  2. Run: `node test.js` inside the `backend` directory.
  3. Show all 16 integration tests passing in green (concurrency tests, seat hold expiry, duplicate ticket check-in rejection, and audit trails).
- **Spoken Voiceover:**
  > "Finally, let's verify reliability. Running our automated integration test suite in the backend executes 16 comprehensive end-to-end tests covering seat locking, race condition rejection, duplicate check-in rejection, and audit logging. As you can see, all 16 tests pass with 100% operational success.
  > 
  > PIXORA provides a complete, resilient, and enterprise-grade cinema management solution from customer discovery to usher gate entry. Thank you for your time and evaluation!"

---

## Quick Reference for Recording

| Timestamp | Phase | What to Show | Key Point to Mention |
|---|---|---|---|
| **0:00 - 0:40** | Architecture & Overview | Home page scrolling | Modular monolith, React + Express + MongoDB, server-side RBAC |
| **0:40 - 1:35** | Customer Journey | Movie details & Seat selection modal | White popup, black screen arc, Classic/Prime tiers, dynamic total |
| **1:35 - 2:30** | Concurrency & Payment | Sandbox payment modal | Atomic locks, HTTP 409 double-booking rejection, ticket issuance |
| **2:30 - 3:15** | Tickets & Cancellation | `/tickets` page | QR token, booking reference, instant seat release upon refund |
| **3:15 - 4:05** | Admin Operations | `/admin` dashboard & validator | 4 KPI cards, occupancy report, entry scan & duplicate rejection |
| **4:05 - 4:30** | Automated Test Suite | Terminal running `node test.js` | 16/16 backend integration tests passing 100% |
