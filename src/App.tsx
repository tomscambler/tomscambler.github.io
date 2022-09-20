import { useState } from 'react'
import { BlankPage } from "./blankPage/BlankPage";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header></header>
      <body>
        <div className="button--border">
          <div className="button--actual">
            <div className="button--content">
              Calculator
              <img src="images/calculator.png" className="button--image" />
              <br />
              <p className="button--text">The Calculator app has been built using <ul className="skills-listed"><li>React</li><li>HTML</li><li>SCSS</li></ul></p>
            </div>
          </div>
        </div>
      </body>
    </div>
  )
}

export default App
