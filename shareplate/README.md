# SharePlate — Food Rescue MVP

SharePlate connects restaurants, cafes, and hotel kitchens with nearby community members and clubs to sell or redistribute safe surplus food.

## What it does

- Restaurant signup requests browser GPS permission and saves the business pickup pin. New listings reuse that pin, so a restaurant does not need to type its location.
- Restaurants list food, meal count, price, pickup area, date, and pickup window.
- Customers can choose Find near me, sort/filter by distance, and open directions for GPS-pinned listings.
- A discounted offer can have a partner club and donation cutoff. If the offer is still unclaimed at that time, it switches to a free donation for that club. The partner club gets first claim.
- Claimants receive a six-digit pickup code. The restaurant enters the code to confirm the handoff.
- Restaurants start with a Food Score of 50 and earn 10 points for each confirmed pickup.
- The offer feed refreshes periodically; the server processes donation cutoffs automatically.

## Run locally

Requires Node.js 18 or later. No third-party packages are required.

From this directory, run npm start, then open http://localhost:3001.

The app also exposes a health endpoint at http://localhost:3001/api/health.

## Location and privacy

GPS is requested only when a user chooses a GPS action or submits restaurant signup. The browser must grant permission. Geolocation works on localhost and HTTPS; browsers block it on ordinary HTTP network addresses. A restaurant's pickup coordinates are stored with its local account. A browsing customer's position is used in the browser to calculate distances.

## Data and limitations

Accounts and offers are stored in data.json in this folder; the file is excluded from Git. This is a local MVP rather than a public-production deployment. Before serving real users, use a transactional database, verify food businesses and community partners, and establish food-safety, missed-pickup, and complaint procedures. Club partners see donation fallbacks in the app; push notifications are not implemented.
