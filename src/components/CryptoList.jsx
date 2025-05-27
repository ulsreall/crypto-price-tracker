// src/components/CryptoList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import "./CryptoList.css";

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  axios
    .get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 20,
        page: 1,
        sparkline: true,
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
}, []);


  if (loading) {
    return <p className="loading">Loading data...</p>;
  }

  return (
    <div className="crypto-container">
      <h2>Crypto Prices</h2>
      <div className="crypto-list">
        {coins.map((coin) => (
          <div className="crypto-card" key={coin.id}>
            <img src={coin.image} alt={coin.name} />
            <h3>{coin.name}</h3>
            <p>{coin.symbol.toUpperCase()}</p>
            <p>${coin.current_price.toLocaleString()}</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart
    data={coin.sparkline_in_7d.price.map((p, i) => ({
      time: i,
      price: p,
    }))}
  >
    <Line
      type="monotone"
      dataKey="price"
      stroke={coin.price_change_percentage_24h >= 0 ? "#4caf50" : "#e53935"} // Hijau atau merah
      strokeWidth={2}
      dot={false}
    />
    <XAxis dataKey="time" hide />
    <YAxis domain={["auto", "auto"]} hide />
    <Tooltip
      formatter={(value) => `$${value.toFixed(2)}`}
      contentStyle={{
        backgroundColor: "#1e1e1e",
        borderRadius: "8px",
        border: "none",
        color: "#fff",
      }}
      labelStyle={{ display: "none" }}
    />
  </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoList;
