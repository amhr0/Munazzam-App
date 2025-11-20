# Cursor Prompts للإصلاحات - مشروع منظّم

هذا الملف يحتوي على Prompts جاهزة لاستخدامها في Cursor لتطبيق الإصلاحات والتحديثات.

---

## 🔴 المرحلة 1: إصلاح الثغرات الأمنية الحرجة

### Prompt 1: إصلاح JWT Token Security

```
@Codebase Fix JWT token security issues:

1. Update `server/middleware/authMiddleware.js`:
   - Fix the protect middleware to properly validate JWT tokens
   - Add return statements to prevent execution after errors
   - Check if user exists before proceeding
   - Handle different JWT error types (TokenExpiredError, JsonWebTokenError)
   - Validate JWT_SECRET exists

2. Update `server/routes/auth.js`:
   - Add validation for JWT_SECRET at the top of the file
   - Implement refresh token mechanism
   - Set tokens in httpOnly cookies instead of returning them in response body

3. Update `client/src/services/auth.js`:
   - Remove localStorage usage for tokens
   - Configure axios to send cookies with requests (withCredentials: true)
   - Update login and register functions to work with cookies

4. Update `client/src/services/api.js`:
   - Remove Authorization header logic (cookies will be sent automatically)
   - Add withCredentials: true to axios config

Follow the security best practices from .cursorrules file.
```

### Prompt 2: تأمين File Upload

```
@Codebase Secure file upload functionality:

1. Install required packages:
   - Add `file-type` package for magic bytes validation
   - Add `express-fileupload` or keep using multer with improvements

2. Update `server/routes/meetings.js`:
   - Add magic bytes validation after file upload
   - Reduce max file size from 100MB to 50MB
   - Add file type whitelist for allowed MIME types
   - Delete file if validation fails
   - Add virus scanning if possible

3. Update `server/server.js`:
   - Protect /uploads route with authentication middleware
   - Add cache control headers to prevent file caching
   - Implement secure file serving

4. Create new middleware `server/middleware/fileValidation.js`:
   - Implement magic bytes checking
   - Add file size validation
   - Add file name sanitization

Apply all security measures from SECURITY_AUDIT_REPORT.md
```

### Prompt 3: منع NoSQL Injection

```
@Codebase Prevent NoSQL injection vulnerabilities:

1. Update `server/server.js`:
   - Import and use express-mongo-sanitize middleware
   - Add it before routes
   - Configure it properly

2. Create `server/middleware/inputSanitization.js`:
   - Create middleware to sanitize all user inputs
   - Escape regex special characters
   - Validate input types

3. Update `server/routes/admin.js`:
   - Sanitize search query in line 78-83
   - Escape regex special characters before using $regex
   - Add input validation

4. Update all routes:
   - Add input sanitization to auth.js
   - Add input sanitization to meetings.js
   - Add input sanitization to calendar.js
   - Add input sanitization to email.js

Follow MongoDB security best practices.
```

### Prompt 4: منع XSS

```
@Codebase Prevent XSS vulnerabilities:

1. Install required packages:
   - Add `dompurify` for HTML sanitization
   - Add `validator` for input validation

2. Update `client/src/pages/Register.jsx`:
   - Add email validation before submission
   - Add password strength validation (min 8 chars, uppercase, lowercase, number)
   - Add name validation (no special characters)
   - Show validation errors to user

3. Update `client/src/pages/Login.jsx`:
   - Add email format validation
   - Add password validation
   - Sanitize inputs before sending

4. Create `client/src/utils/validation.js`:
   - Add validateEmail function
   - Add validatePassword function
   - Add validateName function
   - Add sanitizeInput function using DOMPurify

5. Update `server/server.js`:
   - Add Content-Security-Policy headers
   - Add X-XSS-Protection headers (already exists, verify)

Apply all XSS prevention measures.
```

### Prompt 5: تأمين API Keys

