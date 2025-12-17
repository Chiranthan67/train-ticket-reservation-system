// backend/seed/seedTrains.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Train from "../models/Train.js";

dotenv.config({ path: "./.env" });

function normalize(str) {
  return str.toLowerCase();
}

// Sleeper pattern: LB, MB, UB, LB, MB, UB, SL, SU (×9 = 72 seats)
function generateSleeperSeats() {
  const pattern = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];
  const seats = [];
  for (let i = 1; i <= 72; i++) {
    const berth = pattern[(i - 1) % pattern.length];
    seats.push({
      seatNo: String(i),
      berth,
      isBooked: false,
    });
  }
  return seats;
}

function createCoachesForClass(classType) {
  const seats = generateSleeperSeats(); // demo: use same layout for all
  switch (classType.toLowerCase()) {
    case "sleeper":
      return [
        { coachCode: "S1", coachType: "Sleeper", seats },
        { coachCode: "S2", coachType: "Sleeper", seats },
      ];
    case "ac 3 tier":
      return [
        { coachCode: "B1", coachType: "AC 3 Tier", seats },
        { coachCode: "B2", coachType: "AC 3 Tier", seats },
      ];
    case "ac 2 tier":
      return [{ coachCode: "A1", coachType: "AC 2 Tier", seats }];
    case "ac chair car":
      return [{ coachCode: "CC1", coachType: "AC Chair Car", seats }];
    default:
      return [{ coachCode: "GEN1", coachType: "General", seats }];
  }
}

