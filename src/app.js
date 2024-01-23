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
const turn = document.querySelector('.turn');

class App {
    constructor() {
        this.potentialTargets = [];
    }

    init() {
        activePlayer = 0;
        turn.textContent = 'Your turn';
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
                    el.classList.add('shipHover');
                })
            })
        })

        modalGridSquares.forEach(square => {
            square.addEventListener('mouseleave', () => {
                allCoords.forEach(coord => {
                    const el = modalGridEl.querySelector(`[data-x="${coord[0]}"][data-y="${coord[1]}"]`);
                    el.classList.remove('shipHover');
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
                    modalEl.classList.remove('shipHover');
                    modalEl.classList.add('placed');
                    chalEl.classList.remove('shipHover');
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

    getPotentialTargets(coords) {
        const adjacentCoords = [[coords[0], coords[1] + 1], [coords[0], coords[1] - 1], [coords[0] + 1, coords[1]], [coords[0] - 1, coords[1]]];

        adjacentCoords.forEach(coord => {
            if (coord[0] >= 0 && coord[0] <= GRID_SIZE - 1 && coord[1] >= 0 && coord[1] <= GRID_SIZE - 1) {
                this.potentialTargets.push(coord);
            }
        });

        return this.potentialTargets;
    }

    takeTurn(e, player) {
        if (player === 'challenger') {

            if (activePlayer !== 0) return;
            // Get coordinates of attack
            const challengerCoords = this.getCoords(e);
            console.log(challengerCoords);
            // Attack
            const challengerResult = challenger.attack(computerGameBoard, ...challengerCoords);
            // Display result of attack in grid
            app.displayAttack(challengerCoords, challengerResult);
            // Set active player to opponent
            activePlayer = 1;
            turn.textContent = 'Computer\'s turn';

            if (!computerGameBoard.hasActiveShips()) {
                winnerText.textContent = 'You win! 🥳';
                modalGameOver.showModal();
            }
        }

        // Computer's turn
        if (player === 'computer') {

            if (activePlayer !== 1) return;

            let compCoords, compResult;

            if (this.potentialTargets.length > 0) {
                do {
                    // Get next target coords from list
                    compCoords = this.potentialTargets.shift();
                    console.log({compCoords});
                    compResult = computer.attack(challengerGameBoard, ...compCoords);
                    console.log({compResult});
                } while (!compResult);
            } else {
                // Get random coordinates
                compCoords = challengerGameBoard.generateRandomCoords();
                compResult = computer.attack(challengerGameBoard, ...compCoords);
            }
           
            if (compResult[0] === 'hit') {
                const targets = this.getPotentialTargets(compResult[1]);
                targets.forEach(target => {
                    this.potentialTargets.push(target);
                })
            };
    
            if (compResult[0] === 'sunk') {
                this.potentialTargets = [];
            }
            // Display result of attack in grid after 1 sec delay
            setTimeout(() => {
                app.displayAttack(compCoords, compResult, chalGridEl);
                activePlayer = 0;
                turn.textContent = 'Your turn';
            }, 1000);
        
            if (!challengerGameBoard.hasActiveShips()) {
                winnerText.textContent = 'Computer wins 🙁';
                modalGameOver.showModal();
            }
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
    if (activePlayer != 0) return;
    app.takeTurn(e, 'challenger');
    app.takeTurn(e, 'computer');
});

btnNewGame.addEventListener('click', function() {
    location.reload();
})