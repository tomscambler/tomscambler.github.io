import React, { useEffect } from "react";
import { useState } from 'react'
import "./GoGame.scss";
import Hamburger from 'hamburger-react'

function locationOf(row: number, col: number, boardSize: number): number {
    if(row<0 || row>=boardSize) {
        return -1;
    }
    if(col<0 || col>=boardSize) {
        return -1;
    }
    return boardSize*row + col;
}

function rowOf(currentLocation: number, boardSize: number): number {
    return Math.floor(currentLocation/boardSize);
}

function colOf(currentLocation: number, boardSize: number): number {
    return currentLocation%boardSize;
}

function signOf(color: string): number {
    switch(color) {
        case "black": return +1;
        case "white": return -1;
        default: return 0;
    }
}

function colorOf(groupToCheck: number): string {
    return groupToCheck==0 ? "empty" : groupToCheck>0 ? "black" : "white";
}

function currentGroups(boardState: number[]): number[] {
    return [... new Set(boardState)].filter( x => x!=0 );
}

function nextGroupCounter(boardState: number[], color: string): number {
    if(color=="black") {
        return Math.max(...boardState)+1;
    }
    else {
        return Math.min(...boardState)-1;
    }
}

function tileType(boardSize: number, currentLocation: number, tileState: number, friendlyColor: string): string {
    
    let currentRow = rowOf(currentLocation, boardSize);
    let currentCol = colOf(currentLocation, boardSize);
    
    let firstRow = 0;
    let firstCol = 0;
    let lastRow  = boardSize-1;
    let lastCol  = boardSize-1;
    
    let tileColor = colorOf(tileState);

    switch(currentRow) {
        case firstRow:
            switch(currentCol) {
                case firstCol : return `tile counter-${friendlyColor} top-left     ${tileColor}`;
                case lastCol  : return `tile counter-${friendlyColor} top-right    ${tileColor}`;
                default       : return `tile counter-${friendlyColor} top-edge     ${tileColor}`;
            }
        case lastRow:
            switch(currentCol) {
                case firstCol : return `tile counter-${friendlyColor} bottom-left  ${tileColor}`;
                case lastCol  : return `tile counter-${friendlyColor} bottom-right ${tileColor}`;
                default       : return `tile counter-${friendlyColor} bottom-row   ${tileColor}`;
            }
        default:
            switch(currentCol) {
                case firstCol : return `tile counter-${friendlyColor} left-edge    ${tileColor}`;
                case lastCol  : return `tile counter-${friendlyColor} right-edge   ${tileColor}`;
                default       : return `tile counter-${friendlyColor} middle       ${tileColor}`;
            }
    }
}

function colorOfAdjacentPiece(boardState: number[], currentLocation: number, directionToLookIn: string): string {

    const boardSize: number = Math.sqrt(boardState.length);
    const row = rowOf(currentLocation,boardSize);
    const col = colOf(currentLocation,boardSize);

    const firstRow = 0;
    const lastRow  = boardSize-1;
    const firstCol = 0;
    const lastCol  = boardSize-1;

    switch(directionToLookIn) {
        case "UP"   : return row==firstRow ? "out of bounds" : colorOf(boardState[locationOf(row-1, col  , boardSize)]);
        case "DOWN" : return row==lastRow  ? "out of bounds" : colorOf(boardState[locationOf(row+1, col  , boardSize)]);
        case "LEFT" : return col==firstCol ? "out of bounds" : colorOf(boardState[locationOf(row  , col-1, boardSize)]);
        case "RIGHT": return col==lastCol  ? "out of bounds" : colorOf(boardState[locationOf(row  , col+1, boardSize)]);
        default: return "error";
    }
}

function stateOfAdjacentPiece(boardState: number[], currentLocation: number, directionToLookIn: string): number {

    const boardSize: number = Math.sqrt(boardState.length);
    const row = rowOf(currentLocation,boardSize);
    const col = colOf(currentLocation,boardSize);

    const firstRow = 0;
    const lastRow  = boardSize-1;
    const firstCol = 0;
    const lastCol  = boardSize-1;

    switch(directionToLookIn) {
        case "UP"   : return row==firstRow ? 0 : boardState[locationOf(row-1, col  , boardSize)];
        case "DOWN" : return row==lastRow  ? 0 : boardState[locationOf(row+1, col  , boardSize)];
        case "LEFT" : return col==firstCol ? 0 : boardState[locationOf(row  , col-1, boardSize)];
        case "RIGHT": return col==lastCol  ? 0 : boardState[locationOf(row  , col+1, boardSize)];
        default: return 0;
    }
}

