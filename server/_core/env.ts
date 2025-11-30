export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  
  // AI API Keys
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  
  // Email Configuration
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  
  // Google OAuth (for Gmail & Calendar integration)
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  
  // Frontend URL
  frontendUrl: process.env.VITE_FRONTEND_URL ?? "http://localhost:3000",
};
