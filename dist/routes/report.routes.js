"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Semua endpoint pengaduan wajib login
router.use(auth_middleware_1.authMiddleware);
router.post("/", report_controller_1.createReport);
router.get("/", report_controller_1.getMyReports);
router.get("/:id", report_controller_1.getReportById);
router.put("/:id", report_controller_1.updateReport);
router.delete("/:id", report_controller_1.deleteReport);
exports.default = router;
