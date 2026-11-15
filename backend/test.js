const http = require('http');

const PORT = 8000;
let serverInstance;

function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path,
            method,
            headers: reqHeaders
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log("=== STARTING BACKEND INTEGRATION TESTS ===");
    const app = require('./server');

    // Wait for DB connection
    await new Promise(r => setTimeout(r, 2500));

    try {
        // 1. Health check
        console.log("\n1. Testing GET /api/health");
        const health = await request('GET', '/api/health');
        console.log("Health Status:", health.status, health.body);

        // 2. Register
        const testEmail = `test_${Date.now()}@example.com`;
        console.log(`\n2. Testing POST /api/auth/register with email: ${testEmail}`);
        const regRes = await request('POST', '/api/auth/register', {
            name: "Test User",
            email: testEmail,
            password: "password123",
            role: "admin"
        });
        console.log("Register Status:", regRes.status, regRes.body.message);
        if (regRes.status !== 201) throw new Error("Register failed: " + JSON.stringify(regRes.body));
        const token = regRes.body.token;

        // 3. Login
        console.log("\n3. Testing POST /api/auth/login");
        const loginRes = await request('POST', '/api/auth/login', {
            email: testEmail,
            password: "password123"
        });
        console.log("Login Status:", loginRes.status, loginRes.body.message);
        if (loginRes.status !== 200) throw new Error("Login failed: " + JSON.stringify(loginRes.body));

        // 4. Get Profile
        console.log("\n4. Testing GET /api/auth/me");
        const meRes = await request('GET', '/api/auth/me', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log("Profile Status:", meRes.status, meRes.body.user.name, meRes.body.user.email);

        // 5. Create Screen
        console.log("\n5. Testing POST /api/screens");
        const screenRes = await request('POST', '/api/screens', {
            name: `IMAX Hall ${Date.now()}`,
            capacity: 50,
            seatLayout: {
                rows: [
                    { rowId: "A", totalSeats: 10, category: "Standard" },
                    { rowId: "B", totalSeats: 10, category: "Premium" }
                ]
            }
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Screen Create Status:", screenRes.status, screenRes.body.message);
        const screenId = screenRes.body.screen._id;

        // 6. Create Movie
        console.log("\n6. Testing POST /api/movies");
        const movieRes = await request('POST', '/api/movies', {
            title: "Inception: Resurgence",
            description: "A dream within a dream thriller",
            genre: ["Sci-Fi", "Action"],
            duration: 148,
            language: "English",
            releaseDate: new Date().toISOString()
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Movie Create Status:", movieRes.status, movieRes.body.message);
        const movieId = movieRes.body.movie._id;

        // 7. Create Show
        console.log("\n7. Testing POST /api/shows");
        const showTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const showRes = await request('POST', '/api/shows', {
            movie: movieId,
            screen: screenId,
            showTime: showTime,
            price: 250
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Show Create Status:", showRes.status, showRes.body.message);
        const showId = showRes.body.show._id;

        // 8. List Shows
        console.log("\n8. Testing GET /api/shows");
        const showsListRes = await request('GET', '/api/shows');
        console.log("List Shows Status:", showsListRes.status, `Found ${showsListRes.body.count} shows`);

        // 9. Reserve Seats
        console.log("\n9. Testing POST /api/bookings (reserveSeats)");
        const bookingRes = await request('POST', '/api/bookings', {
            showId: showId,
            requestedSeats: ["A1", "A2"],
            totalPrice: 500
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Booking Reserve Status:", bookingRes.status, bookingRes.body.message);
        if (bookingRes.status !== 201) throw new Error("Booking failed: " + JSON.stringify(bookingRes.body));
        const bookingId = bookingRes.body.bookingId;

        // 10. Confirm Payment
        console.log("\n10. Testing POST /api/bookings/confirm");
        const confirmRes = await request('POST', '/api/bookings/confirm', {
            bookingId: bookingId,
            paymentId: "TXN_12345678"
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Confirm Payment Status:", confirmRes.status, confirmRes.body.message);

        // 11. Get My Tickets
        console.log("\n11. Testing GET /api/bookings/my-tickets");
        const ticketsRes = await request('GET', '/api/bookings/my-tickets', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log("My Tickets Status:", ticketsRes.status, `Tickets count: ${ticketsRes.body.bookings.length}`);

        // 12. Testing GET /api/theaters (dynamic theaters)
        console.log("\n12. Testing GET /api/theaters");
        const theatersRes = await request('GET', '/api/theaters');
        console.log("Theaters Status:", theatersRes.status, `Theaters count: ${theatersRes.body.count}`);
        if (theatersRes.status !== 200 || !theatersRes.body.theaters) throw new Error("Theaters fetch failed");

        // 13. Testing GET /api/admin/overview (KPIs and Occupancy Report)
        console.log("\n13. Testing GET /api/admin/overview");
        const adminOverviewRes = await request('GET', '/api/admin/overview', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log("Admin Overview Status:", adminOverviewRes.status, "Occupancy Report shows:", adminOverviewRes.body.occupancyReport?.length);
        if (adminOverviewRes.status !== 200 || !adminOverviewRes.body.kpis) {
            throw new Error("Admin overview fetch failed: " + JSON.stringify(adminOverviewRes.body));
        }

        // 14. Testing POST /api/admin/validate-ticket (Single-use entry validation flow)
        console.log("\n14. Testing POST /api/admin/validate-ticket (Entry validation flow)");
        const validateRes = await request('POST', '/api/admin/validate-ticket', {
            ticketCode: bookingId
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Ticket Validation Status:", validateRes.status, validateRes.body.message);
        if (validateRes.status !== 200 || !validateRes.body.success) {
            throw new Error("Ticket validation failed: " + JSON.stringify(validateRes.body));
        }

        // 15. Testing Duplicate Ticket Entry Rejection (Acceptance Test: Rejects second entry)
        console.log("\n15. Testing Duplicate Ticket Validation Rejection (Acceptance Test)");
        const duplicateValidateRes = await request('POST', '/api/admin/validate-ticket', {
            ticketCode: bookingId
        }, { 'Authorization': `Bearer ${token}` });
        console.log("Duplicate Validation Status:", duplicateValidateRes.status, duplicateValidateRes.body.error);
        if (duplicateValidateRes.status !== 409) {
            throw new Error("Duplicate validation should have returned 409 Conflict, got: " + duplicateValidateRes.status);
        }

        // 16. Testing GET /api/admin/audit-logs
        console.log("\n16. Testing GET /api/admin/audit-logs");
        const auditRes = await request('GET', '/api/admin/audit-logs', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log("Audit Logs Status:", auditRes.status, `Logs count: ${auditRes.body.count}`);
        if (auditRes.status !== 200 || auditRes.body.count < 1) {
            throw new Error("Audit logs fetch failed: " + JSON.stringify(auditRes.body));
        }

        // Cleanup test data
        console.log("\nCleaning up test artifacts...");
        const Movie = require('./models/movie');
        const Show = require('./models/show');
        const Screen = require('./models/screen');
        const User = require('./models/user');
        const Booking = require('./models/booking');
        
        await Booking.deleteOne({ _id: bookingId });
        await Show.deleteOne({ _id: showId });
        await Movie.deleteOne({ _id: movieId });
        await Screen.deleteOne({ _id: screenId });
        await User.deleteOne({ email: testEmail });
        console.log("Test artifacts cleaned up successfully.");

        console.log("\nALL TESTS PASSED SUCCESSFULLY! BACKEND IS 100% OPERATIONAL!");
        process.exit(0);

    } catch (err) {
        console.error("\nTEST SUITE FAILED:", err);
        process.exit(1);
    }
}

runTests();