const trains = [
  // --- MAJOR INDIA TRAINS ---
  {
    number: "12301",
    name: "Rajdhani Express",
    source: normalize("delhi"),
    destination: normalize("mumbai"),
    departureTime: "16:25",
    arrivalTime: "08:15",
    baseFare: 1800,
    classType: "AC 3 Tier",
  },
  {
    number: "12951",
    name: "Mumbai–Jaipur Superfast",
    source: normalize("mumbai"),
    destination: normalize("jaipur"),
    departureTime: "18:40",
    arrivalTime: "07:45",
    baseFare: 1450,
    classType: "Sleeper",
  },
  {
    number: "12229",
    name: "Lucknow Mail",
    source: normalize("lucknow"),
    destination: normalize("delhi"),
    departureTime: "22:00",
    arrivalTime: "05:00",
    baseFare: 1200,
    classType: "AC Chair Car",
  },
  {
    number: "12627",
    name: "Karnataka Express",
    source: normalize("bengaluru"),
    destination: normalize("delhi"),
    departureTime: "07:20",
    arrivalTime: "20:45",
    baseFare: 2500,
    classType: "AC 2 Tier",
  },
  {
    number: "22823",
    name: "Bhubaneswar Express",
    source: normalize("bhubaneswar"),
    destination: normalize("hyderabad"),
    departureTime: "13:10",
    arrivalTime: "23:30",
    baseFare: 900,
    classType: "Sleeper",
  },
  {
    number: "12615",
    name: "Grand Trunk Express",
    source: normalize("chennai"),
    destination: normalize("delhi"),
    departureTime: "06:00",
    arrivalTime: "18:30",
    baseFare: 2600,
    classType: "AC 3 Tier",
  },
  {
    number: "11058",
    name: "Amritsar Express",
    source: normalize("amritsar"),
    destination: normalize("delhi"),
    departureTime: "14:10",
    arrivalTime: "19:40",
    baseFare: 850,
    classType: "Sleeper",
  },

  // --- KARNATAKA LOCAL TRAINS ---
  {
    number: "06501",
    name: "Bengaluru–Mysuru Passenger",
    source: normalize("bengaluru"),
    destination: normalize("mysuru"),
    departureTime: "06:30",
    arrivalTime: "09:15",
    baseFare: 80,
    classType: "General",
  },
  {
    number: "06502",
    name: "Mysuru–Bengaluru Passenger",
    source: normalize("mysuru"),
    destination: normalize("bengaluru"),
    departureTime: "10:00",
    arrivalTime: "13:00",
    baseFare: 80,
    classType: "General",
  },
  {
    number: "06503",
    name: "Bengaluru–Hassan DEMU",
    source: normalize("bengaluru"),
    destination: normalize("hassan"),
    departureTime: "15:30",
    arrivalTime: "19:25",
    baseFare: 115,
    classType: "General",
  },
  {
    number: "06504",
    name: "Hassan–Bengaluru DEMU",
    source: normalize("hassan"),
    destination: normalize("bengaluru"),
    departureTime: "06:15",
    arrivalTime: "10:10",
    baseFare: 115,
    classType: "General",
  },
  {
    number: "06505",
    name: "Bengaluru–Tumakuru Passenger",
    source: normalize("bengaluru"),
    destination: normalize("tumakuru"),
    departureTime: "07:50",
    arrivalTime: "09:20",
    baseFare: 45,
    classType: "General",
  },
  {
    number: "06506",
    name: "Tumakuru–Bengaluru Passenger",
    source: normalize("tumakuru"),
    destination: normalize("bengaluru"),
    departureTime: "10:00",
    arrivalTime: "11:30",
    baseFare: 45,
    classType: "General",
  },
  {
    number: "06507",
    name: "Mysuru–Chamarajanagar Passenger",
    source: normalize("mysuru"),
    destination: normalize("chamarajanagar"),
    departureTime: "13:25",
    arrivalTime: "14:55",
    baseFare: 35,
    classType: "General",
  },
  {
    number: "06508",
    name: "Chamarajanagar–Mysuru Passenger",
    source: normalize("chamarajanagar"),
    destination: normalize("mysuru"),
    departureTime: "15:10",
    arrivalTime: "16:45",
    baseFare: 35,
    classType: "General",
  },
  {
    number: "06509",
    name: "Bengaluru–Kolar MEMU",
    source: normalize("bengaluru"),
    destination: normalize("kolar"),
    departureTime: "16:45",
    arrivalTime: "18:40",
    baseFare: 65,
    classType: "General",
  },
  {
    number: "06510",
    name: "Kolar–Bengaluru MEMU",
    source: normalize("kolar"),
    destination: normalize("bengaluru"),
    departureTime: "06:50",
    arrivalTime: "08:45",
    baseFare: 65,
    classType: "General",
  },
  {
    number: "06511",
    name: "Mangaluru–Udupi Passenger",
    source: normalize("mangaluru"),
    destination: normalize("udupi"),
    departureTime: "09:15",
    arrivalTime: "10:55",
    baseFare: 35,
    classType: "General",
  },
  {
    number: "06512",
    name: "Udupi–Mangaluru Passenger",
    source: normalize("udupi"),
    destination: normalize("mangaluru"),
    departureTime: "11:20",
    arrivalTime: "13:00",
    baseFare: 35,
    classType: "General",
  },
  {
    number: "06513",
    name: "Shivamogga–Bhadravati Passenger",
    source: normalize("shivamogga"),
    destination: normalize("bhadravati"),
    departureTime: "07:15",
    arrivalTime: "07:45",
    baseFare: 25,
    classType: "General",
  },
  {
    number: "06514",
    name: "Bhadravati–Shivamogga Passenger",
    source: normalize("bhadravati"),
    destination: normalize("shivamogga"),
    departureTime: "08:00",
    arrivalTime: "08:30",
    baseFare: 25,
    classType: "General",
  },
  {
    number: "06515",
    name: "Bengaluru–Chikkamagaluru Express",
    source: normalize("bengaluru"),
    destination: normalize("chikkamagaluru"),
    departureTime: "14:15",
    arrivalTime: "19:10",
    baseFare: 150,
    classType: "General",
  },
  {
    number: "06516",
    name: "Chikkamagaluru–Bengaluru Express",
    source: normalize("chikkamagaluru"),
    destination: normalize("bengaluru"),
    departureTime: "05:45",
    arrivalTime: "10:40",
    baseFare: 150,
    classType: "General",
  },
];

async function seed() {
  try {
    console.log("Connecting to DB: ", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Deleting existing trains…");
    await Train.deleteMany();

    const trainsWithCoaches = trains.map((t) => ({
      ...t,
      coaches: createCoachesForClass(t.classType),
    }));

    console.log("Inserting trains…");
    await Train.insertMany(trainsWithCoaches);

    console.log("SUCCESS — train data seeded 🎉");
    mongoose.connection.close();
  } catch (err) {
    console.error("❗ SEED ERROR:", err);
    mongoose.connection.close();
  }
}

seed();
