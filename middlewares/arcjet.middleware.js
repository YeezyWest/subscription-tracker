import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    const allowed =
      decision?.isAllowed?.() ?? decision?.ok ?? decision?.action === "allow";
    if (allowed) return next();

    if (decision?.reason?.isRateLimit?.()) {
      return res.status(429).json({ message: "Rate limit exceeded" });
    }
    if (decision?.reason?.isBot?.()) {
      return res.status(403).json({ message: "Bot detected" });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    next(error);
  }
};

export default arcjetMiddleware;
