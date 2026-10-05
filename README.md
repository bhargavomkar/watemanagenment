# Waste Management Network (WIN)

WIN is a waste-management web application for industrial businesses. It helps organizations record waste material, discover potential reuse opportunities, simulate logistics, and track sustainability outcomes such as emissions reductions and carbon credits.

The project presents a circular-economy workflow: one business's waste can become another business's input material.

## Features

- **Business accounts:** Register and sign in to access a business dashboard.
- **Waste submission:** Record industrial waste material and view analysis results.
- **Smart matching:** Explore possible material matches and transformation opportunities.
- **Logistics simulation:** Visualize routes, adjust transport parameters, and review fleet status.
- **Impact analytics:** Track waste flow, emissions, savings, sustainability actions, and carbon credits.
- **Urban resource grid:** View industrial clusters and AI-assisted recommendations.
- **Marketplace workflow:** Manage material listings, exchange requests, and transactions.
- **Admin and mediator tools:** Search company activity and review exchange/quality-inspection requests.
- **Theme customization:** Switch themes and adjust visual accent and ambient colors.

## Technology

- Front end: HTML, CSS, and vanilla JavaScript
- Back end: Node.js with Express
- Data storage: Local JSON file (`database.json`)
- API support: CORS and JSON request handling

## Project structure

```text
├── index.html       # Application interface
├── styles.css       # Styles and themes
├── app.js           # Client-side behavior and dashboards
├── server.js        # Express API server
├── database.json    # Local development data store
├── package.json     # Node.js dependencies
└── .env.example     # Environment-variable template
```

## Run locally

### Prerequisites

- Node.js 18 or later

### Start the API

```bash
npm install
node server.js
```

The API starts at `http://localhost:3000`.

### Open the web app

In another terminal, serve the project folder with any static-file server. For example:

```bash
npx serve .
```

Open the local URL printed by the static server in your browser. The client is configured to communicate with the API at `http://localhost:3000`.

## Configuration

If you enable the optional Gemini-powered recommendations, provide the API key at deployment time through `window.GEMINI_API_KEY`. Do not place keys directly in `app.js` or commit secrets to GitHub. See `.env.example` for a safe template.

## Data note

`database.json` is a lightweight local-development store. Use a proper database, server-side authentication, hashed passwords, authorization controls, and environment-based secrets before deploying this application to production.

## License

No license has been selected for this repository yet.
