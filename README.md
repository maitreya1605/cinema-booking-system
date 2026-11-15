# PIXORA — Cinema Ticket Booking & Multi-Screen Operations Platform

A full-stack cinema ticket booking and operations platform built with **React 19**, **Node.js**, **Express**, and **MongoDB**. PIXORA supports movie discovery, seat reservations, simulated payments, digital ticket generation, ticket cancellation, and administrative operations.

The project focuses on reliable seat reservation, server-side access control, single-use ticket validation, and operational visibility for cinema staff.

---

## Table of Contents

1. [Overview](#overview)
2. [Business Problem and Scope](#business-problem-and-scope)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Technology Stack](#technology-stack)
6. [Prerequisites](#prerequisites)
7. [Project Structure](#project-structure)
8. [Environment Configuration](#environment-configuration)
9. [Database Setup](#database-setup)
10. [Run Locally](#run-locally)
11. [End-to-End Verification](#end-to-end-verification)
12. [Demo Accounts](#demo-accounts)
13. [API Overview](#api-overview)
14. [Automated Tests](#automated-tests)
15. [Known Limitations](#known-limitations)
16. [Troubleshooting](#troubleshooting)
17. [Related Documentation](#related-documentation)

---

## Overview

PIXORA manages the customer booking journey and the cinema's day-to-day ticketing operations in one application.

Customers can browse movies by city, choose a screening, select seats, complete a simulated payment, and receive a digital ticket. Staff can use the admin workspace to manage cinema content and screenings, review occupancy information, validate tickets at the entrance, and inspect audit records.

## Business Problem and Scope

Cinema booking systems need to handle situations where multiple customers try to reserve the same seats at nearly the same time. They also need to manage temporary reservations, cancellations, ticket reuse, and screening operations.

PIXORA addresses these requirements through the following workflows:

- **Cinema configuration:** Manage movies, theaters, screens, seat categories, and scheduled shows.
- **Customer discovery:** Browse movies, filter by city, and view movie details and showtimes.
- **Seat reservation:** Select seats and place a temporary reservation hold.
- **Booking and ticket issuance:** Complete the simulated payment flow and generate a digital ticket with a unique booking reference.
- **Cancellation:** Cancel eligible bookings and release seats back into the available inventory.
- **Staff operations:** Review dashboard metrics, manage screenings, validate tickets, and view audit records.

## Architecture

PIXORA uses a **modular monolith** architecture. The frontend, backend, and database have distinct responsibilities while the backend's application modules run within one Node.js application.

```text
┌───────────────────────────────────────────────────────────┐
│                    Frontend: React + Vite                 │
│                                                           │
│  Customer pages       Booking UI        Admin workspace   │
│  Movie discovery      Seat selection    KPIs and reports  │
│  Authentication       Ticket views      Ticket validator  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                         HTTP / JSON
                         REST API + JWT
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                  Backend: Node.js + Express              │
│                                                           │
│  Authentication / RBAC     Booking and reservation logic  │
│  Movie and show APIs        Staff operations               │
│  Ticket validation          Audit logging                  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                         Mongoose ODM
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                         MongoDB                           │
│                                                           │
│  Users · Movies · Theaters · Screens · Shows              │
│  Bookings · AuditLogs                                      │
└───────────────────────────────────────────────────────────┘
```

### Key design decisions

1. **Server-side authorization:** Protected backend routes verify authentication and user roles. Hiding a button in the frontend is not treated as a security control.
2. **Atomic seat reservation:** Seat availability is checked as part of a conditional database update, reducing the risk of two customers reserving the same seat.
3. **Temporary reservation holds:** Seats are held for a limited checkout period. The configured hold window is 10 minutes.
4. **Audit logging:** Important business actions are recorded for administrative review.

## Features

### Customer application

- City-based movie and cinema discovery.
- Movie details, including genre, runtime, and certification information.
- Date and showtime selection.
- Seat selection with **Classic** and **Prime** categories.
- Dynamic booking price calculation.
- Simulated UPI payment options, including Google Pay, PhonePe, and Paytm.
- Digital ticket generation with a unique booking reference and QR validation token.
- My Tickets page and self-service cancellation.

### Admin and staff workspace

Available at `/admin`.

- Dashboard metrics for gross revenue, confirmed bookings, active screens, and average occupancy.
- Screen occupancy and sales report.
- Cinema screening management with schedule-conflict checks.
- Ticket validator for staff entry-gate check-in.
- Duplicate ticket-use detection.
- Audit trail for important business actions.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Lucide React, React Router v7 |
| Backend | Node.js, Express.js, JSON Web Tokens (JWT), bcrypt.js |
| Database | MongoDB, Mongoose 8.x |
| Testing | Node.js integration test script (`test.js`) |

## Prerequisites

Install the following before running the project:

- **Node.js:** v18 or later
- **npm:** v9 or later
- **Git**
- **MongoDB:** MongoDB Atlas or a local MongoDB instance
- Internet access if using a cloud-hosted MongoDB database

Check your installed versions:

```bash
node -v
npm -v
git --version
```

## Project Structure

```text
cinema/
├── backend/
│   ├── controllers/       # Application and business logic
│   ├── middlewares/      # Authentication and role checks
│   ├── models/           # Mongoose models
│   ├── routes/           # API route definitions
│   ├── .env              # Local environment variables (do not commit)
│   ├── seed.js           # Main database seed script
│   ├── seed-theaters.js  # Theater and cinema seed script
│   ├── server.js         # Backend entry point
│   └── test.js           # Integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Application pages
│   │   └── context/      # Shared application state
│   └── package.json
├── README.md
├── TECHNICAL_REPORT.md
├── DIAGRAMS.md
├── TEST_EVIDENCE.md
└── WALKTHROUGH_SCRIPT.md
```

## Environment Configuration

Create a file named `.env` inside the `backend` directory.

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
```

Replace the placeholder values with your own configuration.

**Security notes**

- Never commit `.env` files, database passwords, API keys, or JWT secrets to Git.
- Use a strong, unique `JWT_SECRET`.
- If a real database password or secret has previously been committed or shared, rotate it before publishing the repository.
- Keep a sanitized `.env.example` file with placeholders if you want to document the required variables.

## Database Setup

The backend includes seed scripts for creating initial application data.

From the project root:

```bash
cd backend
npm install
```

Run the seed scripts when setting up a fresh database:

```bash
node seed.js
node seed-theaters.js
```

Run each seed script only when required. Check the scripts before rerunning them to understand whether they insert, update, or reset existing data.

## Run Locally

### 1. Start the backend

Open a terminal:

```bash
cd backend
npm install
node server.js
```

The backend is configured to run at:

```text
http://localhost:8000
```

Health endpoint:

```text
http://localhost:8000/api/health
```

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server is configured to run at:

```text
http://localhost:5173
```

Open that address in your browser.

### 3. Create a production frontend build

From the frontend directory:

```bash
npm run build
```

The generated production files are placed in `frontend/dist/`.

## End-to-End Verification

Use the following flow to manually check the main features.

### Customer journey

1. Open `http://localhost:5173`.
2. Register a new account or sign in with a customer account.
3. Select a city and browse the available movies.
4. Open a movie and choose a date and showtime.
5. Select available seats, such as `E4` and `E5`, and review the displayed price.
6. Continue to the payment screen and complete the simulated payment.
7. Confirm that the digital ticket appears with its booking reference and QR token.
8. Open **My Tickets** to view the booking.
9. If testing cancellation, cancel the ticket and verify the resulting status and seat availability.

### Admin and staff journey

1. Open `http://localhost:5173/admin`.
2. Sign in with an administrator account if prompted.
3. Review the dashboard metrics and screen occupancy report.
4. Open the screening management area and review the available management actions.
5. Open **Ticket Validator** and enter a valid booking reference or supported QR payload.
6. Validate the ticket once and confirm that it is admitted.
7. Try validating the same ticket again and confirm that the duplicate-entry warning appears.
8. Open **Audit Trail** and review the recorded actions.

## Demo Accounts

The project documentation identifies the following seed/demo accounts. These credentials should be checked against the current seed data before use.

| Role | Email | Password |
|---|---|---|
| Customer | `customer@cinema.com` | `password123` |
| Administrator | `admin@cinema.com` | `admin123` |

You can also register a new customer account through the application's registration page.

> **Before publishing:** Change or remove predictable demo passwords if these accounts are connected to a shared or publicly accessible database. Never use demo credentials for real customer data.

## API Overview

The following routes are documented by the project.

### Authentication — `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | Public |
| POST | `/api/auth/login` | Log in and receive a JWT | Public |
| GET | `/api/auth/me` | Get the authenticated user's profile | Authenticated |

### Movies — `/api/movies`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/movies` | List active movies | Public |
| POST | `/api/movies` | Create a movie listing | Admin |
| GET | `/api/movies/:id` | Get movie details | Public |

### Theaters and screens

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/theaters` | List theaters, optionally filtered by city | As configured |
| GET | `/api/screens` | List screens and seating information | As configured |
| POST | `/api/screens` | Create a screen | Admin |

### Shows — `/api/shows`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/shows` | List scheduled shows and seat availability | As configured |
| POST | `/api/shows` | Create a screening | Admin |
| DELETE | `/api/shows/:id` | Remove a scheduled screening | Admin |

### Bookings — `/api/bookings`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/bookings` | Reserve seats for checkout | Authenticated |
| POST | `/api/bookings/confirm` | Confirm a booking after simulated payment | Authenticated |
| GET | `/api/bookings/my-tickets` | Get the user's tickets | Authenticated |
| POST | `/api/bookings/:id/cancel` | Cancel a booking | Authenticated |

A conflicting seat reservation is documented to return `409 Conflict`.

### Admin operations — `/api/admin`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/overview` | Get dashboard metrics and occupancy information | Admin |
| POST | `/api/admin/validate-ticket` | Validate a ticket and record check-in | Admin |
| GET | `/api/admin/audit-logs` | Retrieve audit records | Admin |

> This is a documentation overview, not a substitute for checking the route definitions in the current source code. Request parameters and response schemas may vary by implementation.

## Automated Tests

Run the backend integration test script:

```bash
cd backend
node test.js
```

The project documentation reports **16 automated integration checks** covering:

1. Health endpoint.
2. User registration.
3. Authentication and token issuance.
4. Authenticated profile access.
5. Auditorium setup.
6. Movie creation.
7. Screening schedule creation.
8. Movie and show discovery.
9. Seat reservation.
10. Payment and booking finalization.
11. Ticket retrieval.
12. Theater discovery.
13. Live occupancy reconciliation.
14. Ticket gate check-in.
15. Duplicate check-in rejection.
16. Audit logging.

Refer to `TEST_EVIDENCE.md` for the recorded test output. Run the test suite in your own environment to verify the current result.

## Known Limitations

- **Payment processing:** Payments are simulated in a sandbox flow. The application does not process real UPI, card, or net-banking transactions.
- **Email delivery:** Ticket confirmation is displayed in the application; third-party SMTP email delivery is not included in the documented implementation.
- **Gate scanning:** The staff validator accepts a booking reference or QR payload through the interface to simulate an entry scanner.

## Troubleshooting

### Port 8000 or 5173 is already in use

**Windows (PowerShell):**

```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Replace `<PID>` with the process ID shown by `netstat`. Use `:5173` to check the frontend port.

**macOS / Linux:**

```bash
lsof -i :8000
kill -9 <PID>
```

### MongoDB connection timeout

- Check that the MongoDB connection string in `backend/.env` is correct.
- For MongoDB Atlas, confirm that your current IP address is allowed in the cluster's network access settings.
- If using local MongoDB, confirm that the MongoDB service is running and that the connection string points to the correct port.

### PowerShell blocks npm scripts

If PowerShell reports an execution policy error, open PowerShell and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

This changes the policy only for the current PowerShell process.

## Related Documentation

- [Technical Report](./TECHNICAL_REPORT.md) — architectural and implementation decisions.
- [Architecture and ER Diagrams](./DIAGRAMS.md) — system diagrams.
- [Test Evidence](./TEST_EVIDENCE.md) — recorded automated test output.
