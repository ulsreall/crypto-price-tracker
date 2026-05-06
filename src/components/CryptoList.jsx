import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import "./CryptoList.css";

const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const REFRESH_INTERVAL = 60_000;

const timeRangeOptions = [
  { label: "24H", value: "24h", key: "price_change_percentage_24h_in_currency" },
  { label: "7D", value: "7d", key: "price_change_percentage_7d_in_currency" },
  { label: "30D", value: "30d", key: "price_change_percentage_30d_in_currency" },
];

const formatCurrency = (value) => {
  if (typeof value !== "number") return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

const formatCompact = (value) => {
  if (typeof value !== "number") return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value) => {
  if (typeof value !== "number") return "0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

const getRangeKey = (range) =>
  timeRangeOptions.find((option) => option.value === range)?.key ||
  "price_change_percentage_7d_in_currency";

function CryptoList() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchCoins = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: "50",
          page: "1",
          sparkline: "true",
          price_change_percentage: "24h,7d,30d",
        });

        const response = await fetch(`${API_URL}?${params}`, {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("CoinGecko lagi sibuk. Coba refresh sebentar lagi.");
        }

        const data = await response.json();
        setCoins(data);
        setLastUpdated(new Date());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Gagal mengambil data market.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoins(true);
    const refreshTimer = setInterval(() => fetchCoins(false), REFRESH_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(refreshTimer);
    };
  }, []);

  const rangeKey = getRangeKey(timeRange);

  const filteredCoins = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return coins
      .filter((coin) => {
        if (!query) return true;
        return (
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "price") return b.current_price - a.current_price;
        if (sortBy === "change") return (b[rangeKey] || 0) - (a[rangeKey] || 0);
        if (sortBy === "volume") return b.total_volume - a.total_volume;
        return a.market_cap_rank - b.market_cap_rank;
      });
  }, [coins, rangeKey, searchTerm, sortBy]);

  const featuredCoins = filteredCoins.slice(0, 3);
  const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const gainers = coins.filter((coin) => (coin[rangeKey] || 0) > 0).length;

  return (
    <main className={`app-shell ${darkMode ? "theme-dark" : "theme-light"}`}>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Live Market Dashboard</span>
          <h1>Crypto Price Tracker</h1>
          <p>
            Track top crypto prices, market cap, volume, and sparkline trends from
            CoinGecko in a clean responsive dashboard.
          </p>
          <div className="hero-actions">
            <a href="#market" className="primary-button">Explore Market</a>
            <button className="ghost-button" type="button" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        <div className="market-summary" aria-label="Market summary">
          <div>
            <span>Total Market Cap</span>
            <strong>{formatCompact(totalMarketCap)}</strong>
          </div>
          <div>
            <span>Tracked Assets</span>
            <strong>{coins.length || "--"}</strong>
          </div>
          <div>
            <span>Gainers</span>
            <strong>{gainers}/{coins.length || "--"}</strong>
          </div>
        </div>
      </section>

      <section className="featured-grid" aria-label="Featured coins">
        {loading && coins.length === 0
          ? Array.from({ length: 3 }).map((_, index) => <div className="skeleton-card" key={index} />)
          : featuredCoins.map((coin) => {
              const change = coin[rangeKey] || 0;
              const trendUp = change >= 0;

              return (
                <article className="featured-card" key={coin.id}>
                  <div className="coin-title-row">
                    <div className="coin-logo" aria-hidden="true">
                      <span>{coin.symbol.slice(0, 1).toUpperCase()}</span>
                      <img src={coin.image} alt="" />
                    </div>
                    <div>
                      <h2 title={coin.name}>{coin.name}</h2>
                      <span>{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  <strong>{formatCurrency(coin.current_price)}</strong>
                  <span className={`change-pill ${trendUp ? "up" : "down"}`}>
                    {formatPercent(change)} / {timeRange.toUpperCase()}
                  </span>
                </article>
              );
            })}
      </section>

      <section id="market" className="market-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Top 50 Assets</span>
            <h2>Market Overview</h2>
            <p>
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Fetching latest market data..."}
            </p>
          </div>

          <div className="controls">
            <label>
              <span>Search</span>
              <input
                type="search"
                value={searchTerm}
                placeholder="BTC, ETH, DOGE..."
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label>
              <span>Range</span>
              <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="market_cap_rank">Market Cap Rank</option>
                <option value="price">Price</option>
                <option value="change">Biggest Gainer</option>
                <option value="volume">Volume</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading && coins.length === 0 ? (
          <div className="loading-grid">
            {Array.from({ length: 8 }).map((_, index) => <div className="skeleton-card" key={index} />)}
          </div>
        ) : filteredCoins.length === 0 ? (
          <div className="empty-state">No coin found for “{searchTerm}”.</div>
        ) : (
          <div className="coin-grid">
            {filteredCoins.map((coin) => {
              const prices = coin.sparkline_in_7d?.price || [];
              const change = coin[rangeKey] || 0;
              const trendUp = change >= 0;
              const chartData = prices.map((price, index) => ({ index, price }));

              return (
                <article className="coin-card" key={coin.id}>
                  <div className="rank-badge">#{coin.market_cap_rank}</div>
                  <div className="coin-title-row">
                    <div className="coin-logo" aria-hidden="true">
                      <span>{coin.symbol.slice(0, 1).toUpperCase()}</span>
                      <img src={coin.image} alt="" loading="lazy" />
                    </div>
                    <div>
                      <h3 title={coin.name}>{coin.name}</h3>
                      <span>{coin.symbol.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="coin-price-row">
                    <strong>{formatCurrency(coin.current_price)}</strong>
                    <span className={`change-pill ${trendUp ? "up" : "down"}`}>
                      {formatPercent(change)}
                    </span>
                  </div>

                  <div className="chart-container" aria-label={`${coin.name} 7 day chart`}>
                    <ResponsiveContainer width="100%" height={90}>
                      <LineChart data={chartData}>
                        <YAxis domain={["auto", "auto"]} hide />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            borderRadius: "14px",
                            border: "0",
                            background: darkMode ? "#111827" : "#ffffff",
                            color: darkMode ? "#e5e7eb" : "#111827",
                            boxShadow: "0 18px 40px rgba(15, 23, 42, .18)",
                          }}
                          formatter={(value) => [formatCurrency(value), "Price"]}
                          labelFormatter={() => "Sparkline"}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={trendUp ? "#22c55e" : "#ef4444"}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="coin-meta">
                    <span>Market Cap <strong>{formatCompact(coin.market_cap)}</strong></span>
                    <span>Volume <strong>{formatCompact(coin.total_volume)}</strong></span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default CryptoList;
