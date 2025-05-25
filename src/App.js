// src/App.js
import React from "react";
import CryptoList from "./components/CryptoList";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto pt-10">
        <CryptoList />
      </div>
    </div>
  );
}

export default App;
