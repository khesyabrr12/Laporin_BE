"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
function adminMiddleware(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            message: "Silakan login terlebih dahulu.",
        });
        return;
    }
    if (req.user.role !== "admin") {
        res.status(403).json({
            message: "Akses ditolak. Khusus admin.",
        });
        return;
    }
    next();
}
