const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  path: '/api/auth',
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
};
