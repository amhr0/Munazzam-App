// Simple JWT authentication system
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

export type SessionPayload = {
  userId: number;
  email: string;
};

const JWT_SECRET = new TextEncoder().encode(ENV.jwtSecret);
const JWT_ALGORITHM = "HS256";

class SDKServer {
  /**
   * Create a JWT token for a user session
   */
  async createSessionToken(user: User): Promise<string> {
    if (!ENV.jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email || "",
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime("7d") // Token expires in 7 days
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Verify JWT token and return payload
   */
  async verifySessionToken(token: string): Promise<SessionPayload | null> {
    if (!ENV.jwtSecret) {
      console.error("[Auth] JWT_SECRET is not configured");
      return null;
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as SessionPayload;
    } catch (error) {
      console.error("[Auth] JWT verification failed:", error);
      return null;
    }
  }

  /**
   * Authenticate request by reading JWT cookie
   */
  async authenticateRequest(req: Request): Promise<User | null> {
    try {
      // Read cookie from request
      const cookieHeader = req.headers.cookie;
      if (!cookieHeader) {
        console.log("[Auth] Missing session cookie");
        return null;
      }

      const cookies = parseCookieHeader(cookieHeader);
      const sessionToken = cookies[COOKIE_NAME];

      if (!sessionToken) {
        console.log("[Auth] Session cookie not found");
        return null;
      }

      // Verify JWT token
      const payload = await this.verifySessionToken(sessionToken);
      if (!payload) {
        console.log("[Auth] Invalid session token");
        return null;
      }

      // Get user from database
      const user = await db.getUserById(payload.userId);
      if (!user) {
        console.log("[Auth] User not found:", payload.userId);
        return null;
      }

      return user;
    } catch (error) {
      console.error("[Auth] Authentication error:", error);
      return null;
    }
  }
}

export const sdk = new SDKServer();
