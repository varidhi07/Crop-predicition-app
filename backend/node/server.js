import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import landRoutes from './routes/landRoutes.js'
import fertilizerRoutes from './routes/fertilizerRoutes.js'
import predictionRoutes from './routes/predictionRoutes.js'

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow requests from your frontend
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/predictions",fertilizerRoutes );
app.use("/api/fertilizer",predictionRoutes);

app.listen(port, () => {
    console.log(`FarmAssist Backend running on http://localhost:${port}`);
});
