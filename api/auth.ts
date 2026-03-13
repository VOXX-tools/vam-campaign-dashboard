/**
 * Vercel Serverless Function for Basic Authentication API
 * 
 * This file is used by Vercel's Serverless Functions and is not part of the main application build.
 * The @vercel/node types are provided by Vercel at runtime.
 * 
 * @see https://vercel.com/docs/concepts/functions/serverless-functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const basicAuth = req.headers.authorization;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

      const validUser = process.env.BASIC_AUTH_USER || 'admin';
      const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

      if (user === validUser && pwd === validPassword) {
        return res.status(200).json({ authenticated: true });
      }
    } catch (error) {
      // Invalid base64 or malformed auth header
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
  return res.status(401).json({ authenticated: false, message: 'Authentication required' });
}
