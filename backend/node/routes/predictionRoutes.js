//needs to be fixed 

import express from "express"
const router = express.Router();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import authenticate from "../middleware/auth.js";

router.use(authenticate);

// POST /api/predictions/crop
router.post("/crop", async (req, res) => {
  try {
    const { landId, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall, predictedCrop, confidence } = req.body;
    const prediction = await prisma.cropPrediction.create({
      data: { userId: req.userId, landId, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall, predictedCrop, confidence },
    });
    res.status(201).json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/predictions/crop
router.get("/crop", async (req, res) => {
  try {
    const predictions = await prisma.cropPrediction.findMany({
      where: { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/predictions/yield
router.post("/yield", async (req, res) => {
  try {
    const { landId, crop, area, season, nitrogen, phosphorus, potassium, predictedYield, unit } = req.body;
    const prediction = await prisma.yieldPrediction.create({
      data: { userId: req.userId, landId, crop, area, season, nitrogen, phosphorus, potassium, predictedYield, unit },
    });
    res.status(201).json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/predictions/yield
router.get("/yield", async (req, res) => {
  try {
    const predictions = await prisma.yieldPrediction.findMany({
      where: { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;