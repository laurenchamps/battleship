class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.coords = [];
        this.hits = 0;
        this.isHorizontal = true;
    }

    hit() {
        this.hits++;
    }

    isSunk() {
        if (this.length === this.hits) return true;
        return false;
    }
}

class GameBoard {
    constructor(player, rows, columns) {
        this.player = player;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        for (let i = 0; i < rows; i++) {
            this.grid.push([]);
            for (let j = 0; j < columns; j++) {
                this.grid[i].push({
                    shipName: null,
                    attacked: null,
                });
            }
        }
        this.ships = [];
    }

    positionShip(ship, x, y) {
        let allCoords = [];
        // Ship cannot be positioned if it is too long to fit on the gameboard
        if (ship.isHorizontal && (y + ship.length) > this.columns || !ship.isHorizontal && (x + ship.length > this.rows)) {
            console.log('Ship is too long');
            return allCoords;
        }

        if (ship.isHorizontal) {
            for (let i = 0; i < ship.length; i++) {
                allCoords.push([x, y + i]);
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                allCoords.push([x + i, y]);
            }
        }
        return allCoords;
    }

    placeShip(ship, x, y) {
        // Ship must be able to fit in grid based on length and orientation
        if (ship.isHorizontal && y > this.columns - ship.length) return 'Invalid position';

        if (!ship.isHorizontal && x > this.rows - ship.length) return 'Invalid position'
        
        // Ship must not overlap with another ship
        if (ship.isHorizontal) {
            for (let i = 0; i < ship.length; i++) {
                if (this.grid[x][y + i].shipName) {
                    console.log('Ships are overlapping');
                    return 'Ships cannot overlap';
                }
            }
        }

        if (!ship.isHorizontal) {
            for (let i = 0; i < ship.length; i++) {
                if (this.grid[x + i][y].shipName) return 'Ships cannot overlap';
            }
        }

        for (let i = 0; i < ship.length; i++) {
            if (ship.isHorizontal) {
                this.grid[x][y + i].shipName = ship.name;
                ship.coords.push([x, y + i]);
            } else {
                this.grid[x + i][y].shipName = ship.name;
                ship.coords.push([x + i, y]);
            }
        }

        this.ships.push(ship);
        return 'Success';
    }

    generateRandomCoords() {
        // Generate valid random coordinates
        let x, y;
        // Generate random x and y coordinates within the gameboard grid
        do {
            x = Math.floor(Math.random() * this.rows);
            y = Math.floor(Math.random() * this.columns);
        } while (this.grid[x][y].attacked);

        return [x, y];
    }

    receiveAttack(x, y) {
        // Record attack on target coordinates
        const target = this.grid[x][y];
        target.attacked = true;
        let sunkCoords;
        
        // If no ship at target, record a miss
        if (!target.shipName) {
            return ['miss', [x, y]];
        }

        // Record a hit on the ship located at the target coords
        this.ships.forEach(ship => {
            if(ship.name == target.shipName) {
                ship.hit();
            }

            // If ship is sunk remove from ships array and return sunk and coords
            if (ship.isSunk()) {
                sunkCoords = ship.coords;
                this.ships = this.ships.filter(ship => ship.name != target.shipName);
            }            
        })

        if (sunkCoords) return ['sunk', sunkCoords];

        return ['hit', [x, y]];
    }

    hasActiveShips() {
        if (this.ships.length) return true;
        return false;
    }
}

class Player {
    constructor(name) {
        this.name = name;
    }

    attack(gameboard, x, y) {
        // Valid attacks only
        // Coordinates must be within gameboard bounds
        if (x < 0 || x > gameboard.rows - 1 || y < 0 || y > gameboard.columns - 1) {
            alert('Target must be within the playing area')
            return;
        }

        // Coordinates must not have previously received an attack
        if (gameboard.grid[x][y].attacked) {
            alert('Target has already been attacked. Choose another target.');
            return;  
        }

        // Make attack
        return gameboard.receiveAttack(x, y);
    }
}

