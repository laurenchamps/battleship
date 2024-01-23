import { GameBoard } from './gameBoard.js';
import { Player } from './player.js';

let activePlayer, challenger, computer, challengerGameBoard, computerGameBoard; 
const GRID_SIZE = 10;

// DOM elements
const chalGridEl = document.querySelector('#grid--challenger');
const compGridEl = document.querySelector('#grid--computer');
const modalGridEl = document.querySelector('#grid--modal');
const modalPlaceShips = document.querySelector('.modal--place_ships');
const shipPrompt = modalPlaceShips.querySelector('.ship_prompt');
const modalGameOver = document.querySelector('.modal--game_over');
const winnerText = document.querySelector('.winner');
const btnNewGame = document.querySelector('.btn--new');

class App {
    constructor() {
    }

    init() {
        activePlayer = 0;
        challenger = new Player('challenger');
        computer = new Player('computer');
        challengerGameBoard = new GameBoard('challenger', GRID_SIZE, GRID_SIZE);
        computerGameBoard = new GameBoard('computer', GRID_SIZE, GRID_SIZE);

        this.renderGameBoard(computerGameBoard, compGridEl);
        this.renderGameBoard(challengerGameBoard, chalGridEl);

        // Allow player to position their ships
        this.placePlayerShips();
        this.placeComputerShips();
    }

    placePlayerShips() {
        // Create set of ships
        const challengerShips = challenger.createShips();

        shipPrompt.textContent = `Place your ${challengerShips[0].name}`;

        modalPlaceShips.showModal();
        app.renderGameBoard(challengerGameBoard, modalGridEl);
        const rotateBtn = modalPlaceShips.querySelector('.btn--rotate');
        const modalGridSquares = [...modalGridEl.querySelectorAll('.grid_square')];

        let allCoords;

        modalGridSquares.forEach(square => {
            square.addEventListener('mouseenter', (e) => {
                // Get x-coordinates of first target
                const coords = [+e.target.dataset.x, +e.target.dataset.y];

                allCoords = challengerGameBoard.positionShip(challengerShips[0], ...coords);

                // If ship is too long to fit on gameBoard, don't display
                if (allCoords.length < 1) return;
            
                allCoords.forEach(coord => {
                    const el = modalGridEl.querySelector(`[data-x="${coord[0]}"][data-y="${coord[1]}"]`);
                    el.classList.add('shipOutline');
                })
            })
        })

        modalGridSquares.forEach(square => {
            square.addEventListener('mouseleave', () => {
                allCoords.forEach(coord => {
                    const el = modalGridEl.querySelector(`[data-x="${coord[0]}"][data-y="${coord[1]}"]`);
                    el.classList.remove('shipOutline');
                    allCoords = [];
                })
            })
        })

        modalGridSquares.forEach(square => {
            square.addEventListener('click', (e) => {
                const placeShip = challengerGameBoard.placeShip(challengerShips[0], +e.target.dataset.x, +e.target.dataset.y);

                if (placeShip !== 'Success') return;

                allCoords.forEach(coord => {
                    const modalEl = modalGridEl.querySelector(`[data-x="${coord[0]}"][data-y="${coord[1]}"]`);
                    const chalEl = chalGridEl.querySelector(`[data-x="${coord[0]}"][data-y="${coord[1]}"]`);
                    modalEl.classList.remove('shipOutline');
                    modalEl.classList.add('placed');
                    chalEl.classList.remove('shipOutline');
                    chalEl.classList.add('placed');
                })
                // Remove ship from array
                challengerShips.shift();

                // If no ships remaining in array, close modal
                if (challengerShips.length < 1) {
                    modalPlaceShips.close();
                    return
                }

                // Update modal heading to current ship name
                shipPrompt.textContent = `Place your ${challengerShips[0].name}`;
            })
        })

        rotateBtn.addEventListener('click', () => {
            const currentShip = challengerShips[0];
            currentShip.isHorizontal ? currentShip.isHorizontal = false : currentShip.isHorizontal = true;
        })
    }

