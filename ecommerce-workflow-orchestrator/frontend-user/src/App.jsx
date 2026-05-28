import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlaceOrder from "./pages/PlaceOrder";
import TrackOrder from "./pages/TrackOrder";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <Routes>
          <Route path="/"       element={<PlaceOrder />} />
          <Route path="/track"  element={<TrackOrder />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
