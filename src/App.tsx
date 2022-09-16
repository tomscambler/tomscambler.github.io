import { useState } from 'react'
import { BlankPage } from "./blankPage/BlankPage";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header></header>
      <body>
        <div className="button-border">
          <div className="button">
          
          </div>
        </div>
      </body>
    </div>
  )
}

export default App
