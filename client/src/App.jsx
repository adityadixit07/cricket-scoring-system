import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainBoard from "./components/MainBoard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainBoard />} />
      </Routes>
    </Router>
  );
};

export default App;
