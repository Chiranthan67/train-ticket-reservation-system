// public/js/dashboard.js

// Auth guard
(function () {
  const token = getToken();
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) {
    window.location.href = "/";
  }
})();

window.selectedTrain = null;
window.passengers = [];
let selectedTrain = window.selectedTrain;
let passengers = window.passengers;

// seatAssignments[coachCode][seatNo] = passengerIndex
let seatAssignments = {};
let currentSeatPassengerIndex = null;

// Sleeper coach layout 1–72 with berth types (LB/MB/UB/SLB/SUB)
const SLEEPER_LAYOUT = Array.from({ length: 72 }, (_, i) => {
  const seatNo = i + 1;
  const pos = ((seatNo - 1) % 8) + 1; // 1..8
  let berthType;
  if (pos === 1 || pos === 4) berthType = "LB";
  else if (pos === 2 || pos === 5) berthType = "MB";
  else if (pos === 3 || pos === 6) berthType = "UB";
  else if (pos === 7) berthType = "SLB";
  else berthType = "SUB";
  return { seatNo, berthType };
});

// Generic layout for AC coaches etc (no berth type)
const GENERIC_LAYOUT = Array.from({ length: 40 }, (_, i) => ({
  seatNo: i + 1,
  berthType: null,
}));

// Coach codes for multi-coach layout
const COACH_CODES = [
  // Sleeper S1-S10
  { code: "S1", label: "Sleeper S1 (SL)", type: "SL" },
  { code: "S2", label: "Sleeper S2 (SL)", type: "SL" },
  { code: "S3", label: "Sleeper S3 (SL)", type: "SL" },
  { code: "S4", label: "Sleeper S4 (SL)", type: "SL" },
  { code: "S5", label: "Sleeper S5 (SL)", type: "SL" },
  { code: "S6", label: "Sleeper S6 (SL)", type: "SL" },
  { code: "S7", label: "Sleeper S7 (SL)", type: "SL" },
  { code: "S8", label: "Sleeper S8 (SL)", type: "SL" },
  { code: "S9", label: "Sleeper S9 (SL)", type: "SL" },
  { code: "S10", label: "Sleeper S10 (SL)", type: "SL" },

  // 3A coaches
  { code: "B1", label: "3A Coach B1", type: "3A" },
  { code: "B2", label: "3A Coach B2", type: "3A" },
  { code: "B3", label: "3A Coach B3", type: "3A" },
  { code: "B4", label: "3A Coach B4", type: "3A" },

  // 2A coaches
  { code: "A1", label: "2A Coach A1", type: "2A" },
  { code: "A2", label: "2A Coach A2", type: "2A" },

  // 1A
  { code: "H1", label: "AC First H1", type: "1A" },

  // General
  { code: "C1", label: "General C1", type: "GEN" },
  { code: "C2", label: "General C2", type: "GEN" },
  { code: "C3", label: "General C3", type: "GEN" },
];

// ---------------------- USER CHIP ----------------------
const user = JSON.parse(localStorage.getItem("user") || "{}");

// Debug: Log user data to console
console.log("User data from localStorage:", user);
console.log("Is admin?", user.isAdmin);

const chipUserName = document.getElementById("chipUserName");
const chipUserEmail = document.getElementById("chipUserEmail");
const sidebarUserEmail = document.getElementById("sidebarUserEmail");

chipUserName.textContent = user.name || "User";
chipUserEmail.textContent = user.email || "";
sidebarUserEmail.textContent = user.email || "";

// Show admin menu if user is admin
if (user.isAdmin === true || user.email === "admin@railway.com") {
  console.log("✅ Showing admin menu for:", user.email);
  document.getElementById("adminMenuBtn").style.display = "block";
  document.querySelector('.menu-btn[data-section="searchSection"]').style.display = "none";
  document.querySelector('.menu-btn[data-section="cartSection"]').style.display = "none";
  document.querySelector('.menu-btn[data-section="bookingsSection"]').style.display = "none";
  document.querySelector('.menu-btn[data-section="transactionsSection"]').style.display = "none";
  
  // Make admin panel active by default for admin
  document.querySelector('.menu-btn[data-section="searchSection"]').classList.remove("active");
  document.querySelector('.menu-btn[data-section="adminSection"]').classList.add("active");
  document.getElementById("searchSection").classList.remove("active");
  document.getElementById("adminSection").classList.add("active");
} else {
  console.log("❌ Admin menu hidden - user.isAdmin:", user.isAdmin, "for user:", user.email);
}