    placeComputerShips() {
        // Create set of ships
        const compShips = computer.createShips();
        
        // Randomly position computer's ships
        compShips.forEach(ship => {
            // Randomize ship's orientation
            const random = Math.floor(Math.random() * 2);
            random == 1 ? ship.isHorizontal = true : ship.isHorizontal = false;

            let shipPlaced;

            while (shipPlaced !== 'Success') {
                shipPlaced = computerGameBoard.placeShip(ship, ...computerGameBoard.generateRandomCoords());
            }
        });
    }

    renderGameBoard(gameboard, parentEl) {
        for (let i = 0; i < (gameboard.rows); i++) {
            // const parentEl = document.querySelector(`#grid--${gameboard.player}`);

            const gridRow = document.createElement('div');
            gridRow.classList.add('grid_row');
            parentEl.appendChild(gridRow);
            for (let j = 0; j < gameboard.columns; j++) {
                const gridSquare = document.createElement('div');
                const para = document.createElement('p');
                para.classList.add('grid_content');
                gridSquare.classList.add('grid_square');
                gridSquare.dataset.x = i;
                gridSquare.dataset.y = j;
                
                gridSquare.appendChild(para);
                gridRow.appendChild(gridSquare);
            }
        }
    }

    displayAttack(targetCoords, result) {    
        // Get all grid square elements
        const compGridSquares = [...compGridEl.querySelectorAll('.grid_square')];
        const chalGridSquares = [...chalGridEl.querySelectorAll('.grid_square')];
    
        let gridSquares;
        activePlayer == 0 ? gridSquares = compGridSquares : gridSquares = chalGridSquares;
    
        // Check if ship is sunk
        if (result[0] == 'sunk') {
            const sunkCoords = result[1];
    
            gridSquares.forEach(square => {
                sunkCoords.forEach(coord => {
                    if (+square.dataset.x == coord[0] && +square.dataset.y == coord[1]) {
                        square.classList.add('sunk');
                        square.textContent = '☠️';
                    }  
                })  
            })             
        }
    
        // Display result of attack
        gridSquares.forEach(square => {
            if (+square.dataset.x == targetCoords[0] && +square.dataset.y == targetCoords[1]) {
                square.classList.add(`${result[0]}`);
                if (result[0] == 'hit') square.firstElementChild.textContent = '💥';
                if (result[0] ==  'miss') square.firstElementChild.textContent = '◦';
            }
        })
    }

    startGameLoop(e) {
        if (activePlayer !== 0) return;

        // Get coordinates of attack
        const coords = app.getCoords(e);
        // Attack
        const result = challenger.attack(computerGameBoard, ...coords);
        // Display result of attack in grid
        app.displayAttack(coords, result);
        // Set active player to opponent
        activePlayer = 1;
    
        if (!computerGameBoard.hasActiveShips()) {
            winnerText.textContent = 'You win! 🥳';
            modalGameOver.showModal();
        }
    
        // Take computer's turn
        if (activePlayer !== 1) return;
        // Get random coordinates
        const randomCoords = challengerGameBoard.generateRandomCoords();
        // Attack
        const compResult = computer.attack(challengerGameBoard, ...randomCoords);
        // Display result of attack in grid after 1 sec delay
        setTimeout(() => {
            app.displayAttack(randomCoords, compResult, chalGridEl);
            activePlayer = 0;
        }, 1000);
    
        if (!challengerGameBoard.hasActiveShips()) {
            winnerText.textContent = 'Computer wins ☹️';
            modalGameOver.showModal();
        }
    }

    getCoords = function(e) {
        const x = +`${e.target.dataset.x}`;
        const y = +`${e.target.dataset.y}`;
        return [x, y];
    }
}

// Initialise game
const app = new App;
app.init();

// Event listeners    
compGridEl.addEventListener('click', function (e) {
    app.startGameLoop(e);
});

btnNewGame.addEventListener('click', function() {
    location.reload();
})