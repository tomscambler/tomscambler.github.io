import React from "react";
import { useEffect, useState } from 'react'
import "./Baduk.scss";

function locationOf(row: number, col: number, boardSize: number): number {
    return boardSize*row + col;
}

function rowOf(currentLocation: number, boardSize: number): number {
    return Math.floor(currentLocation/boardSize);
}

function colOf(currentLocation: number, boardSize: number): number {
    return currentLocation%boardSize;
}

function tileType(boardSize: number, currentLocation: number, state: string):string {
    
    let currentRow = rowOf(currentLocation, boardSize);
    let currentCol = colOf(currentLocation, boardSize);
    
    let firstRow = 0;
    let firstCol = 0;
    let lastRow  = boardSize-1;
    let lastCol  = boardSize-1;
    
    switch(currentRow) {
        case firstRow:
            switch(currentCol) {
                case firstCol : return `top-left     ${state}`;
                case lastCol  : return `top-right    ${state}`;
                default       : return `top-edge     ${state}`;
            }
        case lastRow:
            switch(currentCol) {
                case firstCol : return `bottom-left  ${state}`;
                case lastCol  : return `bottom-right ${state}`;
                default       : return `bottom-row   ${state}`;
            }
        default:
            switch(currentCol) {
                case firstCol : return `left-edge    ${state}`;
                case lastCol  : return `right-edge   ${state}`;
                default       : return `middle       ${state}`;
            }
    }
}

function currentGroups(groupState: number[]): number[] {
    let listOfCurrentGroups: number[] = [];

    groupState.forEach( possibleNewGroupCounter => {
        if ( listOfCurrentGroups.every( existingGroupCounter => existingGroupCounter!=possibleNewGroupCounter)) {
            listOfCurrentGroups.push(possibleNewGroupCounter)
        }
    })
    return listOfCurrentGroups;
}

function colorOf(groupToCheck: number, boardState: string[], groupState: number[]): string {
    let returnValue = "fault";
    groupState.forEach( (groupCounter,index) => {
        // console.log(groupCounter);
        if(groupCounter==groupToCheck) {
            returnValue = boardState[index];
        }
    });
    return returnValue;
}

function nextGroupCounter(groupState: number[]): number {
    let max = 0;

    groupState.forEach(groupCounter => {
        max = Math.max(max, groupCounter);
    });

    return max+1;
}

function stateOfAdjacentPiece(boardState: string[], groupState: number[], currentLocation: number, directionToLookIn: string) {

    const boardSize:number = Math.sqrt(boardState.length);
    const row = Math.floor(currentLocation/boardSize);
    const col = currentLocation%boardSize;

    const firstRow = 0;
    const lastRow  = boardSize-1;
    const firstCol = 0;
    const lastCol  = boardSize-1;

    switch(directionToLookIn) {
        case "UP"   : return row==firstRow ? {"board": "out_of_bounds", "group" : 0} : {"board" : boardState[locationOf(row-1, col, boardSize)], "group" : groupState[locationOf(row-1, col, boardSize)]};
        case "DOWN" : return row==lastRow  ? {"board": "out_of_bounds", "group" : 0} : {"board" : boardState[locationOf(row+1, col, boardSize)], "group" : groupState[locationOf(row+1, col, boardSize)]};
        case "LEFT" : return col==firstCol ? {"board": "out_of_bounds", "group" : 0} : {"board" : boardState[locationOf(row, col-1, boardSize)], "group" : groupState[locationOf(row, col-1, boardSize)]};
        case "RIGHT": return col==lastCol  ? {"board": "out_of_bounds", "group" : 0} : {"board" : boardState[locationOf(row, col+1, boardSize)], "group" : groupState[locationOf(row, col+1, boardSize)]};
    }
}

