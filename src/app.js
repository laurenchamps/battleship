class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.coords = [];
        this.hits = 0;
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

    placeShip(x, y, length, name, isHorizontal) {
        const ship = new Ship(name, length);

        // Ship must be able to fit in grid based on length and orientation
        if (isHorizontal && y > this.columns - length) return 'Invalid position';

        if (!isHorizontal && x > this.rows - length) return 'Invalid position'
        
        // Ship must not overlap with another ship
        if (isHorizontal) {
            for (let i = 0; i < length; i++) {
                if (this.grid[x][y + i].shipName) return 'Ships cannot overlap';
            }
        }

        if (!isHorizontal) {
            for (let i = 0; i < length; i++) {
                if (this.grid[x + i][y].shipName) return 'Ships cannot overlap';
            }
        }

        for (let i = 0; i < length; i++) {
            if (isHorizontal) {
                this.grid[x][y + i].shipName = name;
                ship.coords.push([x, y + i]);
            } else {
                this.grid[x + i][y].shipName = name;
                ship.coords.push([x + i, y]);
            }
        }

        this.ships.push(ship);
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

    renderGameBoard(gameboard) {
        for (let i = 0; i < (gameboard.rows); i++) {
            const parentEl = document.querySelector(`#grid--${gameboard.player}`);

            const gridRow = document.createElement('div');
            gridRow.classList.add('grid_row');
            parentEl.appendChild(gridRow);
            for (let j = 0; j < gameboard.columns; j++) {
                const gridSquare = document.createElement('div');
                gridSquare.classList.add('grid_square');
                gridSquare.dataset.x = i;
                gridSquare.dataset.y = j;
                
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

/* 
----- Ship types ------

Carrier: 5
Battleship: 4
Cruiser: 3
Submarine: 3
Destroyer: 2 
*/

const carrier = new Ship('carrier', 5);
const patrolBoat = new Ship('patrolBoat', 2);
const submarine = new Ship('submarine', 3);
const battleship = new Ship('battleship', 4);
const destroyer = new Ship('destroyer', 3);

const shipTypes = [carrier, patrolBoat, submarine, battleship, destroyer];

computerGameBoard.placeShip(0, 5, shipTypes[0].length, shipTypes[0].name, true);
computerGameBoard.placeShip(3, 5, shipTypes[3].length, shipTypes[3].name , false);
computerGameBoard.placeShip(6, 1, shipTypes[4].length, shipTypes[4].name, false);
computerGameBoard.placeShip(8, 5, shipTypes[2].length, shipTypes[2].name, true);
computerGameBoard.placeShip(2, 8, shipTypes[1].length, shipTypes[1].name, true);

challengerGameBoard.placeShip(0, 5, shipTypes[0].length, shipTypes[0].name, true);
challengerGameBoard.placeShip(0, 5, shipTypes[0].length, shipTypes[0].name, true);
challengerGameBoard.placeShip(3, 5, shipTypes[3].length, shipTypes[3].name , false);
challengerGameBoard.placeShip(6, 1, shipTypes[4].length, shipTypes[4].name, false);
challengerGameBoard.placeShip(8, 5, shipTypes[2].length, shipTypes[2].name, true);
challengerGameBoard.placeShip(2, 8, shipTypes[1].length, shipTypes[1].name, true);

const app = new App;

app.renderGameBoard(computerGameBoard);
app.renderGameBoard(challengerGameBoard);


// DOM
const chalGridEl = document.querySelector('#grid--challenger');
const compGridEl = document.querySelector('#grid--computer');

const displayAttack = function(targetCoords, result, gridElement) {    
    // Get all grid square elements
    const gridSquares = [...gridElement.querySelectorAll('.grid_square')];

    // Check if ship is sunk
    if (result[0] == 'sunk') {
        const sunkCoords = result[1];

        gridSquares.forEach(square => {
            sunkCoords.forEach(coord => {
                if (+square.dataset.x == coord[0] && +square.dataset.y == coord[1]) {
                    square.classList.add('sunk');
                }  
            })  
        })             
    }

    // Display result of attack
    gridSquares.forEach(square => {
        if (+square.dataset.x == targetCoords[0] && +square.dataset.y == targetCoords[1]) {
            square.classList.add(`${result[0]}`);
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
    displayAttack(coords, result, compGridEl);
    // Set active player to opponent
    activePlayer = 1;

    // Take computer's turn
    if (activePlayer !== 1) return;
    // Get random coordinates
    const randomCoords = challengerGameBoard.generateRandomCoords();
    // Attack
    const compResult = computer.attack(challengerGameBoard, ...randomCoords);
    // Display result of attack in grid
    displayAttack(randomCoords, compResult, chalGridEl);

    activePlayer = 0;
});

const getCoords = function(e) {
    const x = +`${e.target.dataset.x}`;
    const y = +`${e.target.dataset.y}`;
    return [x, y];
}

export { Ship };
export { GameBoard };
export { Player };