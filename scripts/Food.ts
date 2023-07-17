/// <reference path="./engine/Gameobject.ts" />

class Food extends Gameobject {

    private _circleRenderer: CircleRenderer;
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
        this._circleRenderer.addClass("food");
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
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
    }

    public stop(): void {
        super.stop();
    }
}