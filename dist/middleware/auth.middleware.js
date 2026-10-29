"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({
            message: "Gak ada token",
        });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({
            message: "Konfigurasi JWT belum tersedia",
        });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, secret);
        next();
    }
    catch {
        res.status(401).json({
            message: "Token gak valid",
        });
    }
}
