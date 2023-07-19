/// <reference path="./engine/Gameobject.ts" />

class Cell extends Gameobject {

    protected _circleRenderer: CircleRenderer;
    public speed: Vec2 = new Vec2(0, 0);
    private _radius: number = 20;
    public get radius(): number {
        return this._radius;
    }
    public set radius(v: number) {
        this._radius = v;
        this._radius = Math.max(this._radius, 0);
        if (this._circleRenderer) {
            this._circleRenderer.radius = this._radius;
        }
    }

    public get size(): number {
        return 2 * Math.PI * this.radius * this.radius;
    }
    public set size(v: number) {
        v = Math.max(v, 0);
        let r = Math.sqrt(v / (2 * Math.PI));
        this.radius = r;
    }

    constructor(main: Main) {
        super({}, main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 2 })) as CircleRenderer;
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);

        this.speed.scaleInPlace(0.999);
        this.pos.x += this.speed.x * dt;
        this.pos.y += this.speed.y * dt;

        if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.speed.y *= -1;
        }
        if (this.pos.x > 1000 - this.radius) {
            this.pos.x = 1000 - this.radius;
            this.speed.x *= -1;
        }
        if (this.pos.y > 1000 - this.radius) {
            this.pos.y = 1000 - this.radius;
            this.speed.y *= -1;
        }

        this.main.gameobjects.forEach(other => {
            if (other != this && other instanceof Cell) {
                let sqrDist = Vec2.DistanceSquared(this.pos, other.pos);
                let rSum = this.radius + other.radius;
                if (sqrDist < rSum * rSum) {
                    if (other instanceof Food || other instanceof Player) {
                        if (this.radius > other.radius) {
                            while (other.radius > 0 && sqrDist < rSum * rSum) {
                                let dSize = other.size;
                                other.size -= 10;
                                dSize = dSize - other.size;
                                this.size += dSize;
                                rSum = this.radius + other.radius;
                                this.speed.scaleInPlace(0.999);
                            }
                        }
                    }
                    else if (other instanceof Bouncer) {
                        let axis = this.pos.subtract(other.pos);
                        this.speed.mirrorInPlace(axis);
                        this.pos.x += this.speed.x * dt;
                        this.pos.y += this.speed.y * dt;    
                    }
                }
            }
        });
    }

    public stop(): void {
        super.stop();
    }
}