class ProgramSlot {
    RADIUS_SIZE = 50;
    SELECTION_CIRCLE_SIZE = 30;
    PROGRAM_ICON_SIZE = 20;
    constructor(node, program, owner) {
        this.node = node;
        this.program = program;
        this.owner = owner;
        this.ownership = {};
        if (owner) {
            this.ownership[owner.id] = 100;
        }
        this.programSprite = null;
    }

    uninstallProgram() {
        this.program = null;
        this.updateProgramSprite();
    }

    isEmpty() { return this.program === null; }

    createSprite(container, anglePercent) {
        // Create a sprite
        const angle = Math.PI * 2 * anglePercent;
        const position = {x: Math.cos(angle) * this.RADIUS_SIZE, y: Math.sin(angle) * this.RADIUS_SIZE};

        this.container = new PIXI.Container();
        this.container.position.set(position.x, position.y);

        this.circleSprite = this.container.addChild(
            AssetLoader.getSprite(AssetLoader.SPRITES.CIRCLE, this.SELECTION_CIRCLE_SIZE, this.SELECTION_CIRCLE_SIZE)
        );

        container.addChild(this.container);
        this.updateProgramSprite();
        
        this.setOwner(this.owner);
    }

    updateProgramSprite() {
        if (this.programSprite) {
            this.programSprite.parent.removeChild(this.programSprite);
        }
        this.programSprite = null;

        if (this.program) {
            this.programSprite = this.container.addChild(
                AssetLoader.getSprite(this.program.getSpriteEnum(), this.PROGRAM_ICON_SIZE, this.PROGRAM_ICON_SIZE)
            );
            this.setOwner(this.owner);
        }
    }

    setOwner(owner) {
        this.owner = owner;
        let color = owner ? this.owner.getColor() : 0xFFFFFF;
        this.programSprite && (this.programSprite.tint = color);
        this.circleSprite && (this.circleSprite.tint = color);
    }

    getSpriteEnum() {
        if (!this.program) { return null; }
        return this.program.getSpriteEnum();
    }

    getIconPath() {
        if (!this.program) { return null; }
        return this.program.getIconPath();;
    }

    logicTick(delta, gameObj) {
        if (this.program) {
            this.program.logicTick(delta, this.owner, gameObj, this);
            this.programSprite && (this.programSprite.rotation = Math.PI * 2 * (this.program.getPercentDone()));
        }
    }
}

class Program {
    constructor(node) {
        this.node = node;
        this.timePerAction = 60;
        this.timer = this.timePerAction;
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.SHIELD;
    }

    getIconPath() {
        return this.getSpriteEnum().path;
    }

    getPercentDone() {
        return 1 - (this.timer / this.timePerAction);
    }

    logicTick(delta, owner, gameObj, slot) {
        this.timer -= 1;
        while (this.timer <= 0) {
            this.doProgramAction(owner, gameObj, slot);
            this.timer += this.timePerAction;
        }
    }

    doProgramAction(owner, gameObj, slot) {
        
    }

    createPacket(gameObj, owner, target) {
        gameObj.addPacket(new Packet(
            this,
            this.node,
            target,
            owner
        ));
    }

    packetReachedTarget(packet, gameObj) {
        
    }
}

class DefendProgram extends Program {
    getSpriteEnum() {
        return AssetLoader.SPRITES.SHIELD;
    }

    doProgramAction(owner, gameObj, slot) {
        const MAX_DEFENSE = 100;
        const DEFENSE_INCREASE = 1;
        this.node.defend(DEFENSE_INCREASE, MAX_DEFENSE, owner);
    }
}

class AttackProgram extends Program {
    ATTACK_DAMAGE = 2;
    getSpriteEnum() {
        return AssetLoader.SPRITES.SWORD;
    }

    getTarget(owner) {
        if (this.selectedTarget) { return this.selectedTarget; }

        let validTargets = Object.values(this.node.connections).filter((node) => node.owner !== owner);
        if (!validTargets) {
            return null;
        }

        return validTargets[0];
    }

    doProgramAction(owner, gameObj, slot) {
        let target = this.getTarget(owner);
        if (target) {
           this.createPacket(gameObj, owner, target);
        }
    }

    packetReachedTarget(packet, gameObj) {
        packet.targetNode.attack(this.ATTACK_DAMAGE, packet.owner);
    }
}

class InstallerProgram extends Program {
    constructor(node, installer) {
        super(node);
        console.log(installer);
        this.installer = installer;
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.SHIELD;
    }

    doProgramAction(owner, gameObj, slot) {
        slot.program = this.installer.buildProgram(this.node);
        slot.updateProgramSprite();
    }
}