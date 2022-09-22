import { Baduk } from "./baduk/Baduk";
import { Calculator } from "./calculator/Calculator";
import { LandingPage } from "./landingPage/LandingPage";
import { Route, Routes } from "react-router-dom";
import './App.scss'

function MarsMission() {
  window.location.href = "https://mars-mission-staging.herokuapp.com/";
  return null;
}

function App() {

  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/mars-mission" element={<MarsMission />} />
        <Route path="/baduk" element={<Baduk />} />
    </Routes>
  )
}

export default App;



