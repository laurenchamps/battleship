class Ship {
    constructor(length, orientation) {
        this.length = length;
        this.orientation = orientation;
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

export { Ship };


