import React from "react";
import { useEffect, useState } from 'react'
import "./Baduk.scss";

function tileType(boardSize: number, index: number, state: string):string {
    
    let row = Math.floor(index/boardSize);
    let col = index%boardSize;
    
    let firstRow = 0;
    let lastRow = boardSize-1;
    let firstCol = 0;
    let lastCol = boardSize-1;
    
    switch(row) {
        case firstRow:
            switch(col) {
                case firstCol:
                    return `top-left ${state}`;
                case lastCol:
                    return `top-right ${state}`;
                default:
                    return `top-edge ${state}`;
            }
        case lastRow:
            switch(col) {
                case firstCol:
                    return `bottom-left ${state}`;
                case lastCol:
                    return `bottom-right ${state}`;
                default:
                    return `bottom-row ${state}`;
            }
        default:
            switch(col) {
                case firstCol:
                    return `left-edge ${state}`;
                case lastCol:
                    return `right-edge ${state}`;
                default:
                    return `middle ${state}`;
            }
    }
}

function alteredBoardState(index: number, newState: string, boardState: string[]):string[] {
    const newBoardState = new Array(...boardState)
    newBoardState[index] = newState;
    return newBoardState;
}

export const Baduk: React.FunctionComponent = () => {

    let boardSize = 3;

    const [boardState, setBoardState] = useState<string[]>(new Array(boardSize*boardSize).fill("empty"));
    const [playerTurn, setPlayerTurn] = useState<string>("black");

    return( 
        <div className="board"> 
            {boardState.map((state, index) => (
                <button key={index} className={tileType(boardSize, index, state)} onClick={ () => {
                    setBoardState(alteredBoardState(index,playerTurn,boardState));
                    setPlayerTurn(playerTurn=="black"?"white":"black");
                }}></button>
            ))}
        </div>
    );
}