function addNewPieceToBoardState(boardState: number[], currentLocation: number, friendlyColor: string):number[] {
    const returningBoardState = new Array(...boardState);
    const directions = ["UP", "DOWN", "RIGHT", "LEFT"];

    //at least one friendly piece adjacent therefore do tricky stuff
    if (directions.some( direction => colorOfAdjacentPiece(boardState, currentLocation, direction)==friendlyColor )) {
    
        //get the set of adjacent groups
        let adjacentGroups: number[] = [];
        directions.forEach( direction => {
            adjacentGroups.push(stateOfAdjacentPiece(boardState, currentLocation, direction));
        });

        //filter out repeats, enemies and empties
        adjacentGroups = [... new Set(adjacentGroups)].filter( x => x*signOf(friendlyColor)>0 );
        
        //set the new piece to be in the first adjacent group
        returningBoardState[currentLocation] = adjacentGroups[0];

        //replace all occurences of the other adjacent groups in the entire board state
        for( let i=0; i<returningBoardState.length; i++) {
            if (adjacentGroups.includes(returningBoardState[i])) {
                returningBoardState[i] = adjacentGroups[0];
            }
        }
    }
    //no adjacent friendly pieces, easy:
    else {
        returningBoardState[currentLocation] = nextGroupCounter(boardState, friendlyColor);
    }

    return returningBoardState;
}

function removeCapturedEnemyPieces(boardState: number[], enemyColor: string): number[] {

    const returningBoardState = new Array(...boardState);
    const directions = ["UP", "RIGHT", "DOWN", "LEFT"];

    currentGroups(boardState).filter( thisGroup => colorOf(thisGroup)==enemyColor).forEach( thisGroup => {
        let thisGroupLives = false;
        for (let location=0; location<boardState.length; location++) {
            if(boardState[location]==thisGroup) {
                directions.forEach( direction => {
                    thisGroupLives = colorOfAdjacentPiece(boardState, location, direction)=="empty" || thisGroupLives;
                });
            }
        }
        if(!thisGroupLives) {
            for (let i=0; i<boardState.length; i++) {
                if(boardState[i]==thisGroup) {
                    returningBoardState[i] = 0;
                }
            }
        }
    });

    return returningBoardState;
}

function avoidSuicideMoves(boardState: number[], location: number, friendlyColor: string): number[] {

    let returningBoardState = new Array(...boardState);
    const directions = ["UP", "RIGHT", "DOWN", "LEFT"];

    currentGroups(boardState).filter( thisGroup => colorOf(thisGroup)==friendlyColor ).forEach( thisGroup => {
        let thisGroupLives = false;
        for (let location=0; location<boardState.length; location++) {
            if(boardState[location]==thisGroup) {
                directions.forEach( direction => {
                    thisGroupLives = colorOfAdjacentPiece(boardState, location, direction)=="empty" || thisGroupLives;
                });
            }
        }
        if(!thisGroupLives) {
            for( let i=0; i<returningBoardState.length; i++) {
                if(returningBoardState[i]==thisGroup) {
                    returningBoardState[i] = 0;
                }
            }
        }
    });

    if(returningBoardState[location]==0) {
        returningBoardState = new Array(...boardState);
        returningBoardState[location] = 0;
    }
    return returningBoardState;
}

function theseArraysAreEqual(array1: number[], array2: number[]) {
    if(array1.length!=array2.length) {
        return false;
    }
    for( let i=0; i<array1.length; i++) {
        if(array1[i]!=array2[i]) {
            return false;
        }
    }
    return true;
}

function archiveBoardState(boardState: number[]): string {
    let returnValue = "";
    boardState.forEach( x => {
        returnValue += colorOf(x).charAt(0);
    })
    return returnValue;
}

function territoryOf(boardState: number[], location: number): number {
    
    const boardSize: number = Math.sqrt(boardState.length);
    let currentLocation = location;
    let tileScore = 0;

    if(boardState[currentLocation]!=0) {
        return Math.sign(boardState[currentLocation])*4;
    }
    //go up
    currentLocation = location
    while(rowOf(currentLocation, boardSize)>0 && boardState[currentLocation]==0) {
        currentLocation -= boardSize;
        tileScore += Math.sign(boardState[currentLocation]);
    }
    //go down
    currentLocation = location
    while(rowOf(currentLocation, boardSize)<boardSize-1 && boardState[currentLocation]==0) {
        currentLocation += boardSize;
        tileScore += Math.sign(boardState[currentLocation]);
    }
    //go right
    currentLocation = location
    while(colOf(currentLocation, boardSize)<boardSize-1 && boardState[currentLocation]==0) {
        currentLocation += 1;
        tileScore += Math.sign(boardState[currentLocation]);
    }
    //go left
    currentLocation = location
    while(colOf(currentLocation, boardSize)>0 && boardState[currentLocation]==0) {
        currentLocation -= 1;
        tileScore += Math.sign(boardState[currentLocation]);
    }
    return tileScore;
}

