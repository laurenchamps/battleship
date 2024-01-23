import { GameBoard } from './gameBoard.js';
import { Ship } from './ship.js';

let cruiser, gameBoard;

beforeEach(() => {
    cruiser = new Ship('cruiser', 3);
    gameBoard = new GameBoard('player', 10, 10);
});


test('creates blank gameboard', () => {
    const gameBoard1 = new GameBoard('player', 2, 2);
    expect(gameBoard1.grid).toEqual([[{attacked: null, shipName: null}, {attacked: null, shipName: null}], [{attacked: null, shipName: null}, {attacked: null, shipName: null}]]);
})

test('places ship on gameboard', () => {
    gameBoard.placeShip(cruiser, 0, 0);
    expect(gameBoard.grid[0][0]).toEqual( {attacked: null, shipName: 'cruiser'});
})

test('gameboard records location of attack', () => {
    gameBoard.placeShip(cruiser, 0, 0);
    gameBoard.receiveAttack(0, 0);
    expect(gameBoard.grid[0][0].attacked).toEqual(true);
})

test('gameboard can report when all ships are sunk', () => {
    gameBoard.placeShip(cruiser, 0, 0);
    gameBoard.receiveAttack(0, 0);
    expect(gameBoard.hasActiveShips()).toBe(true);
    gameBoard.receiveAttack(0, 1);
    gameBoard.receiveAttack(0, 2);
    expect(gameBoard.hasActiveShips()).toBe(false);
})