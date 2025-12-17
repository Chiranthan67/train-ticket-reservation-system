// backend/models/Booking.js
import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  phone: String,
  coach: String,     // S1, S2, B1, etc
  seatNo: String,    // "12", "34", etc
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    train: { type: mongoose.Schema.Types.ObjectId, ref: "Train", required: true },
    journeyDate: { type: Date, required: true },
    passengers: [passengerSchema],

    // per-seat selection (what user chose in UI)
    selectedSeats: [
      {
        coachCode: String,   // S1 / B1 / GEN1
        seatNo: String,      // "12"
        berth: String,       // LB / MB / UB / SL / SU / GEN
      },
    ],

    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    bookingStatus: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },

    // unique PNR for each booking (always provided by checkout route)
    pnr: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
