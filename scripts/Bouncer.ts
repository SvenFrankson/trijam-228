/// <reference path="./Cell.ts" />

class Bouncer extends Cell {

    constructor(main: Main) {
        super(main);
    }

    public instantiate(): void {
        super.instantiate();

        this._circleRenderer.addClass("bouncer");
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        
    }

    public stop(): void {
        super.stop();
    }
}