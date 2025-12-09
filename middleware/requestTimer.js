const requestTimer = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log format: [TIMER] METHOD /api/url - STATUS_CODE [duration_ms]
    console.log(`[TIMER] ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });
  next();
};

export default requestTimer;