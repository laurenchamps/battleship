import { Player } from './player.js';

let player1; 

beforeEach(() => {
    player1 = new Player('Player 1');
})

test('creates player\'s ships', () => {
    expect(player1.createShips()).toEqual([{coords: [], hits: 0, isHorizontal: true, name: 'carrier', length: 5}, {coords: [], hits: 0, isHorizontal: true, name: 'patrol boat', length: 2}, {coords: [], hits: 0, isHorizontal: true, name: 'submarine', length: 3}, {coords: [], hits: 0, isHorizontal: true, name: 'battleship', length: 4}, {coords: [], hits: 0, isHorizontal: true, name: 'destroyer', length: 3}]);
})