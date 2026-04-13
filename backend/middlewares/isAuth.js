import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server auth misconfigured (JWT_SECRET missing)" });
    }

    const header = req.headers?.authorization;
    const bearerToken =
      typeof header === "string" && header.toLowerCase().startsWith("bearer ")
        ? header.slice(7).trim()
        : null;

    const cookieToken = req.cookies?.token;
    if (!bearerToken && !cookieToken) {
      return res.status(401).json({ message: "Unauthorized: token not found" });
    }

    const tryVerify = (token) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded?.userId ? decoded : null;
    };

    let decoded = null;
    let lastError = null;

    if (bearerToken) {
      try {
        decoded = tryVerify(bearerToken);
      } catch (e) {
        lastError = e;
      }
    }

    // If Authorization was present but invalid/expired, still allow a valid cookie token.
    if (!decoded && cookieToken && cookieToken !== bearerToken) {
      try {
        decoded = tryVerify(cookieToken);
      } catch (e) {
        lastError = e;
      }
    }

    if (!decoded?.userId) {
      const name = lastError?.name;
      if (name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthorized: token expired" });
      }
      if (name === "JsonWebTokenError" || name === "NotBeforeError") {
        return res.status(401).json({ message: "Unauthorized: invalid token" });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default isAuth;
