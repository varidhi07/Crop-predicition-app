import express from "express";
const router = express.Router();

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import authenticate from "../middleware/auth.js";

const prisma = new PrismaClient();
const PYTHON_SERVICE = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

router.use(authenticate);

// ── POST /api/fertilizer ─────────────────────────────────────────────────────
// Calls Flask for AI recommendation, then persists to DB
router.post("/", async (req, res) => {
  try {
    const {
      landId,
      crop,
      soilType,
      nitrogen, phosphorus, potassium, ph,
    } = req.body;

    // Call Python service for recommendation
    const pyRes = await axios.post(`${PYTHON_SERVICE}/recommend-fertilizer`, {
      N:        nitrogen,
      P:        phosphorus,
      K:        potassium,
      ph:       ph,
      crop:     crop,
      soilType: soilType,
    });

    const {
      recommendations,
      recommendedFertilizer,
      nitrogenStatus,
      phosphorusStatus,
      potassiumStatus,
      advice,
    } = pyRes.data;

    // Persist to DB
    const rec = await prisma.fertilizerRecommendation.create({
      data: {
        userId:               req.userId,
        landId,
        crop,
        soilType:             soilType || "",
        nitrogen,
        phosphorus,
        potassium,
        ph,
        recommendedFertilizer,
        nitrogenStatus,
        phosphorusStatus,
        potassiumStatus,
        advice,
      },
    });

    res.status(201).json({
      ...rec,
      recommendations,    // full list with quantities (not stored in DB, returned live)
    });
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    res.status(500).json({ error: message });
  }
});

// ── GET /api/fertilizer ──────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const recs = await prisma.fertilizerRecommendation.findMany({
      where:   { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
