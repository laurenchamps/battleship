import { Ship } from './ship.js';

class Player {
    constructor(name) {
        this.name = name;
    }

    createShips() {
        const carrier = new Ship('carrier', 5);
        const patrolBoat = new Ship('patrol boat', 2);
        const submarine = new Ship('submarine', 3);
        const battleship = new Ship('battleship', 4);
        const destroyer = new Ship('destroyer', 3);

        return [carrier, patrolBoat, submarine, battleship, destroyer];
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

export { Player };