import { Ship } from './app';

test('takes a hit', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toEqual(1);
})

test('ship is sunk', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
})