// ---------------------- MENU / SECTIONS ----------------------
const menuBtns = document.querySelectorAll(".menu-btn[data-section]");
const sections = document.querySelectorAll(".section");

menuBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sectionId = btn.dataset.section;
    menuBtns.forEach((b) => b.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "bookingsSection") loadBookings();
    if (sectionId === "transactionsSection") loadTransactions();
    if (sectionId === "adminSection") loadAdminBookings();
  });
});

// Load admin bookings on page load if user is admin
if (user.isAdmin === true || user.email === "admin@railway.com") {
  loadAdminBookings();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  clearAuth();
  window.location.href = "/";
});

// ---------------------- SEARCH TRAINS ----------------------
const sourceInput = document.getElementById("sourceInput");
const destinationInput = document.getElementById("destinationInput");
const dateInput = document.getElementById("dateInput");
const searchBtn = document.getElementById("searchBtn");
const trainList = document.getElementById("trainList");
const searchError = document.getElementById("searchError");

dateInput.valueAsDate = new Date();

// Load stations + all trains on page load
window.addEventListener("DOMContentLoaded", () => {
  loadStations();
  loadAllTrains();
});

async function loadStations() {
  try {
    const stations = await apiRequest("/trains/stations");
    stations.forEach((s) => {
      const name = s.charAt(0).toUpperCase() + s.slice(1);

      const opt1 = document.createElement("option");
      opt1.value = s;
      opt1.textContent = name;
      sourceInput.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = s;
      opt2.textContent = name;
      destinationInput.appendChild(opt2);
    });
  } catch (err) {
    console.error("Failed to load stations:", err);
  }
}

// When source changes, rebuild destination options
sourceInput.addEventListener("change", updateDestinationOptions);

async function updateDestinationOptions() {
  const source = sourceInput.value;
  destinationInput.innerHTML = `<option value="">Select destination</option>`;

  if (!source) return;

  try {
    const trains = await apiRequest("/trains");
    const destSet = new Set();

    trains.forEach((t) => {
      if (t.source.toLowerCase() === source.toLowerCase()) {
        destSet.add(t.destination.toLowerCase());
      }
    });

    Array.from(destSet)
      .sort()
      .forEach((dest) => {
        const name = dest.charAt(0).toUpperCase() + dest.slice(1);
        const opt = document.createElement("option");
        opt.value = dest;
        opt.textContent = name;
        destinationInput.appendChild(opt);
      });
  } catch (err) {
    console.error("Failed to update destination options:", err);
  }
}

// Load ALL trains
async function loadAllTrains() {
  searchError.textContent = "";
  trainList.innerHTML = `<p>Loading trains...</p>`;

  try {
    const trains = await apiRequest("/trains");
    displayTrains(trains);
  } catch (err) {
    console.error("Load all trains failed:", err);
    trainList.innerHTML = "<p>Error loading trains.</p>";
  }
}

function displayTrains(trains) {
  trainList.innerHTML = "";

  if (!trains.length) {
    trainList.innerHTML = "<p>No trains available.</p>";
    return;
  }

  trains.forEach((train) => {
    const seats = train.seatsAvailable || Math.floor(Math.random() * 120) + 20;

    const div = document.createElement("div");
    div.className = "train-card";
    div.innerHTML = `
      <div class="train-header">
        <div>
          <strong>${train.name}</strong>
          <div class="train-meta">#${train.number} • ${train.classType}</div>
        </div>
        <span class="badge">₹${train.baseFare}</span>
      </div>
      <div class="train-row">
        <span>${train.source} → ${train.destination}</span>
        <span>${train.departureTime} → ${train.arrivalTime}</span>
      </div>
      <div class="train-row">
        <span class="train-meta">${seats} seats left</span>
      </div>
      <button class="btn btn-primary btn-select" data-id="${train._id}" style="margin-top: 10px;">
        Add to cart
      </button>
    `;
    trainList.appendChild(div);
  });

  document.querySelectorAll(".btn-select").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const train = trains.find((t) => t._id === id);
      window.selectedTrain = train;
      selectedTrain = train;
      window.passengers = [];
      passengers = [];
      seatAssignments = {};
      updateCartUI();

      menuBtns.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));
      document
        .querySelector('.menu-btn[data-section="cartSection"]')
        .classList.add("active");
      document.getElementById("cartSection").classList.add("active");
    });
  });
}

