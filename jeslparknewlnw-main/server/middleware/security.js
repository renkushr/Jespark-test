// Security middleware for additional checks

// Sanitize user input to prevent XSS
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = sanitize(obj[key]);
      });
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Check for suspicious patterns
export const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\bor\b|\band\b).*=.*\d/i,  // SQL injection patterns
    /<script/i,                   // XSS patterns
    /\.\.\/\.\.\//,               // Path traversal
    /\bexec\b|\beval\b/i,         // Code execution
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn('⚠️ Suspicious activity detected:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.toString()
      });
      return res.status(403).json({ 
        error: 'Forbidden: Suspicious activity detected' 
      });
    }
  }

  next();
};

// Prevent parameter pollution
export const preventParameterPollution = (req, res, next) => {
  const checkPollution = (obj) => {
    for (const key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 10) {
        return true;
      }
    }
    return false;
  };

  if (checkPollution(req.query) || checkPollution(req.body)) {
    return res.status(400).json({ 
      error: 'Bad Request: Parameter pollution detected' 
    });
  }

  next();
};

// Check content type for POST/PUT requests
export const checkContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ 
        error: 'Unsupported Media Type: Content-Type must be application/json' 
      });
    }
  }
  next();
};

// Limit request body size (already handled by express.json but adding explicit check)
export const checkBodySize = (req, res, next) => {
  const maxSize = 1024 * 1024; // 1MB
  const contentLength = parseInt(req.get('Content-Length') || '0');
  
  if (contentLength > maxSize) {
    return res.status(413).json({ 
      error: 'Payload Too Large: Request body exceeds 1MB limit' 
    });
  }
  
  next();
};
