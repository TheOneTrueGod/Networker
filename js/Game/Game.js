// ParticleContainer -- A super fast way of rendering particles
// https://github.com/kittykatattack/dust -- Particle emitter
// https://github.com/kittykatattack/sound.js -- sound
class Game {
    constructor(containerElement) {
        this.pixiApp = new PIXI.Application({width: 500, height: 500});
        this.pixiStage = this.pixiApp.stage;
        this.gameUI = new GameUI({width: 500, height: 500}, containerElement, this.pixiApp);
    }

    start() {
        this.loadAssets();
    }

    onLoadProgress = (loader, resource) => {
        console.log("progress: " + loader.progress + "%");
    }

    // Step 1: Load Assets
    loadAssets() {
        AssetLoader.load(this.setupGame, this.onLoadProgress);
    }

    // Step 2: Setup the initial game state
    setupGame = () => {
        this.networkOwners = [new NetworkOwner(), new NetworkOwner()];
        this.gameUI.setPlayer(this.networkOwners[0]);
        this.gameCamera = new PIXI.Container();
        
        this.nodes = [
            new NetworkNode(70, 70, this.networkOwners[0]),
            new NetworkNode(70, 430, null),
            new NetworkNode(430, 70, null),
            new NetworkNode(250, 250, null),
            new NetworkNode(430, 430, this.networkOwners[1])
        ];
        this.nodes[0].addConnection(this.nodes[1]);
        this.nodes[0].addConnection(this.nodes[2]);

        this.nodes[3].addConnection(this.nodes[1]);
        this.nodes[3].addConnection(this.nodes[2]);

        this.nodes[4].addConnection(this.nodes[1]);
        this.nodes[4].addConnection(this.nodes[2]);

        this.nodes.forEach((node) => { node.createSprite(this.gameCamera, this.setSelectedNode) });

        this.pixiStage.addChild(this.gameCamera);

        this.packets = [];

        this.startGame();
    }

    // Step 3: Start the Game
    startGame = () => {
        this.pixiApp.ticker.add(delta => this.logicTick(delta));
        this.setSelectedNode(this.nodes[0]);
    }

    logicTick = (delta) => {
        this.nodes.forEach((node) => {
            node.logicTick(delta, this.selectedNode === node.id, this);
        });
        let i = 0;
        while (i < this.packets.length) {
            this.packets[i].logicTick(delta, this);
            if (this.packets[i].readyToDelete()) {
                this.packets[i].removeSprite();
                this.packets.splice(i, 1);
            } else {
                i += 1;
            }
        }
        this.packets.forEach((packet) => {
            packet.logicTick(delta, this);
        });
        this.gameUI.logicTick(delta);
    }

    setSelectedNode = (node) => {
        this.selectedNode = node.id;
        this.gameUI.changeSelectedNode(node);
    }

    addPacket = (packet) => {
        this.packets.push(packet);
        packet.createSprite(this.gameCamera);
    }
}