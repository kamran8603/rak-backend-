const jwt = require("jsonwebtoken");

exports.protect = (roles = []) => {
  return (req, res, next) => {
    let token;

    // Extract token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if user role is authorized
      if (roles.length && !roles.includes(req.user.user.role)) {
        return res
          .status(403)
          .json({ message: "Not authorized, insufficient permissions" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};
