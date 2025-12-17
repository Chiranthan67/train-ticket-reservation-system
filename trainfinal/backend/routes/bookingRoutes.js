// backend/routes/bookingRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import Train from "../models/Train.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// Apply auth to all booking routes
router.use(auth);

// PNR generator
function generatePNR() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 10; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

// CHECKOUT + SEAT RESERVATION
router.post("/checkout", async (req, res) => {
  try {
    const {
      trainId,
      journeyDate,
      passengers,
      selectedSeats, // [{coachCode, seatNo, berth}]
      paymentMethod,
      cardNumber,
    } = req.body;

    if (!trainId) {
      return res.status(400).json({ message: "Train ID missing" });
    }

    if (!journeyDate) {
      return res.status(400).json({ message: "Journey date required" });
    }

    if (!passengers || passengers.length === 0) {
      return res
        .status(400)
        .json({ message: "Minimum 1 passenger required" });
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ message: "No seats selected" });
    }

    const train = await Train.findById(trainId);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }

    const journey = new Date(journeyDate);
    if (isNaN(journey.getTime())) {
      return res.status(400).json({ message: "Invalid journey date" });
    }

    // Dynamic pricing based on coach type
    const getCoachMultiplier = (coachCode) => {
      if (!coachCode) return 1;
      if (coachCode.startsWith('C')) return 1; // General (base)
      if (coachCode.startsWith('A')) return 2; // 2A (AC)
      if (coachCode.startsWith('B')) return 2.5; // 3A (AC)
      if (coachCode.startsWith('S')) return 3; // Sleeper
      if (coachCode.startsWith('H')) return 3.5; // 1A (AC)
      return 1;
    };
    
    const totalAmount = selectedSeats.reduce((sum, seat) => {
      return sum + (train.baseFare * getCoachMultiplier(seat.coachCode));
    }, 0);

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    let cleanedCard = "";
    let maskedCard = "-";

    if (paymentMethod === "CARD") {
      if (!cardNumber || typeof cardNumber !== "string") {
        return res.status(400).json({ message: "Card number required" });
      }

      cleanedCard = cardNumber.replace(/\s/g, "");
      if (cleanedCard.length < 12) {
        return res.status(400).json({ message: "Card number too short" });
      }

      maskedCard = "XXXX-XXXX-XXXX-" + cleanedCard.slice(-4);
    }

    // NOTE: if your Train model does NOT have coaches/seats, you can
    // comment out this entire "Ensure seats are still free" section.

    /* -------------- OPTIONAL SEAT LOCKING (requires train.coaches) -------------- */
    /*
    for (const seatSel of selectedSeats) {
      const coachDoc = train.coaches.find(
        (c) => c.coachCode === seatSel.coachCode
      );
      if (!coachDoc) {
        return res
          .status(400)
          .json({ message: `Coach ${seatSel.coachCode} not found` });
      }

      const seatDoc = coachDoc.seats.find(
        (s) => s.seatNo === String(seatSel.seatNo)
      );
      if (!seatDoc) {
        return res.status(400).json({
          message: `Seat ${seatSel.seatNo} not found in coach ${seatSel.coachCode}`,
        });
      }
      if (seatDoc.isBooked) {
        return res.status(400).json({
          message: `Seat ${seatSel.seatNo} in coach ${seatSel.coachCode} is already booked`,
        });
      }
    }

    // mark as booked
    for (const seatSel of selectedSeats) {
      const coachDoc = train.coaches.find(
        (c) => c.coachCode === seatSel.coachCode
      );
      const seatDoc = coachDoc.seats.find(
        (s) => s.seatNo === String(seatSel.seatNo)
      );
      seatDoc.isBooked = true;
    }
    await train.save();
    */
    /* --------------------------------------------------------------------------- */

    const pnr = generatePNR();

    // CREATE BOOKING
    const booking = await Booking.create({
      user: req.user._id,
      train: train._id,
      journeyDate: journey,
      passengers, // each passenger already has coach, seatNo in your schema
      selectedSeats: selectedSeats.map((s) => ({
        coachCode: s.coachCode,
        seatNo: String(s.seatNo),
        berth: s.berth,
      })),
      totalAmount,
      paymentStatus: "PAID",
      bookingStatus: "CONFIRMED",
      pnr,
    });

    // CREATE TRANSACTION
    const transaction = await Transaction.create({
      user: req.user._id,
      booking: booking._id,
      amount: totalAmount,
      method: paymentMethod,
      status: "SUCCESS",
      maskedCard,
    });

    // Convert 24hr to 12hr format
    const to12Hour = (time) => {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    };

    // Send email with PDF
    const firstPassenger = passengers[0];
    let whatsappLink = null;
    if (firstPassenger?.phone) {
      const message = `✅ Booking Confirmed!%0A%0APNR: ${pnr}%0ATrain: ${train.name}%0AFrom: ${train.source} (${to12Hour(train.departureTime)}) to ${train.destination} (${to12Hour(train.arrivalTime)})%0ADate: ${journey.toLocaleDateString()}%0APassengers: ${passengers.length}%0AAmount: ₹${totalAmount}%0A%0AYour ticket is ready!`;
      const cleanPhone = firstPassenger.phone.replace(/[^0-9]/g, '');
      whatsappLink = `https://wa.me/${cleanPhone}?text=${message}`;
    }

    // WhatsApp notification only

    res.status(201).json({
      message: "Booking confirmed",
      pnr,
      booking,
      transaction,
      whatsappLink,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY BOOKINGS
router.get("/my-bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("train")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("My bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: GET ALL BOOKINGS
router.get("/admin/all-bookings", async (req, res) => {
  try {
    console.log("Admin check - User:", req.user.email, "isAdmin:", req.user.isAdmin);
    
    // Check if user is admin OR is admin@railway.com
    if (!req.user.isAdmin && req.user.email !== "admin@railway.com") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const bookings = await Booking.find()
      .populate("train")
      .populate("user", "name email")
      .sort({ journeyDate: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY TRANSACTIONS
router.get("/my-transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "train" },
      })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("My transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: GET ALL TRANSACTIONS
router.get("/admin/all-transactions", async (req, res) => {
  try {
    if (!req.user.isAdmin && req.user.email !== "admin@railway.com") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate({
        path: "booking",
        populate: { path: "train" },
      })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("Admin transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CANCEL BOOKING (only if 2+ days before travel)
router.post("/:id/cancel", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("train");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Check if journey date is at least 2 days away
    const now = new Date();
    const journeyDate = new Date(booking.journeyDate);
    const daysDiff = Math.ceil((journeyDate - now) / (1000 * 60 * 60 * 24));

    if (daysDiff < 2) {
      return res.status(400).json({ 
        message: "Cancellation not allowed. Bookings can only be cancelled at least 2 days before travel date." 
      });
    }

    // Update booking status
    booking.bookingStatus = "CANCELLED";
    await booking.save();

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { booking: booking._id },
      { status: "REFUNDED" }
    );

    res.json({ 
      message: "Booking cancelled successfully. Refund will be processed within 5-7 business days.",
      booking 
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DOWNLOAD TICKET PDF
router.get("/:id/pdf", async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("train");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Convert 24hr to 12hr format
    const to12Hour = (time) => {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    };

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=ticket-${booking._id}.pdf`);
    doc.pipe(res);

    // Header with background
    doc.rect(0, 0, 612, 80).fill("#1e3a8a");
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold").text("INDIAN RAILWAYS", 40, 20);
    doc.fontSize(12).font("Helvetica").text("E-Ticket", 40, 52);
    doc.fillColor("#fbbf24").fontSize(10).text(`PNR: ${booking.pnr}`, 450, 35, { width: 120, align: "right" });

    // Status badge
    doc.roundedRect(450, 52, 120, 20, 3).fill(booking.bookingStatus === "CONFIRMED" ? "#10b981" : "#ef4444");
    doc.fillColor("#ffffff").fontSize(10).text(booking.bookingStatus, 450, 57, { width: 120, align: "center" });

    // Journey section
    doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("Journey Details", 40, 110);
    doc.rect(40, 130, 532, 120).stroke("#d1d5db");
    
    doc.fontSize(11).font("Helvetica");
    doc.fillColor("#6b7280").text("Train Name:", 50, 145);
    doc.fillColor("#000000").font("Helvetica-Bold").text(booking.train.name, 150, 145);
    
    doc.fillColor("#6b7280").font("Helvetica").text("Train Number:", 50, 165);
    doc.fillColor("#000000").font("Helvetica-Bold").text(booking.train.number || "N/A", 150, 165);
    
    doc.fillColor("#6b7280").font("Helvetica").text("Class:", 50, 185);
    doc.fillColor("#000000").font("Helvetica-Bold").text(booking.train.classType || "N/A", 150, 185);
    
    doc.fillColor("#6b7280").font("Helvetica").text("Journey Date:", 50, 205);
    doc.fillColor("#000000").font("Helvetica-Bold").text(new Date(booking.journeyDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), 150, 205);
    
    doc.fillColor("#6b7280").font("Helvetica").text("Departure:", 50, 225);
    doc.fillColor("#000000").font("Helvetica-Bold").text(to12Hour(booking.train.departureTime), 150, 225);

    // Route
    doc.fontSize(24).fillColor("#1e3a8a").text(booking.train.source, 320, 150);
    doc.fontSize(10).fillColor("#6b7280").font("Helvetica").text(to12Hour(booking.train.departureTime), 320, 178);
    doc.fontSize(18).fillColor("#6b7280").text("→", 470, 155);
    doc.fontSize(24).fillColor("#1e3a8a").font("Helvetica-Bold").text(booking.train.destination, 320, 195);
    doc.fontSize(10).fillColor("#6b7280").font("Helvetica").text(to12Hour(booking.train.arrivalTime), 320, 223);

    // Passengers section
    doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("Passenger Details", 40, 270);
    
    let yPos = 295;
    booking.passengers.forEach((p, i) => {
      doc.rect(40, yPos, 532, 50).stroke("#d1d5db");
      doc.roundedRect(50, yPos + 10, 30, 30, 15).fill("#3b82f6");
      doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text(i + 1, 50, yPos + 20, { width: 30, align: "center" });
      
      doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold").text(p.name, 95, yPos + 12);
      doc.fillColor("#6b7280").fontSize(10).font("Helvetica").text(`Age: ${p.age} | Gender: ${p.gender}`, 95, yPos + 28);
      
      doc.fillColor("#1e3a8a").fontSize(11).font("Helvetica-Bold").text(`Seat: ${p.coach}-${p.seatNo}`, 450, yPos + 18);
      if (p.berthType) {
        doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(`(${p.berthType})`, 450, yPos + 32);
      }
      
      yPos += 55;
    });

    // Payment section
    yPos += 10;
    doc.rect(40, yPos, 532, 60).fill("#f3f4f6");
    doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Payment Information", 50, yPos + 10);
    doc.fontSize(11).font("Helvetica");
    doc.fillColor("#6b7280").text("Total Fare:", 50, yPos + 32);
    doc.fillColor("#10b981").fontSize(16).font("Helvetica-Bold").text(`₹${booking.totalAmount}`, 150, yPos + 30);
    doc.fillColor("#6b7280").fontSize(11).font("Helvetica").text("Payment Status:", 350, yPos + 32);
    doc.fillColor(booking.paymentStatus === "PAID" ? "#10b981" : "#ef4444").font("Helvetica-Bold").text(booking.paymentStatus, 470, yPos + 32);

    // Footer
    yPos += 80;
    doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text("This is a computer-generated ticket and does not require a signature.", 40, yPos, { align: "center", width: 532 });
    doc.text(`Booking ID: ${booking._id}`, 40, yPos + 15, { align: "center", width: 532 });
    doc.text("For queries, contact support@indianrailways.com", 40, yPos + 30, { align: "center", width: 532 });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to generate PDF as buffer
function generatePDFBuffer(booking, train) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, 612, 80).fill("#1e3a8a");
    doc.fillColor("#ffffff").fontSize(28).font("Helvetica-Bold").text("INDIAN RAILWAYS", 40, 20);
    doc.fontSize(12).font("Helvetica").text("E-Ticket", 40, 52);
    doc.fillColor("#fbbf24").fontSize(10).text(`PNR: ${booking.pnr}`, 450, 35, { width: 120, align: "right" });

    doc.roundedRect(450, 52, 120, 20, 3).fill(booking.bookingStatus === "CONFIRMED" ? "#10b981" : "#ef4444");
    doc.fillColor("#ffffff").fontSize(10).text(booking.bookingStatus, 450, 57, { width: 120, align: "center" });

    doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("Journey Details", 40, 110);
    doc.rect(40, 130, 532, 100).stroke("#d1d5db");
    
    doc.fontSize(11).font("Helvetica");
    doc.fillColor("#6b7280").text("Train Name:", 50, 145);
    doc.fillColor("#000000").font("Helvetica-Bold").text(train.name, 150, 145);
    
    doc.fillColor("#6b7280").font("Helvetica").text("Journey Date:", 50, 165);
    doc.fillColor("#000000").font("Helvetica-Bold").text(new Date(booking.journeyDate).toLocaleDateString("en-IN"), 150, 165);

    doc.fontSize(24).fillColor("#1e3a8a").text(train.source, 320, 150);
    doc.fontSize(18).fillColor("#6b7280").text("→", 470, 155);
    doc.fontSize(24).fillColor("#1e3a8a").text(train.destination, 320, 185);

    doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("Passenger Details", 40, 250);
    
    let yPos = 275;
    booking.passengers.forEach((p, i) => {
      doc.rect(40, yPos, 532, 50).stroke("#d1d5db");
      doc.roundedRect(50, yPos + 10, 30, 30, 15).fill("#3b82f6");
      doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text(i + 1, 50, yPos + 20, { width: 30, align: "center" });
      
      doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold").text(p.name, 95, yPos + 12);
      doc.fillColor("#6b7280").fontSize(10).font("Helvetica").text(`Age: ${p.age} | Gender: ${p.gender}`, 95, yPos + 28);
      
      doc.fillColor("#1e3a8a").fontSize(11).font("Helvetica-Bold").text(`Seat: ${p.coach}-${p.seatNo}`, 450, yPos + 18);
      
      yPos += 55;
    });

    yPos += 10;
    doc.rect(40, yPos, 532, 60).fill("#f3f4f6");
    doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Payment Information", 50, yPos + 10);
    doc.fontSize(11).font("Helvetica");
    doc.fillColor("#6b7280").text("Total Fare:", 50, yPos + 32);
    doc.fillColor("#10b981").fontSize(16).font("Helvetica-Bold").text(`₹${booking.totalAmount}`, 150, yPos + 30);

    yPos += 80;
    doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text("This is a computer-generated ticket.", 40, yPos, { align: "center", width: 532 });

    doc.end();
  });
}

export default router;
