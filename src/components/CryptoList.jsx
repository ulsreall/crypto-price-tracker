// src/components/CryptoList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CryptoList.css"; // ⬅ Tambahin ini

const CryptoList = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    axios
      .get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          ids: "bitcoin,ethereum,dogecoin",
        },
      })
      .then((res) => {
        setCoins(res.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoList;
