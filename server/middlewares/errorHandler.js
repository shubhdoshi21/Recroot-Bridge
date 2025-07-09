export const errorHandler = (err, req, res, next) => {
  console.log(err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "File Upload Error",
      details: err.message,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Duplicate Entry",
      details: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};
