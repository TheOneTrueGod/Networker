class Packet {
    ICON_SIZE = 20;
    DURATION = 300;
    constructor(program, sourceNode, targetNode, owner) {
        this.program = program;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.owner = owner;
        this.timer = 0;
    }

    createSprite(container) {
        this.sprite = AssetLoader.getSprite(AssetLoader.SPRITES.SWORD, this.ICON_SIZE, this.ICON_SIZE);

        this.container = new PIXI.Container();

        const backgroundCircle = new PIXI.Graphics();
        backgroundCircle.beginFill(this.owner.getColor());
        backgroundCircle.drawCircle(0, 0, this.ICON_SIZE / 2 + 4);
        backgroundCircle.endFill();
        this.container.addChild(backgroundCircle);

        this.container.addChild(this.sprite);
        const position = this.getPosition();
        this.container.position.set(position.x, position.y);

        container.addChild(this.container);
        
        return this.container;
    }

    removeSprite() {
        this.container.parent.removeChild(this.container);
    }

    getPosition() {
        const pct = this.timer / this.DURATION;
        const connectionLine = this.sourceNode.getConnectionLine(this.targetNode.id, this.ICON_SIZE / 2);
        if (!connectionLine) {
            return { x: this.sourceNode.position.x, y: this.sourceNode.position.y };
        }

        return {
            x: connectionLine[0].x + (connectionLine[1].x - connectionLine[0].x) * pct,
            y: connectionLine[0].y + (connectionLine[1].y - connectionLine[0].y) * pct,
        };
    }

    logicTick = (delta, gameObj) => {
        this.timer += 1;

        if (this.sprite) {
            let pos = this.getPosition();
            this.container.x = pos.x;
            this.container.y = pos.y;
        }
        
        if (this.timer > this.DURATION) {
            this.program.packetReachedTarget(this, gameObj);
        }
    }

    readyToDelete() {
        return this.timer > this.DURATION;
    }
}