// Search with dropdowns
searchBtn.addEventListener("click", async () => {
  searchError.textContent = "";
  trainList.innerHTML = "";

  const source = sourceInput.value;
  const destination = destinationInput.value;
  const date = dateInput.value;

  if (!source || !destination || !date) {
    searchError.textContent = "Please fill all fields.";
    return;
  }

  try {
    const trains = await apiRequest(
      `/trains?source=${encodeURIComponent(
        source
      )}&destination=${encodeURIComponent(destination)}`
    );
    displayTrains(trains);
  } catch (err) {
    searchError.textContent = err.message;
  }
});

// ---------------------- CART + PASSENGERS ----------------------
const cartTrainDetails = document.getElementById("cartTrainDetails");
const passengerTableBody = document.querySelector("#passengerTable tbody");
const addPassengerBtn = document.getElementById("addPassengerBtn");
const paymentMethodSelect = document.getElementById("paymentMethod");
const cardNumberGroup = document.getElementById("cardNumberGroup");
const cardNumberInput = document.getElementById("cardNumber");
const totalFareEl = document.getElementById("totalFare");
const checkoutError = document.getElementById("checkoutError");
const checkoutBtn = document.getElementById("checkoutBtn");

function rebuildSeatAssignmentsFromPassengers() {
  seatAssignments = {};
  passengers.forEach((p, idx) => {
    if (p.coach && p.seatNo != null) {
      if (!seatAssignments[p.coach]) seatAssignments[p.coach] = {};
      seatAssignments[p.coach][p.seatNo] = idx;
    }
  });
}

function seatLabel(p) {
  if (!p.coach || !p.seatNo) return "-";
  const main = `${p.coach}-${p.seatNo}`;
  if (p.berthType) return `${main} (${p.berthType})`;
  return main;
}

