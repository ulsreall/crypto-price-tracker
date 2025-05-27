import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "./CryptoList.css";

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("7d");

  const fetchData = () => {
    setLoading(true);
    axios
      .get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 50,
          page: 1,
          sparkline: true,
          price_change_percentage: timeRange,
        },
      })
      .then((res) => {
        setCoins(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={`crypto-container ${darkMode ? "dark" : ""}`}>
      <div className="crypto-header">
        <h2>Crypto Prices</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setTimeRange(e.target.value)} value={timeRange}>
            <option value="7d">7D</option>
            <option value="30d">30D</option>
          </select>
          <button onClick={toggleTheme}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading data...</p>
      ) : (
        <div className="crypto-list">
          {filteredCoins.map((coin) => {
            const prices = coin.sparkline_in_7d?.price || [];
            const isUp = prices.length > 1 && prices[prices.length - 1] >= prices[0];
            return (
              <div className="crypto-card" key={coin.id}>
                <div className="rank-badge">#{coin.market_cap_rank}</div>
                <img src={coin.image} alt={coin.name} />
                <h3>{coin.name}</h3>
                <p>{coin.symbol.toUpperCase()}</p>
                <p>${coin.current_price.toLocaleString()}</p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart
                      data={prices.map((p, i) => ({ time: i, price: p }))}
                    >
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isUp ? "#00C853" : "#D32F2F"}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={["auto", "auto"]} hide />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CryptoList;