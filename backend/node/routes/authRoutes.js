import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { z } from 'zod';
import prisma from '../prisma/client.js';

dotenv.config();
const router = express.Router();


// Schema for Registration
const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.email("Invalid email address format"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

// Schema for Login
const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});


router.post('/register', async (req, res) => {
    try {

        // safeParse checks the body without crashing
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            // FIX: Use .issues instead of .errors
            return res.status(400).json({
                error: validation.error.issues[0].message
            });
        }

        // If valid, get the clean data
        const { username, email, password } = validation.data;

        // Check if user exists (Prisma)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email or username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        // Generate Token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({
            token,
            username: newUser.username,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server Error during registration" });
    }
});

router.post('/login', async (req, res) => {
    try {
        // --- ZOD VALIDATION START ---
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            // FIX: Use .issues instead of .errors
            return res.status(400).json({
                error: validation.error.issues[0].message
            });
        }

        const { username, password } = validation.data;
        // --- ZOD VALIDATION END ---


        // Find User
        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Validate Password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            token,
            username: user.username,
            message: "Logged in successfully"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server Error during login" });
    }
});

router.post('/google-sync', async (req, res) => {
    try {
        let { email, username } = req.body;

        // 2. Check if user exists by Email
        let user = await prisma.user.findUnique({
            where: { email: email }
        });

        let isNewUser = false;

        // 3. If user doesn't exist, Create them
        if (!user) {
            isNewUser = true;

            // --- COLLISION CHECK ---
            // See if "Rahul" is already taken
            const existingUsername = await prisma.user.findUnique({
                where: { username: username }
            });

            // If taken, change "Rahul" to "Rahul4821"
            if (existingUsername) {
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                username = `${username}${randomSuffix}`;
            }

            // Create user
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

            user = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: dummyPassword
                }
            });
        }

        // 4. Generate Backend Token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            username: user.username,
            userId: user.id,
            isNewUser
        });

    } catch (error) {
        console.error("Google Sync Error:", error);
        res.status(500).json({ error: "Failed to sync user with database" });
    }
});

export default router;