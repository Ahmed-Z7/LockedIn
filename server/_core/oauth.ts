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
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  let host = req.get('host');
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
        throw new Error("No access token");
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

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const frontendUrl = process.env.FRONTEND_URL || "https://lockedin-eg.vercel.app";
      res.redirect(frontendUrl);
    } catch (err) {
      console.error("[OAuth] Callback failed", err);
      res.redirect("/auth?error=oauth_failed");
    }
  });
}
