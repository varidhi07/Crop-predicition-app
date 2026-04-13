import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes        from './routes/authRoutes.js';
import landRoutes        from './routes/landRoutes.js';
import fertilizerRoutes  from './routes/fertilizerRoutes.js';
import predictionRoutes  from './routes/predictionRoutes.js';

dotenv.config();
const app  = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PYTHON_SERVICE_URL env var must point to the running Flask service
// e.g.  PYTHON_SERVICE_URL=http://localhost:5001  (default in predictionRoutes.js)

app.use("/api/auth",        authRoutes);
app.use("/api/lands",       landRoutes);
app.use("/api/fertilizer",  fertilizerRoutes);
app.use("/api/predictions", predictionRoutes);

app.listen(port, () => {
    console.log(`FarmAssist Backend running on http://localhost:${port}`);
});
