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

export { GameBoard };