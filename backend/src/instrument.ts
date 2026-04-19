import * as dotenv from 'dotenv';
dotenv.config();
// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Send structured logs to Sentry
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

console.log('Sentry initialized with DSN:', process.env.SENTRY_DSN);
