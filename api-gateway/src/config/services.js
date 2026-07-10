const services = [
  {
    route: '/api/auth',
    target: process.env.AUTH_SERVICE_URL,
    auth: false,
  },
  {
    route: '/api/complaints',
    target: process.env.COMPLAINT_SERVICE_URL,
    auth: true,
  },
  {
    route: '/api/workers',
    target: process.env.WORKER_SERVICE_URL,
    auth: true,
  },
  {
    route: '/api/files',
    target: process.env.FILE_SERVICE_URL,
    auth: true,
  },
  {
    route: '/api/notifications',
    target: process.env.NOTIFICATION_SERVICE_URL,
    auth: true,
  },
  {
    route: '/api/analytics',
    target: process.env.ANALYTICS_SERVICE_URL,
    auth: true,
  },
];

const validateServiceConfig = () => {
  const missing = services.filter((s) => !s.target).map((s) => s.route);
  if (missing.length > 0) {
    throw new Error(`Missing service URL env vars for routes: ${missing.join(', ')}`);
  }
};

module.exports = { services, validateServiceConfig };