function updateCartUI() {
  if (!passengerTableBody) {
    console.error("Passenger table body not found");
    return;
  }
  
  passengerTableBody.innerHTML = "";
  checkoutError.textContent = "";

  rebuildSeatAssignmentsFromPassengers();

  if (!selectedTrain) {
    cartTrainDetails.innerHTML =
      '<span style="color:#9ca3af;">No train selected. Go to "Search Trains" and add a train to cart.</span>';
    totalFareEl.textContent = "₹0";
    return;
  }

  cartTrainDetails.innerHTML = `
    <div><strong>${selectedTrain.name}</strong> (#${selectedTrain.number})</div>
    <div class="train-meta">
      ${selectedTrain.source} → ${selectedTrain.destination} •
      ${selectedTrain.departureTime} → ${selectedTrain.arrivalTime}
    </div>
    <div class="train-meta">
      Class: ${selectedTrain.classType} • Base fare: ₹${selectedTrain.baseFare}
    </div>
  `;

  console.log("Updating cart UI with passengers:", passengers);
  console.log("Passenger table body:", passengerTableBody);
  
  if (passengers.length === 0) {
    console.log("No passengers to display");
  }
  
  passengers.forEach((p, index) => {
    console.log(`Adding passenger ${index}:`, p);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${seatLabel(p)}</td>
      <td>
        <button data-index="${index}" class="seat-assign-btn btn-ghost" style="border-radius:999px;padding:4px 10px;border:1px solid #4b5563;font-size:0.75rem;margin-right:4px;">
          Select seat
        </button>
        <button data-index="${index}" class="passenger-remove-btn btn-ghost" style="border-radius:999px;padding:4px 10px;border:1px solid #4b5563;font-size:0.75rem;">
          Remove
        </button>
      </td>
    `;
    passengerTableBody.appendChild(tr);
    console.log("Row added to table");
  });

  // Attach listeners
  passengerTableBody
    .querySelectorAll(".passenger-remove-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index, 10);
        passengers.splice(idx, 1);
        updateCartUI();
      });
    });

  passengerTableBody.querySelectorAll(".seat-assign-btn").forEach((btn) => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.dataset.index, 10);
      console.log("Opening seat modal for passenger index:", idx);
      console.log("Passengers array:", window.passengers);
      if (!window.passengers || !window.passengers[idx]) {
        alert("Error: Passenger data not found. Please refresh and try again.");
        return;
      }
      openSeatModal(idx);
    });
  });

  // Dynamic pricing based on coach type
  const getCoachMultiplier = (coach) => {
    if (!coach) return 1;
    if (coach.startsWith('C')) return 1; // General (base)
    if (coach.startsWith('A')) return 2; // 2A (AC)
    if (coach.startsWith('B')) return 2.5; // 3A (AC)
    if (coach.startsWith('S')) return 3; // Sleeper
    if (coach.startsWith('H')) return 3.5; // 1A (AC)
    return 1;
  };
  
  const total = passengers.reduce((sum, p) => {
    return sum + (selectedTrain.baseFare * getCoachMultiplier(p.coach));
  }, 0);
  totalFareEl.textContent = `₹${Math.round(total)}`;
}

addPassengerBtn.addEventListener("click", () => {
  console.log("Add passenger button clicked");
  console.log("Selected train:", selectedTrain);
  
  if (!selectedTrain) {
    checkoutError.textContent = "Please select a train first.";
    return;
  }
  
  const name = prompt("Passenger name:");
  console.log("Name entered:", name);
  if (!name || name.trim() === "") {
    console.log("Name cancelled or empty");
    return;
  }
  
  const ageStr = prompt("Passenger age:");
  console.log("Age entered:", ageStr);
  const age = parseInt(ageStr, 10);
  if (isNaN(age) || age <= 0) {
    alert("Please enter a valid age");
    return;
  }
  
  const gender = prompt("Gender (M/F/Other):") || "Other";
  console.log("Gender entered:", gender);
  
  const phone = prompt("Phone number (with country code, e.g., +911234567890):");
  console.log("Phone entered:", phone);
  if (phone === null) {
    console.log("Phone prompt cancelled");
    return;
  }
  if (phone.trim() === "") {
    alert("Phone number is required");
    return;
  }

  const newPassenger = {
    name: name.trim(),
    age,
    gender: gender.trim(),
    phone: phone.trim(),
    coach: null,
    seatNo: null,
    berthType: null,
  };
  
  console.log("New passenger object:", newPassenger);
  passengers.push(newPassenger);
  window.passengers = passengers;
  console.log("Passengers array after push:", passengers);
  console.log("Window passengers:", window.passengers);
  
  updateCartUI();
  alert(`Passenger ${name} added successfully!`);
});

// Payment method UI
paymentMethodSelect.addEventListener("change", () => {
  if (paymentMethodSelect.value === "CARD") {
    cardNumberGroup.style.display = "block";
  } else {
    cardNumberGroup.style.display = "none";
  }
});

// Checkout  ✅ FIXED HERE
checkoutBtn.addEventListener("click", async () => {
  checkoutError.textContent = "";
  if (!selectedTrain) {
    checkoutError.textContent = "No train selected.";
    return;
  }

  if (!passengers.length) {
    checkoutError.textContent = "Add at least one passenger.";
    return;
  }

  // Require seat for each passenger
  const missingSeat = passengers.some((p) => !p.coach || !p.seatNo);
  if (missingSeat) {
    checkoutError.textContent = "Please assign seats to all passengers.";
    return;
  }

  const journeyDate = document.getElementById("dateInput").value;
  if (!journeyDate) {
    checkoutError.textContent =
      "Go back to Search and select journey date.";
    return;
  }

  const paymentMethod = paymentMethodSelect.value;
  let cardNumber = cardNumberInput?.value?.trim() || "";

  if (paymentMethod === "CARD") {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 12) {
      checkoutError.textContent = "Enter a valid mock card number.";
      return;
    }
  }

  // 🔸 BUILD selectedSeats FROM passengers (this is what backend expects)
  const selectedSeats = passengers.map((p) => ({
    coachCode: p.coach,
    seatNo: p.seatNo,
    berth: p.berthType || null,
  }));

  try {
    const res = await apiRequest("/bookings/checkout", {
      method: "POST",
      body: JSON.stringify({
        trainId: selectedTrain._id,
        journeyDate,
        passengers,
        selectedSeats, // <-- now sent
        paymentMethod,
        cardNumber,
      }),
    });

    alert("Booking confirmed! PNR: " + res.pnr);

    if (res.whatsappLink) {
      window.open(res.whatsappLink, '_blank');
    }

    selectedTrain = null;
    passengers = [];
    seatAssignments = {};
    cardNumberInput.value = "";
    updateCartUI();

    document
      .querySelector('.menu-btn[data-section="bookingsSection"]')
      .click();
  } catch (err) {
    checkoutError.textContent = err.message;
  }
});

// ---------------------- SEAT MODAL LOGIC ----------------------
const seatModal = document.getElementById("seatModal");
const seatCoachSelect = document.getElementById("seatCoachSelect");
const seatGrid = document.getElementById("seatGrid");
const seatSelectedLabel = document.getElementById("seatSelectedLabel");
const seatConfirmBtn = document.getElementById("seatConfirmBtn");
const seatCancelBtn = document.getElementById("seatCancelBtn");
const seatCloseX = document.getElementById("seatCloseX");

let tempSelectedCoach = null;
let tempSelectedSeatNo = null;
let tempSelectedBerthType = null;

function openSeatModal(passengerIndex) {
  console.log("openSeatModal called with index:", passengerIndex);
  console.log("window.passengers:", window.passengers);
  console.log("window.passengers length:", window.passengers?.length);
  
  currentSeatPassengerIndex = passengerIndex;
  const passenger = window.passengers[passengerIndex];
  console.log("Passenger object:", passenger);
  
  if (!passenger) {
    alert("Error: Passenger not found");
    return;
  }

  // Build coach select
  seatCoachSelect.innerHTML = "";
  COACH_CODES.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = c.label;
    seatCoachSelect.appendChild(opt);
  });

  // Default coach
  let defaultCoach = passenger.coach;
  if (!defaultCoach) {
    const cls = (window.selectedTrain?.classType || "").toLowerCase();
    if (cls.includes("sleeper") || cls.includes("sl")) defaultCoach = "S1";
    else if (cls.includes("3a")) defaultCoach = "B1";
    else if (cls.includes("2a")) defaultCoach = "A1";
    else if (cls.includes("1a")) defaultCoach = "H1";
    else if (cls.includes("chair")) defaultCoach = "C1";
    else defaultCoach = "S1";
  }
  seatCoachSelect.value = defaultCoach;

  tempSelectedCoach = passenger.coach || defaultCoach;
  tempSelectedSeatNo = passenger.seatNo || null;
  tempSelectedBerthType = passenger.berthType || null;

  buildSeatGrid();
  updateSelectedSeatLabel();

  seatModal.style.display = "flex";
}

function closeSeatModal() {
  seatModal.style.display = "none";
  currentSeatPassengerIndex = null;
  tempSelectedCoach = null;
  tempSelectedSeatNo = null;
  tempSelectedBerthType = null;
}

seatCoachSelect.addEventListener("change", () => {
  tempSelectedCoach = seatCoachSelect.value;
  tempSelectedSeatNo = null;
  tempSelectedBerthType = null;
  buildSeatGrid();
  updateSelectedSeatLabel();
});

seatCancelBtn.addEventListener("click", closeSeatModal);
seatCloseX.addEventListener("click", closeSeatModal);

seatConfirmBtn.addEventListener("click", () => {
  if (
    currentSeatPassengerIndex == null ||
    !tempSelectedCoach ||
    !tempSelectedSeatNo
  ) {
    alert("Please select a seat.");
    return;
  }

  // Check if seat is already booked
  if (seatAssignments[tempSelectedCoach] && seatAssignments[tempSelectedCoach][tempSelectedSeatNo] != null) {
    const bookedByIndex = seatAssignments[tempSelectedCoach][tempSelectedSeatNo];
    if (bookedByIndex !== currentSeatPassengerIndex) {
      const bookedPassenger = window.passengers[bookedByIndex];
      alert(`This seat ${tempSelectedCoach}-${tempSelectedSeatNo} is already booked by ${bookedPassenger.name}. Please select another seat.`);
      return;
    }
  }

  const p = window.passengers[currentSeatPassengerIndex];

  // Remove old assignment
  if (p.coach && p.seatNo && seatAssignments[p.coach]) {
    if (seatAssignments[p.coach][p.seatNo] === currentSeatPassengerIndex) {
      delete seatAssignments[p.coach][p.seatNo];
    }
  }

  // Save new one
  p.coach = tempSelectedCoach;
  p.seatNo = tempSelectedSeatNo;
  p.berthType = tempSelectedBerthType;

  if (!seatAssignments[p.coach]) seatAssignments[p.coach] = {};
  seatAssignments[p.coach][p.seatNo] = currentSeatPassengerIndex;

  closeSeatModal();
  updateCartUI();
});

function updateSelectedSeatLabel() {
  if (!tempSelectedCoach || !tempSelectedSeatNo) {
    seatSelectedLabel.textContent = "None";
  } else {
    const main = `${tempSelectedCoach}-${tempSelectedSeatNo}`;
    if (tempSelectedBerthType) {
      seatSelectedLabel.textContent = `${main} (${tempSelectedBerthType})`;
    } else {
      seatSelectedLabel.textContent = main;
    }
  }
}

function buildSeatGrid() {
  seatGrid.innerHTML = "";

  const coachCode = tempSelectedCoach || seatCoachSelect.value;
  const coachMeta = COACH_CODES.find((c) => c.code === coachCode);
  const isSleeper = coachMeta?.type === "SL";

  const layout = isSleeper ? SLEEPER_LAYOUT : GENERIC_LAYOUT;

  layout.forEach((seat) => {
    const btn = document.createElement("button");
    btn.textContent = seat.seatNo;
    btn.classList.add("seat-btn");

    const berthType = isSleeper ? seat.berthType : null;

    if (isSleeper) {
      btn.classList.add(`seat-berth-${berthType}`);
    } else {
      btn.classList.add("seat-generic");
    }

    const assignedIndex =
      seatAssignments[coachCode] && seatAssignments[coachCode][seat.seatNo];

    const isReserved =
      assignedIndex != null && assignedIndex !== currentSeatPassengerIndex;

    if (isReserved) {
      btn.classList.add("reserved");
      btn.disabled = true;
    }

    if (
      tempSelectedCoach === coachCode &&
      tempSelectedSeatNo === seat.seatNo
    ) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
      console.log("Seat clicked:", seat.seatNo, "Coach:", coachCode);
      if (
        tempSelectedCoach === coachCode &&
        tempSelectedSeatNo === seat.seatNo
      ) {
        console.log("Deselecting seat");
        tempSelectedSeatNo = null;
        tempSelectedBerthType = null;
        tempSelectedCoach = coachCode;
      } else {
        console.log("Selecting seat");
        tempSelectedCoach = coachCode;
        tempSelectedSeatNo = seat.seatNo;
        tempSelectedBerthType = berthType;
      }

      console.log("Selected:", tempSelectedCoach, tempSelectedSeatNo);
      buildSeatGrid();
      updateSelectedSeatLabel();
    });

    seatGrid.appendChild(btn);
  });
}

// ---------------------- BOOKINGS ----------------------
const bookingsTableBody = document.querySelector("#bookingsTable tbody");

async function loadBookings() {
  const bookingsContainer = document.getElementById("bookingsSection");
  const bookingsTable = document.getElementById("bookingsTable");
  const tableContainer = bookingsTable ? bookingsTable.parentElement : null;
  
  if (!tableContainer) {
    console.error("Bookings table container not found");
    return;
  }
  
  try {
    const bookings = await apiRequest("/bookings/my-bookings");
    if (!bookings.length) {
      tableContainer.innerHTML = '<table class="table" id="bookingsTable"><tbody><tr><td colspan="7">No bookings yet.</td></tr></tbody></table>';
      return;
    }

    // Group by booking date (when created)
    const grouped = {};
    bookings.forEach((b) => {
      const dateKey = new Date(b.createdAt).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    });

    // Sort dates descending
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    // Clear and rebuild
    tableContainer.innerHTML = '';

    sortedDates.forEach((dateKey) => {
      const dateBookings = grouped[dateKey];
      const dateLabel = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      
      const section = document.createElement('div');
      section.style.marginBottom = '24px';
      section.innerHTML = `
        <h4 style="margin: 16px 0 8px; color: #00C58A; font-size: 1.1rem; font-weight: 600;">
          📅 ${dateLabel} (${dateBookings.length} booking${dateBookings.length > 1 ? 's' : ''})
        </h4>
        <table class="table">
          <thead>
            <tr>
              <th>Train</th>
              <th>Route</th>
              <th>Date</th>
              <th>Passengers</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
      
      const tbody = section.querySelector('tbody');
      dateBookings.forEach((b) => {
      const date = new Date(b.journeyDate).toLocaleDateString();
      const passengerCount = b.passengers.length;
      const tr = document.createElement("tr");

      const seatStrings = (b.passengers || [])
        .map((p) => {
          if (!p.coach || !p.seatNo) return null;
          return `${p.coach}-${p.seatNo}`;
        })
        .filter(Boolean)
        .join(", ");

      // Always show cancel for CONFIRMED bookings
      const canCancel = b.bookingStatus === 'CONFIRMED';
      
      const isCancelled = b.bookingStatus === 'CANCELLED';
      
      if (isCancelled) {
        tr.style.opacity = '0.6';
        tr.style.background = 'rgba(239,68,68,0.1)';
      }

      tr.innerHTML = `
        <td>${isCancelled ? '❌ ' : ''}${b.train?.name || ""}</td>
        <td>${b.train?.source || ""} → ${b.train?.destination || ""}</td>
        <td>${date}</td>
        <td>${passengerCount}</td>
        <td>${isCancelled ? '<span style="text-decoration:line-through;">₹' + b.totalAmount + '</span>' : '₹' + b.totalAmount}</td>
        <td>${isCancelled ? '<span style="color:#ef4444;font-weight:600;">🚫 CANCELLED</span>' : b.bookingStatus} / ${b.paymentStatus}<br/><span style="font-size:0.75rem;color:#9ca3af;">${seatStrings}</span></td>
        <td>
          ${!isCancelled ? `<button onclick="downloadTicketPDF('${b._id}')" class="btn btn-primary" style="padding:4px 8px;font-size:12px;margin-bottom:4px;">Download PDF</button>` : '<span style="font-size:0.75rem;color:#9ca3af;">Refund Processing</span>'}
          ${canCancel ? `<button onclick="cancelBooking('${b._id}')" class="btn" style="padding:4px 8px;font-size:12px;background:#ef4444;color:white;">Cancel</button>` : ''}
        </td>
      `;
        tbody.appendChild(tr);
      });
      
      tableContainer.appendChild(section);
    });
  } catch (err) {
    tableContainer.innerHTML = "<p style='color:#ef4444;'>" + err.message + "</p>";
  }
}

