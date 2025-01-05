const authenticateUser = (req, res, next) => {
    // Check if the user session exists
    if (!req.session) {
      return res.status(401).json({ message: "Unauthorized. Please log in to continue." });
    }
  
    // If the user is authenticated, proceed to the next middleware or route handler
    next();
  };
  
  module.exports = { authenticateUser };