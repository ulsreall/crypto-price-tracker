# Crypto Price Tracker

A clean responsive React dashboard for tracking top cryptocurrency prices, market caps, volume, and short-term trends using the CoinGecko API.

## Features

- Live top 50 crypto market data from CoinGecko
- Search by coin name or symbol
- Sort by market cap rank, price, biggest gainer, or volume
- 24H / 7D / 30D percentage change filters
- Sparkline charts for quick market direction
- Dark / light mode toggle
- Responsive layout for desktop and mobile
- Loading, empty, and API error states

## Tech Stack

- React
- Recharts
- CoinGecko API
- Create React App
- CSS custom properties

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test -- --watchAll=false
```

## API

This app uses the public CoinGecko markets endpoint:

```text
https://api.coingecko.com/api/v3/coins/markets
```

No API key is required for the current setup, but public rate limits may apply.
