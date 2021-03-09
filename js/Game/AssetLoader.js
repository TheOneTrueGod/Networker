// See Texture Atlas here: https://github.com/kittykatattack/learningPixi#settingup
class AssetLoader {
    SPRITES = {
        PC_ICON: {name: "pc", path: "assets/pc.png", frame: [0, 0, 1024, 1024]},
        CIRCLE: {name: "circle", path: "assets/circle.png"},
        SWORD: {name: "sword", path: "assets/gladius.png"},
        SHIELD: {name: "shield", path: "assets/shield.png"},
    }

    constructor() {
    }

    load(callback, onLoadProgress) {
        const sp = this.SPRITES;
        for (let key in sp) {
            PIXI.loader.add(sp[key].name, sp[key].path);
        }
        PIXI.loader
            .on("progress", onLoadProgress)
            .load(callback);
    }

    getTexture(spriteEnum) {
        if (!spriteEnum.frame) {
            return PIXI.loader.resources[spriteEnum.name].texture
        }
        let texture = PIXI.loader.resources[spriteEnum.name].texture;
        texture.frame = new PIXI.Rectangle(spriteEnum.frame[0], spriteEnum.frame[1], spriteEnum.frame[2], spriteEnum.frame[3]);
        return texture;
    }

    getSprite(spriteEnum, width, height) {
        const sprite = new PIXI.Sprite(this.getTexture(spriteEnum));
        if (width) {
            sprite.width = width;
        }
        if (height) {
            sprite.height = height;
        }
        sprite.anchor.set(0.5);
        return sprite;
    }
}

AssetLoader = new AssetLoader();