```
@Codebase Secure API keys and sensitive data:

1. Update `docker-compose.yml`:
   - Remove hardcoded API keys (DEEPSEEK_API_KEY, OPENAI_API_KEY, JWT_SECRET)
   - Use environment variables from .env file
   - Add env_file directive to load from .env

2. Create `server/.env.example`:
   - Add all required environment variables with placeholder values
   - Add comments explaining each variable
   - Include MongoDB URI, JWT_SECRET, API keys, etc.

3. Update `.gitignore`:
   - Ensure .env files are ignored
   - Add *.env to gitignore
   - Add .env.local, .env.production

4. Create `server/.env` (if not exists):
   - Copy from .env.example
   - Add real values (this file should never be committed)

5. Update documentation:
   - Update README.md with environment setup instructions
   - Document all required environment variables

Never commit real API keys or secrets.
```

### Prompt 6: تحسين CORS

```
@Codebase Improve CORS configuration:

1. Update `server/server.js`:
   - Update CORS configuration (lines 43-66)
   - Add proper origin whitelist from environment variables
   - Add credentials: true
   - Add proper error handling for CORS errors
   - Add preflight request handling

2. Create `server/config/cors.js`:
   - Move CORS configuration to separate file
   - Add environment-specific configurations
   - Add logging for CORS errors in development

3. Update `.env.example`:
   - Add ALLOWED_ORIGINS variable
   - Add example values

4. Test CORS:
   - Verify frontend can access backend
   - Verify credentials are sent correctly
   - Verify unauthorized origins are blocked

Follow CORS security best practices.
```

---

## 🟡 المرحلة 2: إصلاح الأخطاء البرمجية

### Prompt 7: إصلاح Middleware

```
@Codebase Fix middleware issues:

1. Standardize middleware naming:
   - Ensure all routes use `protect` middleware (not `authenticate`)
   - Update all route files to use consistent naming
   - Remove any unused middleware

2. Update `server/middleware/authMiddleware.js`:
   - Add proper error handling
   - Add logging for authentication failures
   - Add user role checking (if needed)

3. Create `server/middleware/errorHandler.js`:
   - Centralize error handling
   - Add different error types (ValidationError, AuthError, etc.)
   - Add proper logging

4. Update `server/server.js`:
   - Use centralized error handler
   - Add it as the last middleware

Make middleware consistent and well-documented.
```

### Prompt 8: تحسين Rate Limiting

```
@Codebase Improve rate limiting:

1. Update `server/middleware/rateLimiter.js`:
   - Add different rate limits for different endpoints
   - Add stricter limits for auth endpoints (login, register)
   - Add Redis support for distributed rate limiting
   - Add custom error messages

2. Create rate limiters:
   - authLimiter: 5 requests per 15 minutes for login/register
   - apiLimiter: 100 requests per 15 minutes for general API
   - uploadLimiter: 10 requests per hour for file uploads

3. Update routes to use specific limiters:
   - Apply authLimiter to auth routes
   - Apply uploadLimiter to upload routes
   - Apply apiLimiter to other routes

4. Add rate limit headers:
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset

Implement proper rate limiting to prevent abuse.
```

### Prompt 9: إضافة Input Validation

```
@Codebase Add comprehensive input validation:

1. Install validation library:
   - Add `joi` or `yup` for schema validation

2. Create `server/validators/` directory:
   - Create authValidator.js (register, login schemas)
   - Create meetingValidator.js (create, update schemas)
   - Create calendarValidator.js
   - Create emailValidator.js

3. Create validation middleware:
   - Create `server/middleware/validate.js`
   - Add middleware to validate request body against schema
   - Return clear error messages

4. Update all routes:
   - Add validation middleware before route handlers
   - Validate req.body, req.params, req.query
   - Return 400 status with validation errors

5. Add validation to frontend:
   - Use react-hook-form for form validation
   - Add validation schemas
   - Show validation errors to users

Implement comprehensive validation on both frontend and backend.
```

---

## 🟢 المرحلة 3: تحسينات الأداء والجودة

### Prompt 10: Database Optimization

