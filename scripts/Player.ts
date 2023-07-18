/// <reference path="./Cell.ts" />

class Player extends Cell {

    public _pathRenderer: PathRenderer;

    constructor(main: Main) {
        super(main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer.addClass("player");
        this._pathRenderer = this.addComponent(new PathRenderer(this, { classList: ["player-dir"] })) as PathRenderer;
    }

    public start(): void {
        super.start();

        this.pos.x = 500;
        this.pos.y = 500;

        this.speed.x = 100;

        window.addEventListener("pointerup", this._onPointerDown);
    }

    public update(dt: number): void {
        super.update(dt);

        let p = this.main.clientXYToContainerXY(this.main.pointerClientPos.x, this.main.pointerClientPos.y);

        let dx = this.pos.x - p.x;
        let dy = this.pos.y - p.y;

        let delta = new Vec2(dx, dy);
        if (delta.lengthSquared() > 1) {

            delta.normalizeInPlace();
            delta.scaleInPlace(100);
            let newSpeed = this.speed.add(delta);
            let origin = newSpeed.normalize().scaleInPlace(this.radius);
            let end = newSpeed.normalize().scaleInPlace(this.radius + newSpeed.length());
            this._pathRenderer.points = [origin, end];
        }
    }

    public stop(): void {
        super.stop();
        window.removeEventListener("pointerdown", this._onPointerDown);
    }

    public _onPointerDown = (ev: PointerEvent) => {
        let p = this.main.clientXYToContainerXY(ev.clientX, ev.clientY);

        let dx = this.pos.x - p.x;
        let dy = this.pos.y - p.y;

        let delta = new Vec2(dx, dy);
        if (delta.lengthSquared() > 1) {
            delta.normalizeInPlace();

            let spit = new Food(this.main);
            spit.pos.copyFrom(this.pos);
            spit.size = this.size * 0.05;
            spit.pos.subtractInPlace(delta.scale(this.radius + spit.radius + 2));
            spit.speed = delta.scale(-200);
            spit.instantiate();
            spit.draw();
            spit.start();

            this.size -= spit.size;

            delta.scaleInPlace(100);
            this.speed.addInPlace(delta);
        }
    }
}