// Simple in-memory rate limiter
class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!this.requests.has(ip)) {
        this.requests.set(ip, []);
      }
      
      const userRequests = this.requests.get(ip);
      const recentRequests = userRequests.filter(time => now - time < this.windowMs);
      
      if (recentRequests.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
        });
      }
      
      recentRequests.push(now);
      this.requests.set(ip, recentRequests);
      
      // Cleanup old entries
      if (this.requests.size > 1000) {
        const cutoff = now - this.windowMs;
        for (const [key, times] of this.requests.entries()) {
          const recent = times.filter(t => t > cutoff);
          if (recent.length === 0) {
            this.requests.delete(key);
          } else {
            this.requests.set(key, recent);
          }
        }
      }
      
      next();
    };
  }
}

// Create rate limiters
export const generalLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const authLimiter = new RateLimiter(900000, 5); // 5 requests per 15 minutes
export const aiLimiter = new RateLimiter(60000, 20); // 20 AI requests per minute
