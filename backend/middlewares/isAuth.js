import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const header = req.headers?.authorization;
    const bearerToken =
      typeof header === "string" && header.toLowerCase().startsWith("bearer ")
        ? header.slice(7).trim()
        : null;

    const token = bearerToken || req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token not found" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeToken?.userId) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isAuth;
