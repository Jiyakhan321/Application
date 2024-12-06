// Initialize Firebase
const auth = firebase.auth();
const database = firebase.database();
let currentUser = null;
const instituteLocation = { latitude: 12.9716, longitude: 77.5946 };  // Example coordinates (Bangalore)

// Admin Login and Dashboard
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            if (email === "admin@example.com") {
                // Admin login
                document.getElementById("login-section").style.display = "none";
                document.getElementById("admin-dashboard").style.display = "block";
            } else {
                // Student login
                document.getElementById("login-section").style.display = "none";
                document.getElementById("student-dashboard").style.display = "block";
            }
        })
        .catch(error => {
            document.getElementById("error-message").textContent = error.message;
        });
}

// Admin Logout
function logout() {
    auth.signOut().then(() => {
        document.getElementById("admin-dashboard").style.display = "none";
        document.getElementById("login-section").style.display = "block";
    });
}

// Add New Student (Admin)
function addStudent() {
    const email = document.getElementById("new-student-email").value;
    auth.createUserWithEmailAndPassword(email, "password123")  // Temporary password, adjust as needed
        .then(() => {
            alert("Student added!");
        })
        .catch(error => {
            alert("Error: " + error.message);
        });
}

// Update Institute Location (Admin)
function updateInstituteLocation() {
    // You could prompt the admin to enter new latitude and longitude
    const newLatitude = prompt("Enter new Latitude:");
    const newLongitude = prompt("Enter new Longitude:");
    instituteLocation.latitude = parseFloat(newLatitude);
    instituteLocation.longitude = parseFloat(newLongitude);
    alert("Institute location updated!");
}

// View Attendance (Admin)
function viewAttendance() {
    // You could fetch attendance data from Firebase here
    alert("View attendance functionality.");
}

// Check-in/Check-out for Student
function checkInOut(action) {
    getLocation()
        .then(location => {
            const distance = calculateDistance(location, instituteLocation);
            if (distance <= 100) {
                saveAttendance(action);
                document.getElementById("attendance-status").innerText = action === "check-in" ? "Checked-in successfully!" : "Checked-out successfully!";
            } else {
                document.getElementById("attendance-status").innerText = "You are not within 100 meters of the institute.";
            }
        });
}

// Get Current Student Location
function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                resolve(location);
            }, function(error) {
                reject(error);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });
}

// Calculate Distance Between Two Locations
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = loc1.latitude * Math.PI / 180;
    const lat2 = loc2.latitude * Math.PI / 180;
    const deltaLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const deltaLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Save Attendance to Firebase
function saveAttendance(status) {
    const attendanceRef = database.ref('attendance/' + currentUser.uid);
    const timestamp = new Date().toISOString();

    attendanceRef.push({
        status: status,
        timestamp: timestamp,
        location: instituteLocation,
    });
}
