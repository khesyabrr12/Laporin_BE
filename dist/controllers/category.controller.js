"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
const db_1 = __importDefault(require("../db"));
async function getCategories(_req, res) {
    try {
        const [rows] = await db_1.default.execute(`SELECT id_category, name_category
       FROM categories
       ORDER BY id_category ASC`);
        res.json({
            message: "Berhasil mengambil kategori.",
            data: rows,
        });
    }
    catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            message: "Gagal mengambil kategori.",
        });
    }
}
