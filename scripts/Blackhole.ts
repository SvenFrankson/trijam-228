/// <reference path="./Cell.ts" />

class Blackhole extends Cell {

    constructor(main: Main) {
        super(main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer.addClass("black-hole");
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);

        this.main.gameobjects.forEach(other => {
            if (other != this && other instanceof Cell) {
                let sqrDist = Vec2.DistanceSquared(this.pos, other.pos);
                let rSum = this.radius + other.radius;
                if (sqrDist < rSum * rSum) {
                    if (!(other instanceof Blackhole) || (other instanceof Blackhole && this.radius > other.radius)) {
                        while (other.radius > 0 && sqrDist < rSum * rSum) {
                            let dSize = other.size;
                            other.size -= 10;
                            dSize = dSize - other.size;
                            this.size += dSize * 0.5;
                            rSum = this.radius + other.radius;
                            this.speed.scaleInPlace(0.999);
                        }
                    }
                }
            }
        });
    }

    public stop(): void {
        super.stop();
    }
}