import { Ship } from './app';
import { GameBoard } from './app';
import { Player } from './app';

test('creates a ship', () => {
    const ship = new Ship('cruiser', 3);
    expect(ship).toEqual({name: 'cruiser', length: 3, hits: 0});
})

test('takes a hit', () => {
    const ship = new Ship('cruiser', 3);
    ship.hit();
    expect(ship.hits).toEqual(1);
})

test('ship is sunk', () => {
    const ship = new Ship('cruiser', 3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
})

test('creates blank gameboard', () => {
    const gameBoard = new GameBoard(2, 2);
    expect(gameBoard.grid).toEqual([[{attacked: null, shipName: null}, {attacked: null, shipName: null}], [{attacked: null, shipName: null}, {attacked: null, shipName: null}]]);
})

test('places ship on gameboard', () => {
    const cruiser = new Ship('cruiser', 3);
    const gameBoard = new GameBoard(10, 10);
    gameBoard.placeShip(0, 0, cruiser.length, cruiser.name, true);
    expect(gameBoard.grid[0][0]).toEqual( {attacked: null, shipName: 'cruiser'});
})

test('gameboard records location of attack', () => {
    const gameBoard = new GameBoard(10, 10);
    const cruiser = new Ship('cruiser', 3);
    gameBoard.placeShip(0, 0, cruiser.length, cruiser.name, true);
    gameBoard.receiveAttack(0, 0);
    expect(gameBoard.grid[0][0].attacked).toEqual(true);
})

test('gameboard can report when all ships are sunk', () => {
    const gameBoard = new GameBoard(10, 10);
    const cruiser = new Ship('cruiser', 3);
    gameBoard.placeShip(0, 0, cruiser.length, cruiser.name, true);
    gameBoard.receiveAttack(0, 0);
    expect(gameBoard.hasActiveShips()).toBe(true);
    gameBoard.receiveAttack(0, 1);
    gameBoard.receiveAttack(0, 2);
    expect(gameBoard.hasActiveShips()).toBe(false);
})

test('randomly plays', () => {
    const gameBoard = new GameBoard(10, 10);
    const cruiser = new Ship('cruiser', 3);
    const computer = new Player();
    gameBoard.placeShip(0, 0, cruiser.length, cruiser.name, true);
    for (let i = 0; i < 100; i++) {
        computer.randomPlay(gameBoard);
    }
    expect(gameBoard.hasActiveShips()).toBe(false);
})

