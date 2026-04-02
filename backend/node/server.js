import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow requests from your frontend
app.use(express.json());

app.listen(port, () => {
    console.log(`FarmAssist Backend running on http://localhost:${port}`);
});