import jwt from "jsonwebtoken";

export const authMiddleware = (req) => {
  // Allow unauthenticated access for certain operations
  if (req.body?.operationName === "Login" || req.body?.operationName === "RegisterUser") {
    return {}; // Skip auth for register/login
  }

  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization token must be 'Bearer [token]'");
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { user }; // Attach user to context
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    throw new Error("Invalid/Expired token");
  }
};
