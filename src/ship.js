class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.coords = [];
        this.hits = 0;
        this.isHorizontal = true;
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