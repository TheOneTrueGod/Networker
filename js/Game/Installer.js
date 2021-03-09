class Installer {
    constructor(program) {
        this.program = program;
    }

    getDisplayName() {
        return "ERROR Mk I";
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.SHIELD;
    }

    getIconPath() {
        return this.getSpriteEnum().path;
    }

    buildProgram(node) {
        const program = this.program;
        return new program(node);
    }
}

class AttackInstaller extends Installer {
    constructor() {
        super(AttackProgram);
    }

    getDisplayName() {
        return "Attack Mk I";
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.SWORD;
    }
}

class DefendInstaller extends Installer {
    constructor() {
        super(DefendProgram);
    }

    getDisplayName() {
        return "Defend Mk I";
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.SHIELD;
    }
}