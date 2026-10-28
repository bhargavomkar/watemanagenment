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
## SharePlate food rescue MVP

SharePlate is a separate surplus-food app in the shareplate/ directory. It lets restaurants, cafes, and hotel kitchens list discounted food, then route an unclaimed offer to a selected community club as a donation.

### Features

- Restaurant signup captures a GPS pin after the user grants browser location access; new listings reuse the saved pin.
- Community members can find nearby offers, filter by radius, and open pickup directions.
- Restaurants can set a donation cutoff. Unclaimed discounted food changes to a free offer for its partner club, which receives first claim.
- A six-digit pickup code verifies the handoff before the restaurant confirms collection and earns Food Score points.
- Local accounts and offers are stored in shareplate/data.json, which is excluded from Git.

### Run SharePlate locally

Requires Node.js 18 or later. From the repository root, change to the shareplate directory and run npm start. Then open http://localhost:3001. This separate port avoids a conflict with the Waste Management API on port 3000.

Browser GPS works on localhost or HTTPS and asks the user for permission. This remains a local MVP: production use still needs a transactional database, food-business verification, and food-safety operating procedures. The app does not send club push notifications; partners see fallback offers in the app.
