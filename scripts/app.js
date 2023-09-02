class Gameobject {
    constructor(prop, main) {
        this.main = main;
        this.name = "";
        this.pos = new Vec2();
        this.rot = 0;
        this.renderers = new UniqueList();
        this.components = new UniqueList();
        if (prop) {
            if (prop.name) {
                this.name = prop.name;
            }
            if (prop.pos) {
                this.pos.copyFrom(prop.pos);
            }
            if (isFinite(prop.rot)) {
                this.rot = prop.rot;
            }
        }
    }
    instantiate() {
        this.main.gameobjects.push(this);
    }
    dispose() {
        this.main.gameobjects.remove(this);
        this.components.forEach(component => {
            component.dispose();
        });
    }
    addComponent(component) {
        if (component instanceof Renderer) {
            this.renderers.push(component);
        }
        this.components.push(component);
        return component;
    }
    start() {
    }
    update(dt) {
    }
    stop() {
        this.components.forEach(component => {
            component.onStop();
        });
    }
    draw() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.draw();
            });
        }
    }
    updatePosRot() {
        if (this.renderers) {
            this.renderers.forEach(renderer => {
                renderer.updatePosRot();
            });
        }
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Cell extends Gameobject {
    constructor(main) {
        super({}, main);
        this.speed = new Vec2(0, 0);
        this._radius = 20;
    }
    get radius() {
        return this._radius;
    }
    set radius(v) {
        this._radius = v;
        this._radius = Math.max(this._radius, 0);
        if (this._circleRenderer) {
            this._circleRenderer.radius = this._radius;
        }
    }
    get size() {
        return 2 * Math.PI * this.radius * this.radius;
    }
    set size(v) {
        v = Math.max(v, 0);
        let r = Math.sqrt(v / (2 * Math.PI));
        this.radius = r;
    }
    instantiate() {
        super.instantiate();
        this._circleRenderer = this.addComponent(new CircleRenderer(this, { radius: this.radius, layer: 2 }));
    }
    start() {
        super.start();
    }
    update(dt) {
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
    stop() {
        super.stop();
    }
}
/// <reference path="./Cell.ts" />
class Blackhole extends Cell {
    constructor(main) {
        super(main);
    }
    instantiate() {
        super.instantiate();
        this._circleRenderer.addClass("black-hole");
    }
    start() {
        super.start();
    }
    update(dt) {
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
    stop() {
        super.stop();
    }
}
/// <reference path="./Cell.ts" />
class Bouncer extends Cell {
    constructor(main) {
        super(main);
    }
    instantiate() {
        super.instantiate();
        this._circleRenderer.addClass("bouncer");
    }
    start() {
        super.start();
    }
    update(dt) {
    }
    stop() {
        super.stop();
    }
}
/// <reference path="./Cell.ts" />
class Food extends Cell {
    constructor(main) {
        super(main);
    }
    instantiate() {
        super.instantiate();
        this._circleRenderer.addClass("food");
    }
    start() {
        super.start();
    }
    update(dt) {
        super.update(dt);
    }
    stop() {
        super.stop();
    }
}
/// <reference path="./engine/Gameobject.ts" />
class Main {
    constructor() {
        this.layers = [];
        this.gameobjects = new UniqueList();
        this._lastT = 0;
        this._mainLoop = () => {
            let dt = 0;
            let t = performance.now();
            if (isFinite(this._lastT)) {
                dt = (t - this._lastT) / 1000;
            }
            this._lastT = t;
            if (this._update) {
                this._update(dt);
            }
            requestAnimationFrame(this._mainLoop);
        };
        this.pointerClientPos = new Vec2();
        this._onPointerMove = (ev) => {
            this.pointerClientPos.x = ev.clientX;
            this.pointerClientPos.y = ev.clientY;
        };
        this._onResize = () => {
            this.containerRect = this.container.getBoundingClientRect();
        };
    }
    instantiate() {
        this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.container.id = "main-container";
        this.container.setAttribute("viewBox", "0 0 1000 1000");
        document.body.appendChild(this.container);
        this._onResize();
        for (let i = 0; i < 4; i++) {
            let layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.appendChild(layer);
            this.layers[i] = layer;
        }
        this.player = new Player(this);
        this.player.instantiate();
        let foodSize = 0;
        for (let i = 0; i < 200; i++) {
            let food = new Food(this);
            food.instantiate();
            food.pos.x = 100 + 800 * Math.random();
            food.pos.y = 100 + 800 * Math.random();
            food.speed.x = -10 + 20 * Math.random();
            food.speed.y = -10 + 20 * Math.random();
            food.radius = 5 + 5 * Math.random();
            foodSize += food.size;
        }
        for (let i = 0; i < 3; i++) {
            let blackhole = new Blackhole(this);
            blackhole.instantiate();
            blackhole.pos.x = 100 + 800 * Math.random();
            blackhole.pos.y = 100 + 800 * Math.random();
            blackhole.radius = 20 + 20 * Math.random();
        }
        for (let i = 0; i < 6; i++) {
            let bouncer = new Bouncer(this);
            bouncer.instantiate();
            bouncer.pos.x = 100 + 800 * Math.random();
            bouncer.pos.y = 100 + 800 * Math.random();
            bouncer.radius = 40 + 20 * Math.random();
        }
        window.addEventListener("resize", this._onResize);
        window.addEventListener("pointerenter", this._onPointerMove);
        window.addEventListener("pointermove", this._onPointerMove);
        this._mainLoop();
    }
    start() {
        document.getElementById("credit").style.display = "none";
        this.gameobjects.forEach(gameobject => {
            gameobject.start();
            gameobject.draw();
        });
        this._update = (dt) => {
            this.gameobjects.forEach(gameobject => {
                gameobject.update(dt);
            });
            this.gameobjects.forEach(gameobject => {
                gameobject.updatePosRot();
            });
        };
    }
    stop() {
        this._update = () => {
        };
        this.gameobjects.forEach(gameobject => {
            gameobject.stop();
        });
    }
    gameover(success) {
        this.stop();
        document.getElementById("credit").style.display = "block";
    }
    dispose() {
        while (this.gameobjects.length > 0) {
            this.gameobjects.get(0).dispose();
        }
    }
    clientXYToContainerXY(clientX, clientY) {
        let v = new Vec2();
        return this.clientXYToContainerXYToRef(clientX, clientY, v);
    }
    clientXYToContainerXYToRef(clientX, clientY, ref) {
        let px = clientX - this.containerRect.left;
        let py = clientY - this.containerRect.top;
        px = px / this.containerRect.width * 1000;
        py = py / this.containerRect.height * 1000;
        ref.x = px;
        ref.y = py;
        return ref;
    }
}
window.addEventListener("load", () => {
    let main = new Main();
    main.instantiate();
    requestAnimationFrame(() => {
        main.start();
    });
});
/// <reference path="./Cell.ts" />
class Player extends Cell {
    constructor(main) {
        super(main);
        this._onPointerDown = (ev) => {
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
        };
    }
    instantiate() {
        super.instantiate();
        this._circleRenderer.addClass("player");
        this._pathRenderer = this.addComponent(new PathRenderer(this, { classList: ["player-dir"] }));
    }
    start() {
        super.start();
        this.pos.x = 500;
        this.pos.y = 500;
        this.speed.x = 100;
        window.addEventListener("pointerup", this._onPointerDown);
    }
    update(dt) {
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
    stop() {
        super.stop();
        window.removeEventListener("pointerdown", this._onPointerDown);
    }
}
class Component {
    constructor(gameobject) {
        this.gameobject = gameobject;
    }
    dispose() { }
    onStart() { }
    onPause() { }
    onUnpause() { }
    onStop() { }
}
/// <reference path="Component.ts" />
class Renderer extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        this.layer = 0;
        this._classList = new UniqueList();
        if (prop) {
            if (isFinite(prop.layer)) {
                this.layer = prop.layer;
            }
            if (prop.classList) {
                prop.classList.forEach(c => {
                    this.addClass(c);
                });
            }
        }
    }
    addClass(c) {
        this._classList.push(c);
        this.onClassAdded(c);
    }
    removeClass(c) {
        this._classList.remove(c);
        this.onClassRemoved(c);
    }
    draw() {
    }
    updatePosRot() {
    }
}
class CircleRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._radius = 10;
        if (prop) {
            if (isFinite(prop.radius)) {
                this.radius = prop.radius;
            }
        }
    }
    get radius() {
        return this._radius;
    }
    set radius(v) {
        this._radius = v;
        if (this.svgElement) {
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
        }
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.svgElement.setAttribute("r", this.radius.toFixed(1));
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
    }
    updatePosRot() {
        if (this.svgElement) {
            this.svgElement.setAttribute("cx", this.gameobject.pos.x.toFixed(1));
            this.svgElement.setAttribute("cy", this.gameobject.pos.y.toFixed(1));
        }
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class PathRenderer extends Renderer {
    constructor(gameobject, prop) {
        super(gameobject, prop);
        this._points = [];
        this._d = "";
        this._close = false;
        if (prop) {
            if (prop.points instanceof Array) {
                this.points = prop.points;
            }
            if (prop.d) {
                this.d = prop.d;
            }
            if (prop.close) {
                this.close = prop.close;
            }
        }
    }
    get points() {
        return this._points;
    }
    set points(v) {
        this._points = v;
        this.draw();
    }
    get d() {
        return this._d;
    }
    set d(s) {
        this._d = s;
        this.draw();
    }
    get close() {
        return this._close;
    }
    set close(v) {
        this._close = v;
        this.draw();
    }
    onClassAdded(c) {
        if (this.svgElement) {
            this.svgElement.classList.add(c);
        }
    }
    onClassRemoved(c) {
        if (this.svgElement) {
            this.svgElement.classList.remove(c);
        }
    }
    draw() {
        if (!this.svgElement) {
            this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._classList.forEach(c => {
                this.onClassAdded(c);
            });
            this.gameobject.main.layers[this.layer].appendChild(this.svgElement);
        }
        let d = "";
        if (this.points.length > 0) {
            d = "M" + this.points[0].x + " " + this.points[0].y + " ";
            for (let i = 1; i < this.points.length; i++) {
                d += "L" + this.points[i].x + " " + this.points[i].y + " ";
            }
            if (this.close) {
                d += "Z";
            }
        }
        else {
            d = this.d;
        }
        this.svgElement.setAttribute("d", d);
    }
    updatePosRot() {
        this.svgElement.setAttribute("transform", "translate(" + this.gameobject.pos.x.toFixed(1) + " " + this.gameobject.pos.y.toFixed(1) + "), rotate(" + (this.gameobject.rot / Math.PI * 180).toFixed(0) + ")");
    }
    dispose() {
        if (this.svgElement) {
            this.gameobject.main.layers[this.layer].removeChild(this.svgElement);
        }
        delete this.svgElement;
    }
}
class SMath {
    static StepFromToCirular(from, to, step = Math.PI / 60) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(to - from) <= step) {
            return to;
        }
        if (Math.abs(to - from) >= 2 * Math.PI - step) {
            return to;
        }
        if (to - from >= 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from + step;
            }
            return from - step;
        }
        if (to - from < 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from - step;
            }
            return from + step;
        }
        return to;
    }
}
class Sound extends Component {
    constructor(gameobject, prop) {
        super(gameobject);
        if (prop) {
            if (prop.fileName) {
                this._audioElement = new Audio("sounds/" + prop.fileName);
            }
            if (this._audioElement) {
                if (prop.loop) {
                    this._audioElement.loop = prop.loop;
                }
            }
        }
    }
    play(fromBegin = true) {
        if (this._audioElement) {
            if (fromBegin) {
                this._audioElement.currentTime = 0;
            }
            this._audioElement.play();
        }
    }
    pause() {
        if (this._audioElement) {
            this._audioElement.pause();
        }
    }
    onPause() {
        this.pause();
    }
    onStop() {
        this.pause();
    }
}
class UniqueList {
    constructor() {
        this._elements = [];
    }
    get length() {
        return this._elements.length;
    }
    get(i) {
        return this._elements[i];
    }
    getLast() {
        return this.get(this.length - 1);
    }
    indexOf(e) {
        return this._elements.indexOf(e);
    }
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    remove(e) {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
            return e;
        }
        return undefined;
    }
    contains(e) {
        return this._elements.indexOf(e) != -1;
    }
    find(callback) {
        return this._elements.find(callback);
    }
    filter(callback) {
        return this._elements.filter(callback);
    }
    forEach(callback) {
        this._elements.forEach(e => {
            callback(e);
        });
    }
    sort(callback) {
        this._elements = this._elements.sort(callback);
    }
    clone() {
        let clonedList = new UniqueList();
        clonedList._elements = [...this._elements];
        return clonedList;
    }
}
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    copyFrom(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    static DistanceSquared(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        return dx * dx + dy * dy;
    }
    static Distance(a, b) {
        return Math.sqrt(Vec2.DistanceSquared(a, b));
    }
    static Dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static AngleFromTo(from, to, keepPositive = false) {
        let dot = Vec2.Dot(from, to) / from.length() / to.length();
        let angle = Math.acos(dot);
        let cross = from.x * to.y - from.y * to.x;
        if (cross === 0) {
            cross = 1;
        }
        angle *= Math.sign(cross);
        if (keepPositive && angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.lengthSquared());
    }
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    subtractInPlace(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    normalize() {
        return this.clone().normalizeInPlace();
    }
    normalizeInPlace() {
        this.scaleInPlace(1 / this.length());
        return this;
    }
    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    scaleInPlace(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    rotate(alpha) {
        return this.clone().rotateInPlace(alpha);
    }
    rotateInPlace(alpha) {
        let x = Math.cos(alpha) * this.x - Math.sin(alpha) * this.y;
        let y = Math.cos(alpha) * this.y + Math.sin(alpha) * this.x;
        this.x = x;
        this.y = y;
        return this;
    }
    mirror(axis) {
        return this.clone().mirrorInPlace(axis);
    }
    mirrorInPlace(axis) {
        this.scaleInPlace(-1);
        let a = Vec2.AngleFromTo(this, axis);
        this.rotateInPlace(2 * a);
        return this;
    }
    static ProjectOnABLine(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let tmp = pt.subtract(ptA);
        let dot = Vec2.Dot(dir, tmp);
        let proj = dir.scaleInPlace(dot).addInPlace(ptA);
        return proj;
    }
    static ProjectOnABSegment(pt, ptA, ptB) {
        let dir = ptB.subtract(ptA).normalizeInPlace();
        let proj = Vec2.ProjectOnABLine(pt, ptA, ptB);
        let tmpA = pt.subtract(ptA);
        if (Vec2.Dot(tmpA, dir) < 0) {
            return ptA.clone();
        }
        else {
            let invDir = dir.scale(-1);
            let tmpB = pt.subtract(ptB);
            if (Vec2.Dot(tmpB, invDir) < 0) {
                return ptB.clone();
            }
        }
        return proj;
    }
    static BBoxSurface(...points) {
        let min = points.reduce((v1, v2) => {
            return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
        });
        let max = points.reduce((v1, v2) => {
            return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
        });
        return (max.x - min.x) * (max.y - min.y);
    }
}
