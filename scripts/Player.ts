/// <reference path="./Cell.ts" />

class Player extends Cell {

    constructor(main: Main) {
        super(main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer.addClass("player");
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