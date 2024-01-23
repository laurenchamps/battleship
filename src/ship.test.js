import { Ship } from './ship';

test('creates a ship', () => {
    const ship = new Ship('cruiser', 3);
    expect(ship).toEqual({name: 'cruiser', length: 3, coords: [], hits: 0, isHorizontal: true});
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