```
@Codebase Optimize database performance:

1. Add indexes to MongoDB collections:
   - Add index on User.email (unique)
   - Add index on Meeting.userId
   - Add index on Meeting.createdAt
   - Add compound indexes where needed

2. Update Mongoose schemas:
   - Add index definitions in schema
   - Add timestamps: true option
   - Add toJSON options to hide sensitive fields

3. Optimize queries:
   - Use projection to limit returned fields
   - Use lean() for read-only queries
   - Add pagination to all list endpoints

4. Add database connection pooling:
   - Configure mongoose connection options
   - Set poolSize appropriately

5. Add query logging in development:
   - Log slow queries
   - Monitor query performance

Optimize database for better performance.
```

### Prompt 11: Frontend Optimization

```
@Codebase Optimize frontend performance:

1. Add loading states:
   - Create LoadingSpinner component
   - Add loading state to all async operations
   - Show skeleton screens for better UX

2. Add error boundaries:
   - Create ErrorBoundary component
   - Wrap main app with error boundary
   - Show user-friendly error messages

3. Improve form validation:
   - Use react-hook-form for all forms
   - Add real-time validation
   - Show clear error messages

4. Add toast notifications:
   - Install react-hot-toast or similar
   - Show success/error notifications
   - Add notification for all user actions

5. Optimize bundle size:
   - Add code splitting
   - Lazy load routes
   - Optimize images

Make frontend responsive and user-friendly.
```

### Prompt 12: Backend Optimization

```
@Codebase Optimize backend performance:

1. Add request logging:
   - Install morgan or winston
   - Log all requests in development
   - Log errors in production
   - Add request ID for tracking

2. Improve error handling:
   - Create custom error classes
   - Add error codes
   - Log errors with context
   - Return consistent error format

3. Add health checks:
   - Improve /health endpoint
   - Add database health check
   - Add external services health check
   - Return detailed status

4. Add monitoring:
   - Add response time tracking
   - Add error rate tracking
   - Add memory usage tracking

5. Optimize API responses:
   - Add compression (gzip)
   - Add caching headers
   - Minimize response payload

Make backend robust and performant.
```

---

## 🎯 المرحلة 4: إكمال الميزات الناقصة

### Prompt 13: OAuth Integration

```
@Codebase Complete OAuth integration:

1. Update `server/routes/oauth.js`:
   - Implement Google OAuth callback
   - Implement Microsoft OAuth callback
   - Handle OAuth errors properly
   - Create or update user on successful OAuth

2. Configure Passport strategies:
   - Update Google OAuth strategy
   - Update Microsoft OAuth strategy
   - Add proper callback URLs

3. Update frontend:
   - Add OAuth buttons to login page
   - Handle OAuth redirect
   - Store tokens properly (httpOnly cookies)

4. Add Google Calendar sync:
   - Implement calendar sync in calendarService.js
   - Add sync endpoint
   - Handle sync errors

5. Add Gmail integration:
   - Implement email fetching in emailService.js
   - Add email parsing
   - Add meeting request detection

Complete OAuth integration for Google and Microsoft.
```

### Prompt 14: UI/UX Improvements

```
@Codebase Improve UI/UX:

1. Create Meeting Details page:
   - Add route for /meetings/:id
   - Show meeting information
   - Show analysis results
   - Show scorecard (for HR)
   - Add edit and delete buttons

2. Improve Dashboard:
   - Add statistics cards
   - Add recent meetings list
   - Add upcoming meetings
   - Add charts for analytics

3. Add Dark Mode:
   - Add theme context
   - Add theme toggle button
   - Update Tailwind config for dark mode
   - Apply dark mode styles

4. Improve Mobile Responsiveness:
   - Test all pages on mobile
   - Fix layout issues
   - Add mobile-friendly navigation
   - Optimize touch targets

5. Add animations:
   - Add page transitions
   - Add loading animations
   - Add hover effects
   - Use framer-motion or similar

Make the app beautiful and user-friendly.
```

### Prompt 15: Testing

