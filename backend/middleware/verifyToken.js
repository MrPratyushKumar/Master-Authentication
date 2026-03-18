// middleware/verifyToken.js

import jwt from "jsonwebtoken"

// ─── VERIFY TOKEN MIDDLEWARE ──────────────────────────────────────────────────
// This runs Before any protected route handler
// It reads the JWT from the cookie and attaches userID to the request
// Think of it like a security guard checking your ID before letting you in

export const verifyToken = (req , res , next) => {
  // 1. Read the token from the cookie 
  // The cookie was set during login/signup by generateTokenAndSetCookie()
  const token = req.cookies.token;

  // 2. If no cookie found - user is not logged in
  if(!token){
    return res.status(401).json({
      success : false,
      message: "Unauthorized - no token provided",
    });
  }

  try {
    // 3.verify the token using our JWT_SECRET from .env
    // jwt.verify() will throw an error if token is invalid or expired
    const decoded = jwt.verify(token , process.env.JWT_SECRET);


    // 4. Attach userId to the request object
    // Now any route that comes after this middleware can use req.userId
    // This is how checkAuth knows WHICH user to look up
    req.userId = decoded.userId; // "userid" matches what you set in generateTokenAndSetCookie.js

    // 5.Call next() to move on to the actual route handler
    next();
  } catch (error) {
     // Token is invalid or expired
    return res.status(401).json({
      success: false,
      message: "Unauthorized - invalid token",
    });
  }
}