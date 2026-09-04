const providerMiddleware = (req, res, next) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({
      message: "Only providers can perform this action",
    });
  }

  next();
};

export default providerMiddleware;
