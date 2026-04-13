import { GoGame } from "./goGame/GoGame";
import { Calculator } from "./calculator/Calculator";
import { LandingPage } from "./landingPage/LandingPage";
import { Route, Routes } from "react-router-dom";
import './App.scss'

function App() {

  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/go-game" element={<GoGame />} />
    </Routes>
  )
}

export default App;



