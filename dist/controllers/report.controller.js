"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReport = createReport;
exports.getMyReports = getMyReports;
exports.getReportById = getReportById;
exports.updateReport = updateReport;
exports.deleteReport = deleteReport;
const zod_1 = require("zod");
const db_1 = __importDefault(require("../db"));
const reportSchema = zod_1.z.object({
    id_category: zod_1.z.coerce.number().int().positive(),
    title: zod_1.z.string().trim().min(3).max(150),
    description: zod_1.z.string().trim().min(10),
    location: zod_1.z.string().trim().min(2).max(150),
});
const idSchema = zod_1.z.coerce.number().int().positive();
function getId(value) {
    const result = idSchema.safeParse(value);
    return result.success ? result.data : null;
}
// CREATE: membuat pengaduan
async function createReport(req, res) {
    try {
        const parsed = reportSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Data pengaduan tidak valid.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }
        const { id_category, title, description, location } = parsed.data;
        const id_user = req.user.id_user;
        const [result] = await db_1.default.execute(`INSERT INTO reports
       (id_user, id_category, title, description, location)
       VALUES (?, ?, ?, ?, ?)`, [id_user, id_category, title, description, location]);
        const insertResult = result;
        res.status(201).json({
            message: "Pengaduan berhasil dibuat.",
            id_report: insertResult.insertId,
        });
    }
    catch (error) {
        console.error("Create report error:", error);
        res.status(500).json({
            message: "Gagal membuat pengaduan. Periksa kategori dan database.",
        });
    }
}
// READ: melihat pengaduan milik user yang login
async function getMyReports(req, res) {
    try {
        const [rows] = await db_1.default.execute(`SELECT r.id_report, r.title, r.description, r.location,
              r.image_url, r.status, r.admin_note,
              r.id_category, c.name_category,
              r.created_at, r.updated_at
       FROM reports r
       JOIN categories c ON r.id_category = c.id_category
       WHERE r.id_user = ?
       ORDER BY r.created_at DESC`, [req.user.id_user]);
        res.json({
            message: "Berhasil mengambil pengaduan.",
            data: rows,
        });
    }
    catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({
            message: "Gagal mengambil pengaduan.",
        });
    }
}
// READ: melihat detail pengaduan milik user yang login
async function getReportById(req, res) {
    try {
        const id = getId(String(req.params.id));
        if (id === null) {
            res.status(400).json({ message: "ID pengaduan tidak valid." });
            return;
        }
        const [rows] = await db_1.default.execute(`SELECT r.*, c.name_category
       FROM reports r
       JOIN categories c ON r.id_category = c.id_category
       WHERE r.id_report = ? AND r.id_user = ?`, [id, req.user.id_user]);
        const reports = rows;
        if (reports.length === 0) {
            res.status(404).json({
                message: "Pengaduan tidak ditemukan.",
            });
            return;
        }
        res.json({ data: reports[0] });
    }
    catch (error) {
        console.error("Get report detail error:", error);
        res.status(500).json({
            message: "Gagal mengambil detail pengaduan.",
        });
    }
}
// UPDATE: hanya pengaduan berstatus menunggu yang bisa diedit
async function updateReport(req, res) {
    try {
        const id = getId(String(req.params.id));
        if (id === null) {
            res.status(400).json({ message: "ID pengaduan tidak valid." });
            return;
        }
        const parsed = reportSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Data pengaduan tidak valid.",
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }
        const [rows] = await db_1.default.execute(`SELECT status FROM reports
       WHERE id_report = ? AND id_user = ?`, [id, req.user.id_user]);
        const reports = rows;
        if (reports.length === 0) {
            res.status(404).json({
                message: "Pengaduan tidak ditemukan.",
            });
            return;
        }
        if (reports[0].status !== "menunggu") {
            res.status(403).json({
                message: "Pengaduan hanya bisa diedit saat status menunggu.",
            });
            return;
        }
        const { id_category, title, description, location } = parsed.data;
        await db_1.default.execute(`UPDATE reports
       SET id_category = ?, title = ?, description = ?, location = ?
       WHERE id_report = ? AND id_user = ?`, [id_category, title, description, location, id, req.user.id_user]);
        res.json({ message: "Pengaduan berhasil diperbarui." });
    }
    catch (error) {
        console.error("Update report error:", error);
        res.status(500).json({
            message: "Gagal memperbarui pengaduan.",
        });
    }
}
// DELETE: hanya pengaduan berstatus menunggu yang bisa dihapus
async function deleteReport(req, res) {
    try {
        const id = getId(String(req.params.id));
        if (id === null) {
            res.status(400).json({ message: "ID pengaduan tidak valid." });
            return;
        }
        const [rows] = await db_1.default.execute(`SELECT status FROM reports
       WHERE id_report = ? AND id_user = ?`, [id, req.user.id_user]);
        const reports = rows;
        if (reports.length === 0) {
            res.status(404).json({
                message: "Pengaduan tidak ditemukan.",
            });
            return;
        }
        if (reports[0].status !== "menunggu") {
            res.status(403).json({
                message: "Pengaduan hanya bisa dihapus saat status menunggu.",
            });
            return;
        }
        await db_1.default.execute(`DELETE FROM reports
       WHERE id_report = ? AND id_user = ?`, [id, req.user.id_user]);
        res.json({ message: "Pengaduan berhasil dihapus." });
    }
    catch (error) {
        console.error("Delete report error:", error);
        res.status(500).json({
            message: "Gagal menghapus pengaduan.",
        });
    }
}
