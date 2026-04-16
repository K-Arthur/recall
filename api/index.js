// Vercel Serverless Function Entry Point
// This file acts as a catch-all handler for all /api/* requests.
// It imports the Express app from server/index.js and lets Vercel invoke it
// as a serverless function without needing app.listen().

import app from '../server/index.js';

export default app;
