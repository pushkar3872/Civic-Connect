const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('./middleware/verifyToken');
const errorHandler = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const internalRouter = require('./routes/internal');
const { services, validateServiceConfig } = require('./config/services');

const createApp = (io) => {
  validateServiceConfig();

  const app = express();

  app.set('io', io);

  app.use(morgan('dev'));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        statusCode: 429,
        message: 'Too many requests, please try again after 15 minutes',
      },
    }),
  );

  app.use('/health', healthRouter);
  app.use('/internal', express.json(), internalRouter);

  services.forEach(({ route, target, auth }) => {
    const proxy = createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req) => req.originalUrl,
      on: {
        proxyReq: (proxyReq, req) => {
            if (req.user) {
              proxyReq.setHeader('x-user-id', String(req.user.id || req.user.userId || ''));
              proxyReq.setHeader('x-user-role', req.user.role || '');
              if (req.user.email) {
                proxyReq.setHeader('x-user-email', req.user.email);
              }
            }
            try {
              console.log('[APIGateway] proxyReq - forwarding request', {
                route,
                target,
                originalUrl: req.originalUrl,
                hasAuthHeader: Boolean(req.headers.authorization),
                forwardedUserId: req.user ? String(req.user.id || req.user.userId || '') : null,
                forwardedUserRole: req.user ? req.user.role : null,
              });
            } catch (e) {
              console.log('[APIGateway] proxyReq - forwarding (raw)');
            }
        },
        error: (err, req, res) => {
          if (!res.headersSent) {
            res.status(503).json({
              success: false,
              statusCode: 503,
              message: `Service unavailable: ${route}`,
              errors: [err.message],
            });
          }
        },
      },
    });

    if (auth) {
      app.use(route, verifyToken, proxy);
    } else {
      app.use(route, proxy);
    }
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
};

module.exports = createApp;