function totalScore(boardState: number[]): number[] {
    let komi = -6;
    let blackScore = komi;
    let whiteScore = 0;

    boardState.forEach((tileState, location) => {
        if(tileState > 0) {
            blackScore++;
        }
        else if(tileState < 0) {
            whiteScore++;
        }
        else {
            if(territoryOf(boardState, location) > 0) {
                blackScore++;
            }
            else if(territoryOf(boardState, location) < 0) {
                whiteScore++;
            }
        }
    })

    return [blackScore, whiteScore, komi];
}

export const GoGame: React.FunctionComponent = () => {

    function boardColor(boardTheme: string): string {
        switch (boardTheme) {
            case "Classic": return "#b97a57";
            case "Zen"    : return "#29293d";
            case "Cyber"  : return "#9900cc";
            default: return boardColor("Classic");
        }
    }
    
    const boardThemes = ["Classic", "Zen"];//, "Cyber"];
    const boardSizes  = [9, 13, 19];
    const absolute    = "http://tomscambler.github.io";

    const [boardSize    , setBoardSize    ] = useState<number  > (boardSizes[0]);
    const [boardState   , setBoardState   ] = useState<number[]> (new Array(boardSize*boardSize).fill(0));
    const [friendlyColor, setFriendlyColor] = useState<string  > ("black");
    const [boardHistory , setBoardHistory ] = useState<string[]> (["e".repeat(boardSize*boardSize)]);
    const [isOpen       , setOpen         ] = useState<boolean > (false);
    const [boardTheme   , setBoardTheme   ] = useState<string  > ("Classic");
    const [showScore    , setShowScore    ] = useState<boolean > (false);

    const enemyColor  = friendlyColor=="black" ? "white" : "black";

    const boardCornerEmptyURL = `url("${absolute}/images/${boardTheme}/board-corner-empty.png")`;
    const boardCornerBlackURL = `url("${absolute}/images/${boardTheme}/board-corner-black.png")`;
    const boardCornerWhiteURL = `url("${absolute}/images/${boardTheme}/board-corner-white.png")`;
    const boardEdgeEmptyURL   = `url("${absolute}/images/${boardTheme}/board-edge-empty.png")`;
    const boardEdgeBlackURL   = `url("${absolute}/images/${boardTheme}/board-edge-black.png")`;
    const boardEdgeWhiteURL   = `url("${absolute}/images/${boardTheme}/board-edge-white.png")`;
    const boardMiddleEmptyURL = `url("${absolute}/images/${boardTheme}/board-centre-empty.png")`;
    const boardMiddleBlackURL = `url("${absolute}/images/${boardTheme}/board-centre-black.png")`;
    const boardMiddleWhiteURL = `url("${absolute}/images/${boardTheme}/board-centre-white.png")`;

    const counterBlackURL = `url("${absolute}/images/${boardTheme}/counter-black.png")`;
    const counterWhiteURL = `url("${absolute}/images/${boardTheme}/counter-white.png")`;

    useEffect( () => {document.documentElement.style.setProperty("--board_corner--empty",boardCornerEmptyURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_corner--black",boardCornerBlackURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_corner--white",boardCornerWhiteURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_edge--empty"  ,boardEdgeEmptyURL  )}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_edge--black"  ,boardEdgeBlackURL  )}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_edge--white"  ,boardEdgeWhiteURL  )}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_centre--empty",boardMiddleEmptyURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_centre--black",boardMiddleBlackURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board_centre--white",boardMiddleWhiteURL)}, [boardTheme]);

    useEffect( () => {document.documentElement.style.setProperty("--counter-black",counterBlackURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--counter-white",counterWhiteURL)}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board-color",boardColor(boardTheme))}, [boardTheme]);
    useEffect( () => {document.documentElement.style.setProperty("--board-size",boardSize.toString());}, [boardSize]);

    if(showScore)
    {
        return(
            <div className="page">
                <Hamburger toggled={isOpen} toggle={setOpen} color="#f2f2f2" />
                <div className={`info ${isOpen ? "open" : "closed"}`}>
                    <h1>Go</h1>
                    <h3>The ancient game of Go originated in China some 5000 years ago.</h3>
                    <h3>You can use this app to practise playing against a friend.</h3>
                    <div className="info_buttons">
                        {boardSizes.map( (newBoardSize, index) => (
                            <button key={index} onClick={ () => {
                                setBoardSize(newBoardSize);
                                setBoardState(new Array(newBoardSize*newBoardSize).fill(0));
                                setFriendlyColor("black");
                                setBoardHistory(["e".repeat(newBoardSize*newBoardSize)]);
                                setShowScore(false);
                                setOpen(false);
                            }}>{newBoardSize}x{newBoardSize}</button>
                        ))}
                    </div>
                    <div className="info_buttons">
                        {boardThemes.map( (newBoardTheme, index) => (
                            <button key={index} onClick={ () => {
                                setBoardTheme(newBoardTheme);
                                setOpen(false);
                            }}>{newBoardTheme}</button>
                        ))}
                    </div>
                    <div className="info_buttons">
                        <button onClick={ () => {
                            setShowScore(!showScore);
                            setOpen(false);
                        }}>Estimate Scores</button>
                    </div>
                    <div className="info_buttons">
                        <button onClick={ () => {
                            setBoardState(new Array(boardSize*boardSize).fill(0));
                            setFriendlyColor("black");
                            setBoardHistory(["e".repeat(boardSize*boardSize)]);
                            setShowScore(false);
                            setOpen(false);
                        }}>Reset Game</button>
                    </div>
                </div>
                <div className="board"> 
                    { boardState.map((tileState, location) => (
                        <img key={location} src={`${absolute}/images/${boardTheme}/score_${territoryOf(boardState, location)}.png`} className={tileType(boardSize, location, tileState, friendlyColor)} />
                    ))} 
                </div>
                <div className="scores info">                
                    <h2>Estimated Scores:</h2>
                    <h3>Black: {totalScore(boardState)[0]}</h3>
                    <h3>White: {totalScore(boardState)[1]}</h3>
                    <button onClick={ () => {setShowScore(false);}}>Hide scores</button>
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="page">
                <Hamburger toggled={isOpen} toggle={setOpen} color="#f2f2f2" />
                <div className={`info ${isOpen ? "open" : "closed"}`}>
                    <h1>Go</h1>
                    <h3>The ancient game of Go originated in China some 5000 years ago.</h3>
                    <h3>You can use this app to practise playing against a friend.</h3>
                    <div className="info_buttons">
                        {boardSizes.map( (newBoardSize, index) => (
                            <button key={index} onClick={ () => {
                                setBoardSize(newBoardSize);
                                setBoardState(new Array(newBoardSize*newBoardSize).fill(0));
                                setFriendlyColor("black");
                                setBoardHistory(["e".repeat(newBoardSize*newBoardSize)]);
                                setShowScore(false);
                                setOpen(false);
                            }}>{newBoardSize}x{newBoardSize}</button>
                        ))}
                    </div>
                    <div className="info_buttons">
                        {boardThemes.map( (newBoardTheme, index) => (
                            <button key={index} onClick={ () => {
                                setBoardTheme(newBoardTheme);
                                setOpen(false);
                            }}>{newBoardTheme}</button>
                        ))}
                    </div>
                    <div className="info_buttons">
                        <button onClick={ () => {
                            setShowScore(!showScore);
                            setOpen(false);
                        }}>Estimate Scores</button>
                    </div>
                    <div className="info_buttons">
                        <button onClick={ () => {
                            setBoardState(new Array(boardSize*boardSize).fill(0));
                            setFriendlyColor("black");
                            setBoardHistory(["e".repeat(boardSize*boardSize)]);
                            setShowScore(false);
                            setOpen(false);
                        }}>Reset Game</button>
                    </div>
        
                </div>
                <div className="board"> 
                    { boardState.map((tileState, location) => (
                        <button key={location} className={tileType(boardSize, location, tileState, friendlyColor)} onClick={ () => {
    
                            if(colorOf(tileState)=="empty") {
    
                                let newBoardState = addNewPieceToBoardState(boardState, location, friendlyColor);
                                newBoardState = removeCapturedEnemyPieces(newBoardState, enemyColor);
                                newBoardState = avoidSuicideMoves(newBoardState, location, friendlyColor);
    
                                if(boardHistory.some( previousBoardState => previousBoardState==archiveBoardState(newBoardState))) {
                                    newBoardState = new Array(...boardState);
                                }
                                else {
                                    setBoardState(newBoardState);
                                }
                                
                                if(!theseArraysAreEqual(newBoardState,boardState)) {
                                    setFriendlyColor(enemyColor);
                                    let newBoardHistory = new Array(...boardHistory);
                                    newBoardHistory.push(archiveBoardState(newBoardState));
                                    setBoardHistory(newBoardHistory)
                                }
                            }
                        }}></button>
                    ))}
                </div>
            </div>
        );
    }
}