// ---------------------- TRANSACTIONS ----------------------
const transactionsTableBody =
  document.querySelector("#transactionsTable tbody");

async function loadTransactions() {
  transactionsTableBody.innerHTML = "";
  try {
    const transactions = await apiRequest("/bookings/my-transactions");
    if (!transactions.length) {
      transactionsTableBody.innerHTML =
        "<tr><td colspan='6'>No transactions yet.</td></tr>";
      return;
    }

    transactions.forEach((t) => {
      const date = new Date(t.createdAt).toLocaleString();
      const train = t.booking?.train;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${train?.name || ""}</td>
        <td>${date}</td>
        <td>₹${t.amount}</td>
        <td>${t.method}</td>
        <td>${t.maskedCard || "-"}</td>
        <td>${t.status}</td>
      `;
      transactionsTableBody.appendChild(tr);
    });
  } catch (err) {
    transactionsTableBody.innerHTML =
      "<tr><td colspan='6'>" + err.message + "</td></tr>";
  }
}

// ---------------------- CANCEL BOOKING ----------------------
window.cancelBooking = async function(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking? Refund will be processed within 5-7 business days.')) {
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert('Error: ' + data.message);
      return;
    }

    alert(data.message);
    loadBookings();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ---------------------- PDF DOWNLOAD ----------------------
window.downloadTicketPDF = async function(bookingId) {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Error downloading PDF: ' + err.message);
  }
}

// ---------------------- ADMIN BOOKINGS ----------------------
const adminBookingsContainer = document.getElementById("adminBookingsContainer");
const adminTransactionsContainer = document.getElementById("adminTransactionsContainer");

async function loadAdminBookings() {
  adminBookingsContainer.innerHTML = "";
  try {
    const bookings = await apiRequest("/bookings/admin/all-bookings");
    if (!bookings.length) {
      adminBookingsContainer.innerHTML = "<p style='color:#9ca3af;'>No bookings found.</p>";
      return;
    }

    // Group by date
    const grouped = {};
    bookings.forEach((b) => {
      const dateKey = new Date(b.journeyDate).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    });

    // Sort dates descending
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach((dateKey) => {
      const dateBookings = grouped[dateKey];
      const dateLabel = new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      
      const section = document.createElement('div');
      section.style.marginBottom = '24px';
      section.innerHTML = `
        <h4 style="margin: 16px 0 8px; color: #A54CFF; font-size: 1.1rem; font-weight: 600;">
          📅 ${dateLabel} (${dateBookings.length} booking${dateBookings.length > 1 ? 's' : ''})
        </h4>
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Train</th>
              <th>From → To</th>
              <th>Passengers</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
      
      const tbody = section.querySelector('tbody');
      dateBookings.forEach((b) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.user?.name || "N/A"}<br/><span style="font-size:0.75rem;color:#9ca3af;">${b.user?.email || ""}</span></td>
          <td>${b.train?.name || ""}</td>
          <td>${b.train?.source || ""} → ${b.train?.destination || ""}</td>
          <td>${b.passengers.length}</td>
          <td>₹${b.totalAmount}</td>
          <td>${b.bookingStatus}</td>
        `;
        tbody.appendChild(tr);
      });
      
      adminBookingsContainer.appendChild(section);
    });
  } catch (err) {
    adminBookingsContainer.innerHTML = "<p style='color:#ef4444;'>" + err.message + "</p>";
  }
  
  loadAdminTransactions();
}

async function loadAdminTransactions() {
  adminTransactionsContainer.innerHTML = "";
  try {
    const transactions = await apiRequest("/bookings/admin/all-transactions");
    if (!transactions.length) {
      adminTransactionsContainer.innerHTML = "<p style='color:#9ca3af;'>No transactions found.</p>";
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>User</th>
          <th>Train</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Card</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    transactions.forEach((t) => {
      const date = new Date(t.createdAt).toLocaleString();
      const train = t.booking?.train;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.user?.name || "N/A"}<br/><span style="font-size:0.75rem;color:#9ca3af;">${t.user?.email || ""}</span></td>
        <td>${train?.name || "N/A"}</td>
        <td>${date}</td>
        <td>₹${t.amount}</td>
        <td>${t.method}</td>
        <td>${t.maskedCard || "-"}</td>
        <td>${t.status}</td>
      `;
      tbody.appendChild(tr);
    });
    
    adminTransactionsContainer.appendChild(table);
  } catch (err) {
    adminTransactionsContainer.innerHTML = "<p style='color:#ef4444;'>" + err.message + "</p>";
  }
}