function addNewPieceToGroupState(boardState: string[], groupState: number[], currentLocation: number, friendlyColor: string): number[] {
        
    const newGroupState = new Array(...groupState);
    const directions = ["UP", "DOWN", "RIGHT", "LEFT"];
    
    //no friendly pieces adjacent, make a new group
    if (directions.every( direction => stateOfAdjacentPiece(boardState, groupState, currentLocation, direction)!.board!=friendlyColor)) {
        newGroupState[currentLocation] = nextGroupCounter(groupState);
    }

    let moreThanOneAdjacentFriendlyGroup = false;
    directions.forEach( direction => {
        if(stateOfAdjacentPiece(boardState, groupState, currentLocation, direction)!.board==friendlyColor) {
            if(moreThanOneAdjacentFriendlyGroup) {
                let extraGroup = stateOfAdjacentPiece(boardState, groupState, currentLocation, direction)!.group;
                for (let j=0; j<groupState.length; j++) {
                    newGroupState[j] = groupState[j]==extraGroup ? newGroupState[currentLocation] : newGroupState[j];
                }
            }
            else {
                newGroupState[currentLocation]  = stateOfAdjacentPiece(boardState, groupState, currentLocation, direction)!.group;
                moreThanOneAdjacentFriendlyGroup = true;
            }
        }   
    });
    return newGroupState;
}

function addNewPieceToBoardState(boardState: string[], groupState: number[], currentLocation: number, color: string):string[] {
    const newBoardState = new Array(...boardState);
    newBoardState[currentLocation] = color;
    return newBoardState;
}

function removeEnemyPieces(boardState: string[], groupState: number[], enemyColor: string):string[] {
    const newBoardState = new Array(...boardState);

    currentGroups(groupState).filter( thisGroup => colorOf(thisGroup, newBoardState, groupState)==enemyColor).forEach( thisGroup => {
        let thisGroupLives = false;
        for (let location=0; location<groupState.length; location++) {
            if(groupState[location]==thisGroup) {
                const directions = ["UP", "RIGHT", "DOWN", "LEFT"];
                directions.forEach( direction => {
                    thisGroupLives = stateOfAdjacentPiece(newBoardState, groupState, location, direction)!.board=="empty" || thisGroupLives;
                });
            }
        }
        if(!thisGroupLives) {
            for (let i=0; i<newBoardState.length; i++) {
                if(groupState[i]==thisGroup) {
                    newBoardState[i]="empty";
                }
            }
        }
    });

    return newBoardState;
}

export const Baduk: React.FunctionComponent = () => {

    let boardSize = 9;

    const [boardState   , setBoardState   ] = useState<string[]  > (new Array(boardSize*boardSize).fill("empty"));
    const [groupState   , setGroupState   ] = useState<number[]  > (new Array(boardSize*boardSize).fill(0      ));
    const [friendlyColor, setFriendlyColor] = useState<string    > ("black");
    const [boardHistory,  setBoardHistory ] = useState<string[][]> ([]);

    // setBoardHistory(boardHistory.push(boardState));

    const enemyColor = friendlyColor=="black" ? "white" : "black";

    return( 
        <div className="board"> 
            {boardState.map((tileState, location) => (
                <button key={location} className={tileType(boardSize, location, tileState)} onClick={ () => {

                    if(tileState=="empty") {

                        let newGroupState = addNewPieceToGroupState(boardState, groupState, location, friendlyColor);
                        let newBoardState = addNewPieceToBoardState(boardState, newGroupState, location, friendlyColor);
                        
                        //check if any enemy pieces have been taken
                        newBoardState = removeEnemyPieces(newBoardState, newGroupState, enemyColor);

                        //check if any friendly pieces need to be removed, in which case it would be an illegal move
                        let revertGroupState = newGroupState;
                        let revertBoardState = newBoardState;
                        currentGroups(newGroupState).filter( thisGroup => colorOf(thisGroup, newBoardState, newGroupState)==friendlyColor).forEach( thisGroup => {
                            let thisGroupLives = false;
                            for (let location=0; location<newGroupState.length; location++) {
                                if(newGroupState[location]==thisGroup) {
                                    const directions = ["UP", "RIGHT", "DOWN", "LEFT"];
                                    directions.forEach( direction => {
                                        console.log(direction, stateOfAdjacentPiece(newBoardState, newGroupState, location, direction));
                                        thisGroupLives = stateOfAdjacentPiece(newBoardState, newGroupState, location, direction)!.board=="empty" || thisGroupLives;
                                    });
                                }
                            }
                            if(!thisGroupLives) {
                                newGroupState = groupState;
                                newBoardState = boardState;
                            }
                        });
                        
                        setGroupState(newGroupState);
                        setBoardState(newBoardState);
                        if(newBoardState!=boardState) {
                            setFriendlyColor(enemyColor);
                        }
                    }
                }}></button>
            ))}
        </div>
    );
}
