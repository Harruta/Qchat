import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized - No user found" });
        }

        // Attach the user to the request object for downstream use
        req.user = user;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
