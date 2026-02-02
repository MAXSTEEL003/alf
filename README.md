# EasyTransport (Demo)

A small React + Vite demo app for a transport business. It includes:

- About page
- Create Order page
- Tracking page (view orders, add checkpoints)

This demo stores data in the browser's localStorage.

Get started (bash):

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

Notes:
- This is a local demo. For production, replace localStorage with an API and add validation/auth.

Vercel deployment
-----------------

This project is Vite-based and works with Vercel's static hosting. Steps:

1. Create a project on Vercel and connect your Git repository.
2. In the Vercel project settings, add the following Environment Variables (copy values from your Firebase project):

	- VITE_FIREBASE_API_KEY
	- VITE_FIREBASE_AUTH_DOMAIN
	- VITE_FIREBASE_PROJECT_ID
	- VITE_FIREBASE_STORAGE_BUCKET
	- VITE_FIREBASE_MESSAGING_SENDER_ID
	- VITE_FIREBASE_APP_ID
	- VITE_FIREBASE_MEASUREMENT_ID

3. Set the build command to: `npm run build` and the output directory to `dist` (the default Vite build output).
4. Deploy — Vercel will build the app and serve it as a static site.

Local env
---------

Copy `.env.example` to `.env` and fill the values for local development. Do not commit `.env` to source control.
