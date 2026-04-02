//needs to be fixed

import express from "express"
const router = express.Router();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import authenticate from "../middleware/auth.js";

router.use(authenticate);

// POST /api/fertilizer
router.post("/", async (req, res) => {
  try {
    const { landId, crop, nitrogen, phosphorus, potassium, soilType, recommendedFertilizer, dosage } = req.body;
    const rec = await prisma.fertilizerRecommendation.create({
      data: { userId: req.userId, landId, crop, nitrogen, phosphorus, potassium, soilType, recommendedFertilizer, dosage },
    });
    res.status(201).json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fertilizer
router.get("/", async (req, res) => {
  try {
    const recs = await prisma.fertilizerRecommendation.findMany({
      where: { userId: req.userId },
      include: { land: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
