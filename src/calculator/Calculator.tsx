import React from "react";
import { useEffect, useState } from 'react'
import "./Calculator.scss";

function unaryCalculation(display:number, unary:string){

  if(unary==='sqrt' && display<0){
    alert("BEHAVE!");
    return 0;
  }
  if(unary==='tan' && display%180===90){
    alert("BEHAVE!");
    return 0;
  }
  if(unary==='log' && display<=0){
    alert("BEHAVE!");
    return 0;
  }
  if(unary==='ln' && display<=0){
    alert("BEHAVE!");
    return 0;
  }
  if(unary==='1/x' && display===0){
    alert("BEHAVE!");
    return 0;
  }

  switch(unary){
    case 'sin':
      return Math.sin(2*Math.PI*display/360);
      break;
    case 'cos':
      return Math.cos(2*Math.PI*display/360);
      break;
    case 'tan':
      return Math.tan(2*Math.PI*display/360);
      break;
    case 'sqrt':
      return Math.sqrt(display);
      break;
    case 'log':
      return Math.log10(display);
      break;
    case 'ln':
      return Math.log(display);
      break;
    case '1/x':
      return 1/display;
      break;
    case 'Abs':
      return Math.abs(display);
      break;
    default:
      return 0;
  }
}

function evaluateCalculation(display:number, operation:string, operand:number|null):number{

  if(operand === null){
    return display;
  }
  if (operand === 0 && operation === '/'){
    alert("BEHAVE!");
    return 0;
  }
  if (operand === 0 && operation === '^' && display === 0){
    alert("BEHAVE!");
    return 0;
  }
  if (Math.floor(operand)!==operand && operation === '^' && display < 0){
    alert("BEHAVE!");
    return 0;
  }
  switch(operation){

    case '+':
      return display + operand;
      break;
    case '-':
      return display - operand;
      break;
    case '×':
      return display * operand;
      break;
    case '÷':
      return display / operand;
      break;
    case '^':
      return Math.pow(display,operand);
      break;
    case '=':
      return operand;
      break;
    default:
      return operand;
  }
}

export const Calculator: React.FunctionComponent = () => {

  const [display,   setDisplay  ] = useState <number>      ( 0  );
  const [operand,   setOperand  ] = useState <number|null> (null);
  const [operation, setOperation] = useState <string>      ( '' );
  const [ans,       setAns      ] = useState <number|null> (null);

  const numberSymbols    = [7,8,9,4,5,6,1,2,3,0];
  const operationSymbols = ['÷','×','-','+'];//'^',
  const powerSymbols     = ['C','AC','Del','='];//,'Ans'
  const unarySymbols     = ['sin','cos','tan','sqrt','log','ln','1/x','Abs'];

  const displayPrecision = 11;

  function viewer(display: number, operand: number|null):string {
    return operand ? operand.toString().substring(0,displayPrecision) : display.toString().substring(0,displayPrecision);
  }
  
  return (
    <div className="calculator">
      <div className="viewer">

        <div className="viewer__display">
          {viewer(display, operand)}
        </div>

        <div className="viewer__operation">
          {operation}
        </div>

      </div>
      <div className="buttons">
        <div className="buttons__unary">
            {unarySymbols.map( unarySymbol => (
                <button className="buttons__unary--individual calculator-button" onClick={ () => {
                  setDisplay(unaryCalculation(display,unarySymbol));
                  }}>
                    {unarySymbol}
                </button>
                )
            )}
        </div>
        <div className="buttons__number">
            {numberSymbols.map( numberSymbol => (
                <button className="buttons__number--individual calculator-button" onClick={ () => {
                  setOperand( (operand===null?0:operand)*10 + ((operand===null?0:operand)>=0?1:-1)*numberSymbol )
                  }}>
                    {numberSymbol}
                </button>
                )
            )}
        </div>
        <div className="buttons__operation">
            {operationSymbols.map( operationSymbol => (
              <button className="buttons__operation--individual calculator-button" onClick={ () => {
                    if (operand!==null){
                      if (operation==='='){
                        setDisplay(operand);
                      }
                      else {
                        setDisplay(evaluateCalculation(display,operation,operand));
                      }
                    }
                    setOperation(operationSymbol);
                    setOperand(null);
                  }
                }>
                {operationSymbol}
              </button>
              )
            )}
        </div>
        <div className="buttons__power">
            {powerSymbols.map( powerSymbol => (
                <button className="buttons__power--individual calculator-button" onClick={ () => {
                    switch(powerSymbol) {
                      case '=':
                        setAns(evaluateCalculation(display,operation,operand));
                        setDisplay(evaluateCalculation(display,operation,operand));
                        setOperation('=');
                        setOperand(null);
                        break;
                      case 'AC':
                        setOperand(null);
                        setDisplay(0);
                        setOperation('');
                        break;
                      case 'C':
                        setOperand(display);
                        setDisplay(0);
                        setOperation('');
                        break;
                      case 'Del':
                        let temp = operand===null?0:operand;
                        temp = Math.abs(temp);
                        temp = parseFloat(temp.toString().slice(0,-1));
                        setOperand( temp*Math.sign(operand===null?0:operand) );
                        break;
                      case 'Ans':
                        setOperand(ans);
                        break;
                    }
                }}>
                  {powerSymbol}
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}
