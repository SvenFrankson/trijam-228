/// <reference path="./Cell.ts" />

class Food extends Cell {

    constructor(main: Main) {
        super(main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer.addClass("food");
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
    }

    public stop(): void {
        super.stop();
    }
}