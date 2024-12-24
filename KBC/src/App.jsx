import { useState } from "react";
import "./App.css";
import Quiz from "./components/Quiz";
import Intro from "./components/Intro";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />}></Route>
        <Route path="/intro" element={<Intro />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
