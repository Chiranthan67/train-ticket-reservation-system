// backend/models/Train.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNo: { type: String, required: true },        // "1", "2", ...
  berth: { type: String, required: true },         // LB / MB / UB / SL / SU / GEN
  isBooked: { type: Boolean, default: false },
});

const coachSchema = new mongoose.Schema({
  coachCode: { type: String, required: true },     // S1, S2, B1, GEN1, etc.
  coachType: { type: String, required: true },     // Sleeper, AC 3 Tier, General...
  seats: [seatSchema],
});

const trainSchema = new mongoose.Schema({
  number: { type: String, required: true },
  name: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  baseFare: { type: Number, required: true },
  classType: { type: String, required: true },
  coaches: [coachSchema],                          // 🔥 new
});

export default mongoose.model("Train", trainSchema);
