import express from "express";
const router = express.Router();

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import authenticate from "../middleware/auth.js";

const prisma = new PrismaClient();
const PYTHON_SERVICE = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

router.use(authenticate);

// ── POST /api/predictions/crop ──────────────────────────────────────────────
// Saves the prediction and returns it with the AI soil quality score
router.post("/crop", async (req, res) => {
  try {
    const {
      landId,
      nitrogen, phosphorus, potassium,
      ph, temperature, humidity, rainfall,
    } = req.body;

    // Call Python service for prediction + soil quality score
    const pyRes = await axios.post(`${PYTHON_SERVICE}/predict-crop`, {
      N: nitrogen, P: phosphorus, K: potassium,
      ph, temperature, humidity, rainfall,
    });

    const {
      best_crop,
      confidence,
      top_crops,
      reliable,
      soil_quality_score,
    } = pyRes.data;

    // Persist to DB
    const prediction = await prisma.cropPrediction.create({
      data: {
        userId:        req.userId,
        landId,
        nitrogen,
        phosphorus,
        potassium,
        ph,
        temperature,
        humidity,
        rainfall,
        predictedCrop: best_crop,
        confidence,
        alternativeCrops: top_crops,
      },
    });

    res.status(201).json({
      ...prediction,
      top_crops,
      reliable,
      soil_quality_score,
    });
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    res.status(500).json({ error: message });
  }
});

// ── GET /api/predictions/crop ────────────────────────────────────────────────
router.get("/crop", async (req, res) => {
  try {
    const predictions = await prisma.cropPrediction.findMany({
      where:   { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/predictions/soil-quality ──────────────────────────────────────
// Compute soil quality score without saving a crop prediction
router.post("/soil-quality", async (req, res) => {
  try {
    const { nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall } = req.body;

    const pyRes = await axios.post(`${PYTHON_SERVICE}/soil-quality`, {
      N: nitrogen, P: phosphorus, K: potassium,
      ph, temperature, humidity, rainfall,
    });

    res.json(pyRes.data);
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    res.status(500).json({ error: message });
  }
});

// ── POST /api/predictions/yield ──────────────────────────────────────────────
router.post("/yield", async (req, res) => {
  try {
    const {
      landId, crop, season,
      area,                       // area in acres (from frontend)
      nitrogen, phosphorus, potassium,
      ph, temperature, humidity, rainfall,
      unit,
    } = req.body;

    // Call Python service for yield + soil score
    const pyRes = await axios.post(`${PYTHON_SERVICE}/predict-yield`, {
      N: nitrogen, P: phosphorus, K: potassium,
      ph, temperature, humidity, rainfall,
      crop,
      season,
      area_acres: area,
    });

    const {
      predicted_yield_tonnes,
      yield_per_acre,
      soil_quality_score,
      soil_rating,
    } = pyRes.data;

    // Persist to DB
    const prediction = await prisma.yieldPrediction.create({
      data: {
        userId:          req.userId,
        landId,
        crop,
        season,
        area,
        predictedYield:  predicted_yield_tonnes,
        soilQualityScore: soil_quality_score,
      },
    });

    res.status(201).json({
      ...prediction,
      yield_per_acre,
      soil_quality_score,
      soil_rating,
      unit: unit || "tonnes",
    });
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    res.status(500).json({ error: message });
  }
});

// ── GET /api/predictions/yield ───────────────────────────────────────────────
router.get("/yield", async (req, res) => {
  try {
    const predictions = await prisma.yieldPrediction.findMany({
      where:   { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;