/////////////////////////
// APPLICATION

class App {
    constructor() {

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
}

let activePlayer = 0;

const challenger = new Player('challenger');
const computer = new Player('computer');

const challengerGameBoard = new GameBoard('challenger', 10, 10);
const computerGameBoard = new GameBoard('computer', 10, 10);

// DOM elements
const chalGridEl = document.querySelector('#grid--challenger');
const compGridEl = document.querySelector('#grid--computer');
const modalGridEl = document.querySelector('#grid--modal');
const modalPlaceShips = document.querySelector('.modal--place_ships');
const shipPrompt = modalPlaceShips.querySelector('.ship_prompt');
const modalGameOver = document.querySelector('.modal--game_over');
const winnerText = document.querySelector('.winner');

/* 
----- Ship types ------

Carrier: 5
Battleship: 4
Cruiser: 3
Submarine: 3
Destroyer: 2 
*/

const ships = [['carrier', 5], ['patrol boat', 2], ['submarine', 3], ['battleship', 4], ['destroyer', 3]];

const compShips = [];

ships.forEach(ship => {
    let compShip = new Ship(ship[0], ship[1]);

    compShips.push(compShip);
})

console.log(compShips);


const carrier = new Ship('carrier', 5);
const patrolBoat = new Ship('patrol boat', 2);
const submarine = new Ship('submarine', 3);
const battleship = new Ship('battleship', 4);
const destroyer = new Ship('destroyer', 3);

const shipTypes = [carrier, patrolBoat, submarine, battleship, destroyer];

const app = new App;

app.renderGameBoard(computerGameBoard, compGridEl);
app.renderGameBoard(challengerGameBoard, chalGridEl);

compShips.forEach(ship => {
    // Randomize ship's orientation
    const random = Math.floor(Math.random() * 2);
    random == 1 ? ship.isHorizontal = true : ship.isHorizontal = false;

    let shipPlaced;

    while (shipPlaced !== 'Success') {
        shipPlaced = computerGameBoard.placeShip(ship, ...computerGameBoard.generateRandomCoords());
    }
})

console.log(computerGameBoard);


const displayAttack = function(targetCoords, result) {    
    // Get all grid square elements
    const compGridSquares = [...compGridEl.querySelectorAll('.grid_square')];
    const chalGridSquares = [...chalGridEl.querySelectorAll('.grid_square')];

    let gridSquares;
    activePlayer == 0 ? gridSquares = compGridSquares : gridSquares = chalGridSquares;
    console.log(computerGameBoard);

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

// Game loop
// Event listeners    
compGridEl.addEventListener('click', function (e) {
    if (activePlayer !== 0) return;

    // Get coordinates of attack
    const coords = getCoords(e);
    // Attack
    const result = challenger.attack(computerGameBoard, ...coords);
    // Display result of attack in grid
    displayAttack(coords, result);
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
        displayAttack(randomCoords, compResult, chalGridEl);
        activePlayer = 0;
    }, 1000);

    if (!challengerGameBoard.hasActiveShips()) {
        winnerText.textContent = 'Computer wins ☹️';
        modalGameOver.showModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const challengerShips = [...shipTypes];
    const rotateBtn = modalPlaceShips.querySelector('.btn--rotate');
    shipPrompt.textContent = `Place your ${challengerShips[0].name}`;

    modalPlaceShips.showModal();
    app.renderGameBoard(challengerGameBoard, modalGridEl);

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

    rotateBtn.addEventListener('click', (e) => {
        const currentShip = challengerShips[0];
        currentShip.isHorizontal ? currentShip.isHorizontal = false : currentShip.isHorizontal = true;
    }

    )


});


const getCoords = function(e) {
    const x = +`${e.target.dataset.x}`;
    const y = +`${e.target.dataset.y}`;
    return [x, y];
}

export { Ship };
export { GameBoard };
export { Player };