```
@Codebase Add comprehensive testing:

1. Setup testing environment:
   - Install Jest and testing-library
   - Configure Jest for both frontend and backend
   - Add test scripts to package.json

2. Add backend tests:
   - Test auth routes (register, login)
   - Test meeting routes (CRUD operations)
   - Test middleware (authentication, validation)
   - Test services (AI, calendar, email)

3. Add frontend tests:
   - Test components (Login, Register, Dashboard)
   - Test services (auth, api)
   - Test contexts (AuthContext)
   - Test user flows

4. Add integration tests:
   - Test API endpoints with database
   - Test OAuth flow
   - Test file upload

5. Add E2E tests:
   - Install Cypress
   - Test critical user flows
   - Test authentication flow
   - Test meeting creation flow

Aim for 80%+ code coverage.
```

---

## 📚 المرحلة 5: التوثيق والنشر

### Prompt 16: Documentation

```
@Codebase Improve documentation:

1. Update README.md:
   - Add clear project description
   - Add installation instructions
   - Add environment variables documentation
   - Add API endpoints documentation
   - Add troubleshooting section

2. Add API documentation:
   - Install swagger-jsdoc and swagger-ui-express
   - Add Swagger annotations to routes
   - Generate API documentation
   - Add /api-docs endpoint

3. Add JSDoc comments:
   - Document all functions
   - Add parameter descriptions
   - Add return type descriptions
   - Add usage examples

4. Create CONTRIBUTING.md:
   - Add contribution guidelines
   - Add code style guide
   - Add PR template
   - Add issue template

5. Update CHANGELOG.md:
   - Document all changes
   - Follow semantic versioning
   - Add dates for each version

Make the project well-documented.
```

### Prompt 17: Deployment

```
@Codebase Prepare for production deployment:

1. Add HTTPS support:
   - Add Let's Encrypt configuration
   - Update nginx.conf for HTTPS
   - Add SSL certificate renewal

2. Add CI/CD pipeline:
   - Create .github/workflows/deploy.yml
   - Add automated testing
   - Add automated deployment
   - Add environment-specific configs

3. Add monitoring:
   - Add Prometheus metrics
   - Add Grafana dashboards
   - Add alerting rules

4. Add logging:
   - Configure Winston for production
   - Add log rotation
   - Add log aggregation

5. Add backup strategy:
   - Add MongoDB backup script
   - Add automated backups
   - Add backup restoration procedure

6. Security hardening:
   - Add Helmet.js with full configuration
   - Add security headers
   - Add CSRF protection
   - Add brute force protection

Make the app production-ready.
```

---

## كيفية استخدام هذه Prompts

1. افتح Cursor في مجلد المشروع
2. اضغط `Ctrl + I` لفتح Composer
3. انسخ الـ Prompt المطلوب
4. الصقه في Composer
5. اضغط Enter وانتظر Cursor لتطبيق التغييرات
6. راجع التغييرات قبل الحفظ
7. اختبر التغييرات
8. انتقل للـ Prompt التالي

## ملاحظات مهمة

- ابدأ بالـ Prompts الحرجة (🔴) أولاً
- اختبر كل تغيير قبل الانتقال للتالي
- راجع الكود الذي يولده Cursor
- تأكد من أن التغييرات لا تكسر الوظائف الموجودة
- احفظ نسخة احتياطية قبل التغييرات الكبيرة

## الترتيب المقترح

1. Prompt 1: JWT Security (أهم شيء)
2. Prompt 5: API Keys (لمنع التسريب)
3. Prompt 3: NoSQL Injection
4. Prompt 2: File Upload Security
5. Prompt 4: XSS Prevention
6. Prompt 6: CORS Configuration
7. Prompt 7-9: إصلاح الأخطاء البرمجية
8. Prompt 10-12: تحسينات الأداء
9. Prompt 13-15: الميزات الناقصة
10. Prompt 16-17: التوثيق والنشر

## دعم إضافي

إذا واجهت أي مشكلة:
1. راجع ملف .cursorrules
2. راجع SECURITY_AUDIT_REPORT.md
3. راجع TODO.md
4. اطلب المساعدة من Cursor Chat
