class NetworkNode {
    SELECTION_CIRCLE_SIZE = 80;
    ICON_SIZE = 50;
    constructor(x, y, owner) {
        this.id = NetworkNode.NODE_ID_INDEX ++;

        this.owner = owner;

        this.position = {x, y};

        this.defenses = {};
        this.startingDefense = 10;

        this.connections = {};
        this.hovered = false;
        this.sprite = null;
        this.connectionSprites = [];
        this.spriteScale = 1;
        this.hoverScale = 1;
        this.programSlots = [
            new ProgramSlot(this, new DefendProgram(this), owner),
            new ProgramSlot(this, owner !== null ? new AttackProgram(this) : null, owner),
            new ProgramSlot(this, null, owner),
            new ProgramSlot(this, null, owner),
        ];
    }

    installProgram(installer) {
        for (let i = 0; i < this.programSlots.length; i++) {
            if (this.programSlots[i].isEmpty()) {
                this.programSlots[i].program = new InstallerProgram(this, installer);
                this.programSlots[i].updateProgramSprite();
                return true;
            }
        }
        return false;
    }

    addConnection(node) {
        this.internalAddConnection(node);
        node.internalAddConnection(this);
    }

    internalAddConnection(node) {
        this.connections[node.id] = node;
    }

    getSpriteEnum() {
        return AssetLoader.SPRITES.PC_ICON;
    }

    defend(increase, maxAmount, owner) {
        if (this.startingDefense < maxAmount) {
            this.startingDefense = Math.min(this.startingDefense + increase, maxAmount);
        }
        for (var key of Object.keys(this.defenses)) {
            if (!owner || parseInt(key) !== owner.id) {
                if (this.defenses[key] < maxAmount) {
                    this.defenses[key] = Math.min(this.defenses[key] + increase, maxAmount);
                }
            }
        }
    }

    attack(amount, owner) {
        if (this.owner && owner.id === this.owner.id) {
            return;
        }
        if (this.defenses[owner.id] === undefined) {
            this.defenses[owner.id] = this.startingDefense;
        }
        this.defenses[owner.id] = Math.max(this.defenses[owner.id] - amount, 0);
        if (this.defenses[owner.id] == 0) {
            this.setOwner(owner);
            this.defend(10, 10, null);
        }
    }

    getDefendDisplayValue(player) {
        //console.log(this.defenses[player.id]);
        if (this.defenses[player.id] === undefined) {
            return this.startingDefense;
        }
        return this.defenses[player.id];
    }

    getIconPath() {
        return this.getSpriteEnum().path;
    }

    createSprite(container, onSelect) {
        // Create a sprite
        this.sprite = AssetLoader.getSprite(this.getSpriteEnum(), this.ICON_SIZE, this.ICON_SIZE);
        this.spriteScale = {x: this.sprite.scale.x, y: this.sprite.scale.y};

        this.container = new PIXI.Container();
        this.container.addChild(this.sprite);
        this.container.position.set(this.position.x, this.position.y);

        this.selectedSprite = this.container.addChild(
            AssetLoader.getSprite(AssetLoader.SPRITES.CIRCLE, this.SELECTION_CIRCLE_SIZE, this.SELECTION_CIRCLE_SIZE)
        );
        this.selectedSprite.visible = false;

        this.container.interactive = true;

        this.container.on('mousedown', () => { onSelect(this); });
        this.container.on('mouseover', () => { this.hovered = true });
        this.container.on('mouseout', () => { this.hovered = false });

        container.addChild(this.container);
        this.createConnectionSprites(container);

        const numSlots = this.programSlots.length;
        let i = 0;
        this.programSlots.forEach(slot => { 
            slot.createSprite(this.container, i / numSlots);
            i += 1; 
        });
        
        this.setOwner(this.owner);
    }

    createConnectionSprites(container) {
        for (let connectionId in this.connections) {
            const target = this.connections[connectionId].position;

            const angle = Math.atan2(this.position.y - target.y, this.position.x - target.x);

            const offset = this.SELECTION_CIRCLE_SIZE * 0.85;
            const lineStart = {
                x: this.position.x - Math.cos(angle) * offset, 
                y: this.position.y - Math.sin(angle) * offset
            };
            const lineEnd = {x: (this.position.x + target.x) / 2, y: (this.position.y + target.y) / 2}
            
            
            const connectionLine = new PIXI.Graphics();
            connectionLine.lineStyle(4, 0xFFFFFF, 1);
            connectionLine.moveTo(lineStart.x, lineStart.y);
            connectionLine.lineTo(lineEnd.x, lineEnd.y);
            this.connectionSprites.push(connectionLine);
            container.addChild(connectionLine);
        }
    }

    getConnectionLine(otherNodeId, offsetFromEnd) {
        offsetFromEnd = offsetFromEnd || 0;
        if (!this.connections[otherNodeId]) {
            return null;
        }
        const target = this.connections[otherNodeId].position;

        const angle = Math.atan2(this.position.y - target.y, this.position.x - target.x);

        const offset = this.SELECTION_CIRCLE_SIZE * 0.85 + offsetFromEnd;
        const lineStart = {
            x: this.position.x - Math.cos(angle) * offset, 
            y: this.position.y - Math.sin(angle) * offset,
        };
        const lineEnd = {
            x: target.x + Math.cos(angle) * offset, 
            y: target.y + Math.sin(angle) * offset,
        };
        return [lineStart, lineEnd];
    }

    setOwner(newOwner) {
        this.owner = newOwner;
        if (this.sprite) {
            let color = 0xFFFFFF;
            if (newOwner) {
                color = newOwner.getColor();
            }

            this.sprite.tint = color;
            this.connectionSprites.forEach((connectionSprite) => { 
                connectionSprite.tint = color;
            });

            this.programSlots.forEach(slot => { 
                slot.setOwner(newOwner);
            });
        }
    }

    logicTick(delta, selected, gameObj) {
        let prevHoverScale = this.hoverScale;
        if (this.hovered || selected) {
            this.hoverScale = Math.min(1.2, this.hoverScale + 0.01);
        } else {
            this.hoverScale = Math.max(1, this.hoverScale - 0.01);
        }

        this.programSlots.forEach(slot => {
            slot.logicTick(delta, gameObj);
        })

        this.selectedSprite.visible = selected;

        if (prevHoverScale !== this.hoverScale) {
            this.sprite.scale.x = this.spriteScale.x * this.hoverScale;
            this.sprite.scale.y = this.spriteScale.y * this.hoverScale;
        }
    }
}

NetworkNode.NODE_ID_INDEX = 0;