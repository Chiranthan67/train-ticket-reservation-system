// backend/routes/trainRoutes.js
import express from "express";
import Train from "../models/Train.js";

const router = express.Router();

// ------------------------
// GET ALL STATIONS
// ------------------------
router.get("/stations", async (req, res) => {
  try {
    const allTrains = await Train.find({}).select("source destination");

    const stations = new Set();
    allTrains.forEach((t) => {
      if (t.source) stations.add(t.source.toLowerCase());
      if (t.destination) stations.add(t.destination.toLowerCase());
    });

    res.json(Array.from(stations).sort());
  } catch (err) {
    console.error("Stations error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// GET COACHES FOR A TRAIN
// ------------------------
router.get("/:id/coaches", async (req, res) => {
  try {
    const train = await Train.findById(req.params.id).select("coaches");
    if (!train) return res.status(404).json({ message: "Train not found" });

    const coachSummary = train.coaches.map((c) => ({
      coachCode: c.coachCode,
      coachType: c.coachType,
      totalSeats: c.seats.length,
      availableSeats: c.seats.filter((s) => !s.isBooked).length,
    }));

    res.json(coachSummary);
  } catch (err) {
    console.error("Get coaches error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// GET SEATS IN A COACH
// ------------------------
router.get("/:id/coaches/:coachCode/seats", async (req, res) => {
  try {
    const { id, coachCode } = req.params;
    const train = await Train.findById(id);
    if (!train) return res.status(404).json({ message: "Train not found" });

    const coach = train.coaches.find((c) => c.coachCode === coachCode);
    if (!coach)
      return res.status(404).json({ message: "Coach not found for this train" });

    res.json(coach.seats);
  } catch (err) {
    console.error("Get seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// GET TRAINS (optionally by source/destination)
// ------------------------
router.get("/", async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (source && destination) {
      const trains = await Train.find({
        source: new RegExp(`^${source}$`, "i"),
        destination: new RegExp(`^${destination}$`, "i"),
      });

      return res.json(trains);
    }

    const trains = await Train.find({});
    res.json(trains);
  } catch (err) {
    console.error("Train fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
