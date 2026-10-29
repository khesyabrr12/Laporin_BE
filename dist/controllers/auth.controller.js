"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100),
    email: zod_1.z.string().trim().email().max(100),
    password: zod_1.z.string().min(8).max(72),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email().max(100),
    password: zod_1.z.string().min(1).max(72),
});
const jwtSecret = process.env.JWT_SECRET;
async function register(req, res) {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Data register tidak valid.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }
        const { name, email, password } = parsed.data;
        const [existing] = await db_1.default.execute("SELECT id_user FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            res.status(409).json({
                message: "Email sudah terdaftar.",
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        await db_1.default.execute(`INSERT INTO users (name, email, password)
       VALUES (?, ?, ?)`, [name, email, hashedPassword]);
        res.status(201).json({
            message: "Registrasi berhasil. Silakan login.",
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server.",
        });
    }
}
async function login(req, res) {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Email atau password tidak valid.",
            });
            return;
        }
        if (!jwtSecret) {
            res.status(500).json({
                message: "Konfigurasi JWT belum tersedia.",
            });
            return;
        }
        const { email, password } = parsed.data;
        const [rows] = await db_1.default.execute(`SELECT id_user, name, email, password, role FROM users WHERE email = ?`, [email]);
        const users = rows;
        if (users.length === 0) {
            res.status(401).json({
                message: "Email atau password salah.",
            });
            return;
        }
        const user = users[0];
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json({
                message: "Email atau password salah.",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id_user: user.id_user,
            role: user.role,
        }, jwtSecret, { expiresIn: "1h" });
        res.json({
            message: "Login berhasil.",
            token,
            user: {
                id_user: user.id_user,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server.",
        });
    }
}
