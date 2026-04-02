import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

const getRedirectUri = (req: Request) => {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    return "http://localhost:3000/api/oauth/callback";
  }
  
  // Directly use BACKEND_URL from Railway to ensure 100% match with Google Console
  if (process.env.BACKEND_URL) {
    const baseUrl = process.env.BACKEND_URL.replace(/\/$/, "");
    return `${baseUrl}/api/oauth/callback`;
  }
  
  const host = req.get("host") || "lockedin.up.railway.app";
  const protocol = req.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}/api/oauth/callback`;
};

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    if (!GOOGLE_CLIENT_ID) {
      res.redirect("/auth?error=oauth_not_configured");
      return;
    }
    const redirectUri = getRedirectUri(req);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    res.redirect(authUrl);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error || !code) {
      console.error("OAuth Error:", error);
      res.redirect("/auth?error=oauth_failed");
      return;
    }

    try {
      const redirectUri = getRedirectUri(req);
      
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID || "",
          client_secret: GOOGLE_CLIENT_SECRET || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        console.error("Token Exchange Failed:", tokenData);
        throw new Error(tokenData.error_description || tokenData.error || "No access token");
      }

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userInfo = await userResponse.json();
      
      if (!userInfo.email) throw new Error("No email from Google");

      const openId = userInfo.id || userInfo.email;

      await db.upsertUser({
        openId: openId,
        name: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date().toISOString(),
      });

      const name = userInfo.name || "";
      if (
        !openId ||
        !name
      ) {
        console.warn("[Auth] Session payload missing required fields (openId or name)");
        throw new Error("Invalid session payload");
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      const frontendUrl = process.env.FRONTEND_URL || "https://lockedin-eg.vercel.app";
      res.redirect(`${frontendUrl}/auth?token=${sessionToken}`);
    } catch (err: any) {
      console.error("[OAuth] FATAL ERROR during callback:", err);
      const frontendUrl = process.env.FRONTEND_URL || "https://lockedin-eg.vercel.app";
      const errorMessage = encodeURIComponent(err.message || "oauth_failed");
      res.redirect(`${frontendUrl}/auth?error=oauth_failed&reason=${errorMessage}`);
    }
  });
}
