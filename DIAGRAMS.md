# PIXORA System Diagrams: Architecture, Data Models & Workflows

This document contains Mermaid visual diagrams illustrating the data architecture, entity relationships, concurrency flows, and gate security lifecycle of PIXORA.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    USER ||--o{ AUDIT_LOG : "triggers"
    MOVIE ||--o{ SHOW : "features"
    THEATER ||--|{ SCREEN : "contains"
    SCREEN ||--o{ SHOW : "hosts"
    SHOW ||--o{ BOOKING : "generates"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "enum: user, admin"
        string phone
        date createdAt
        date updatedAt
    }

    MOVIE {
        ObjectId _id PK
        string title "indexed"
        string description
        string[] genre
        number duration
        string language
        string posterUrl
        string backdropImage
        string rating
        string censorshipRating "e.g. UA 16+"
        date releaseDate
        boolean isBanner
        date createdAt
    }

    THEATER {
        ObjectId _id PK
        string name "indexed"
        string city "indexed"
        string location
        string format "e.g. IMAX 3D Laser"
        string distance
        ObjectId[] screens
        date createdAt
    }

    SCREEN {
        ObjectId _id PK
        string name UK "e.g. Screen 1"
        number capacity
        object seatLayout "grid of rows A-J"
        date createdAt
    }

    SHOW {
        ObjectId _id PK
        ObjectId movie FK
        ObjectId screen FK
        date showTime "compound indexed"
        number price
        string[] bookedSeats "denormalized e.g. A1, E4"
        date createdAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId user FK "indexed"
        ObjectId show FK "indexed"
        string[] seats "e.g. [E4, E5]"
        number totalPrice
        string bookingStatus "Reserved | Confirmed | Cancelled"
        string paymentStatus "Pending | Completed | Refunded"
        string paymentId
        string movieTitle "snapshot"
        string screenName "snapshot"
        date showTime "snapshot"
        date lockedUntil "hold expiry timestamp"
        boolean isCheckedIn "gate validation"
        date checkedInAt
        date createdAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId user FK
        string userEmail
        string action "SHOW_CREATED | BOOKING_CONFIRMED | etc"
        string details
        string entityType
        string entityId
        date createdAt "indexed"
    }
```

---

## 2. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client Layer (React 19 + Vite)"]
        UI_Home["Landing & Discovery (CatalogPage)"]
        UI_Detail["Movie Details & Showtimes (MovieDetailPage)"]
        UI_Modal["Seat Selection Modal (SeatBookingModal)"]
        UI_Pay["Payment Gateway Modal (Sandbox Payment)"]
        UI_Admin["Staff Operations Hub (AdminPage)"]
        Hook_Booking["Custom Hook (useMovieBooking)"]
    end

    subgraph APILayer["Application Server (Node.js + Express)"]
        MW_Auth["Auth Middleware (JWT Verification & RBAC)"]
        Router_Auth["/api/auth (Register, Login, Me)"]
        Router_Catalog["/api/movies & /api/theaters"]
        Router_Shows["/api/shows (Schedule Management)"]
        Router_Bookings["/api/bookings (Atomic Reserve, Confirm, Cancel)"]
        Router_Admin["/api/admin (KPIs, Occupancy, Gate Scanner)"]
    end

    subgraph DataLayer["Persistence Layer (MongoDB Atlas)"]
        DB_Users[("Users Collection")]
        DB_Shows[("Shows Collection - Compound Index")]
        DB_Bookings[("Bookings Collection - Seat Holds")]
        DB_Audit[("AuditLogs Collection - Append Only")]
        DB_Theaters[("Theaters & Screens Collections")]
    end

    UI_Detail --> Hook_Booking
    Hook_Booking --> UI_Modal
    UI_Modal --> UI_Pay
    
    UI_Home --> Router_Catalog
    Hook_Booking --> Router_Bookings
    UI_Admin --> Router_Admin
    UI_Home --> Router_Auth

    Router_Auth --> MW_Auth
    Router_Admin --> MW_Auth
    Router_Bookings --> MW_Auth

    MW_Auth --> DB_Users
    Router_Shows --> DB_Shows
    Router_Bookings --> DB_Shows
    Router_Bookings --> DB_Bookings
    Router_Admin --> DB_Bookings
    Router_Admin --> DB_Audit
    Router_Catalog --> DB_Theaters
```

---

## 3. High-Concurrency Seat Reservation & Race-Condition Sequence

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Customer A
    actor UserB as Customer B
    participant API as Booking Engine (/api/bookings)
    participant DB as MongoDB (Shows & Bookings)

    Note over UserA,UserB: Both users view Seat E4 as available at 07:00:00.000 PM
    UserA->>API: POST /api/bookings { showId, requestedSeats: ["E4"] }
    UserB->>API: POST /api/bookings { showId, requestedSeats: ["E4"] } (Arrives +2ms later)

    Note over API,DB: User A request hits database first
    API->>DB: findOneAndUpdate({ _id: showId, bookedSeats: { $nin: ["E4"] } }, { $addToSet: { bookedSeats: "E4" } })
    DB-->>API: Match found! "E4" locked atomically for User A
    API->>DB: Create Booking Document (status: 'Reserved', lockedUntil: +10 mins)
    API-->>UserA: 201 Created (Booking Session active, seats locked for 10 mins)

    Note over API,DB: User B request executes conditional check
    API->>DB: findOneAndUpdate({ _id: showId, bookedSeats: { $nin: ["E4"] } }, ...)
    DB-->>API: null returned (Condition failed: "E4" is in bookedSeats array!)
    API-->>UserB: 409 Conflict ("Seat conflict: Seat E4 is already reserved by another user")
    Note over UserB: Frontend notifies User B and deselects E4 automatically
```

---

## 4. Single-Entry Gate Validation & Replay Defense Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Patron as Cinema Patron
    actor Usher as Staff / Usher
    participant Scanner as Admin Gate Scanner (/api/admin/validate-ticket)
    participant DB as MongoDB (Bookings Collection)

    Note over Patron,Usher: Patron presents Digital Boarding Pass QR Code at Gate
    Usher->>Scanner: Scan Ticket Reference #49EEB825
    Scanner->>DB: findById("49EEB825")
    DB-->>Scanner: Return Booking Record (isCheckedIn: false)

    Note over Scanner: Validate state transition
    Scanner->>DB: updateOne({ _id: "49EEB825" }, { isCheckedIn: true, checkedInAt: 07:45 PM })
    Scanner->>DB: Log Audit Event: TICKET_VALIDATED
    Scanner-->>Usher: 200 OK — "Ticket Verified Successfully! Customer Admitted."

    Note over Patron,Usher: Later, someone attempts to reuse the same QR code / screenshot
    Usher->>Scanner: Scan Ticket Reference #49EEB825 (Second Attempt)
    Scanner->>DB: findById("49EEB825")
    DB-->>Scanner: Return Booking Record (isCheckedIn: true, checkedInAt: 07:45 PM)

    Note over Scanner: Replay Attack Detected!
    Scanner-->>Usher: 409 Conflict — "DUPLICATE ENTRY DETECTED! Ticket was ALREADY ADMITTED at 07:45 PM."
    Note over Usher: Entry denied to prevent double-admission
```

---

## 5. Booking State Lifecycle Diagram

```mermaid
stateDiagram-v2
    [*] --> Available: Screening Scheduled

    Available --> Reserved: Customer holds seats (10-min window)
    
    Reserved --> Available: Hold expired OR user cancels checkout
    Reserved --> Confirmed: Payment successfully verified in sandbox

    Confirmed --> Cancelled: Customer initiates cancellation (Simulated refund)
    Cancelled --> Available: Seats atomically released back to show inventory

    Confirmed --> Admitted: Usher scans ticket at entry gate
    Admitted --> Admitted: Re-scan attempt rejected with 409 Conflict

    Admitted --> [*]
    Cancelled --> [*]
```

