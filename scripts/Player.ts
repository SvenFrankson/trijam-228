class Player extends Gameobject {

    private _circleRenderer: CircleRenderer;
    public speed: Vec2 = new Vec2(0, 0);
    private _radius: number = 20;
    public get radius(): number {
        return this._radius;
    }
    public set radius(v: number) {
        this._radius = v;
        this._radius = Math.max(this._radius, 1);
        if (this._circleRenderer) {
            this._circleRenderer.radius = this._radius;
        }
    }

    public get size(): number {
        return 2 * Math.PI * this.radius * this.radius;
    }
    public set size(v: number) {
        let r = Math.sqrt(v / (2 * Math.PI));
        this.radius = r;
    }

    constructor(main: Main) {
        super({}, main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 2 })) as CircleRenderer;
        this._circleRenderer.addClass("player");
    }

    public start(): void {
        super.start();

        this.pos.x = 500;
        this.pos.y = 500;

        this.speed.x = 100;

        window.addEventListener("pointerup", this._onPointerUp);
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

        this.main.gameobjects.forEach(other => {
            if (other instanceof Food) {
                let sqrDist = Vec2.DistanceSquared(this.pos, other.pos);
                let rSum = this.radius + other.radius;
                if (sqrDist < rSum * rSum) {
                    let dSize = other.size;
                    other.size -= 200;
                    dSize = dSize - other.size;
                    this.size += dSize;
                }
            }
        })
    }

    public stop(): void {
        super.stop();
        window.removeEventListener("pointerdown", this._onPointerUp);
    }

    public _onPointerUp = (ev: PointerEvent) => {
        let rect = this.main.container.getBoundingClientRect();
        let px = ev.clientX - rect.left;
        let py = ev.clientY - rect.top;

        px = px / rect.width * 1000;
        py = py / rect.height * 1000;

        let dx = this.pos.x - px;
        let dy = this.pos.y - py;

        let delta = new Vec2(dx, dy);
        if (delta.lengthSquared() > 1) {
            delta.normalizeInPlace();
            delta.scaleInPlace(100);
            this.speed.addInPlace(delta);
        }
    }
}