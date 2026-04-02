import express from "express"

const router = express.Router();

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import authenticate from "../middleware/auth.js";

router.use(authenticate);

// GET /api/lands
router.get("/", async (req, res) => {
  try {
    const lands = await prisma.land.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lands
router.post("/", async (req, res) => {
  try {
    const { name, area, location, nitrogen, phosphorus, potassium, ph, temperature, humidity, rainfall } = req.body;

    if (!name || !area || !location) {
      return res.status(400).json({ error: "Name, area, and location are required" });
    }

    const land = await prisma.land.create({
      data: {
        userId:      req.userId,
        name,
        location,
        area:        parseFloat(area),
        nitrogen:    parseFloat(nitrogen),
        phosphorus:  parseFloat(phosphorus),
        potassium:   parseFloat(potassium),
        ph:          parseFloat(ph),
        temperature: parseFloat(temperature),
        humidity:    parseFloat(humidity),
        rainfall:    parseFloat(rainfall),
      },
    });

    res.status(201).json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/lands/:id
router.put("/:id", async (req, res) => {
  try {
    const land = await prisma.land.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!land) return res.status(404).json({ error: "Land not found" });

    const updated = await prisma.land.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/lands/:id
router.delete("/:id", async (req, res) => {
  try {
    const land = await prisma.land.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!land) return res.status(404).json({ error: "Land not found" });

    await prisma.land.delete({ where: { id: req.params.id } });
    res.json({ message: "Land deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
