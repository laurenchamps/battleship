/* 
----- Ship types ------

Carrier: 5
Battleship: 4
Cruiser: 3
Submarine: 3
Destroyer: 2 
*/

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
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
    constructor(rows, columns) {
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

    placeShip(row, column, length, name, isHorizontal) {
        const ship = new Ship(name, length);

        this.grid[row][column].shipName = name;

        for (let i = 1; i < length; i++) {
            if (isHorizontal) {
                this.grid[row][column + i].shipName = name;
            } else {
                this.grid[row + i][column].shipName = name;
            }
        }

        this.ships.push(ship);
    }

    receiveAttack(x, y) {
        // Record attack on target coordinates
        const target = this.grid[x][y];
        target.attacked = true;
        
        // If no ship at target, record a miss
        if (!target.shipName) return 'miss';

        // Record a hit on the ship located at the target coords
        this.ships.forEach(ship => {
            if(ship.name == target.shipName) {
                ship.hit();
            }
            // Check if ship is sunk and if so remove from ships array
            if(ship.isSunk()) this.ships = this.ships.filter(ship => ship.name != target.shipName);
        })
            return 'hit';
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

    play(gameboard, x, y) {
        // Valid plays only
        // Coordinates must be within gameboard bounds
        if (x < 0 || x >= gameboard.rows - 1 || y < 0 || y >= gameboard.columns - 1) return 'Target must be within the playing area.';

        // Coordinates must not have previously received an attack
        if (gameboard.grid[x][y].attacked) return 'Target has already been attacked. Choose another target.';

        // Make play
        gameboard.receiveAttack(x, y);
    }

    randomPlay(gameboard) {
        // Generate valid random coordinates
        let x, y;
        // Generate random x and y coordinates within the gameboard grid
        do {
            x = Math.floor(Math.random() * gameboard.rows);
            y = Math.floor(Math.random() * gameboard.columns);
        } while (gameboard.grid[x][y].attacked);
            
        gameboard.receiveAttack(x, y);
    }
}

export { Ship };
export { GameBoard };
export { Player };