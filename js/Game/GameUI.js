class GameUI {
    constructor(size, containerElement, pixiApp, game) {
        this.size = size;
        this.game = game;
        this.selectedNode = null;
        this.player = null;
        this.createUI(containerElement, pixiApp);

        this.templates = {
            nodeDetails: document.querySelector("#templates .nodeDetails")
        }
        this.listeners = [];
    }

    setPlayer(networkOwner) {
        this.player = networkOwner;
    }

    createUI(containerElement, pixiApp) {
        this.containerElement = containerElement;
        
        this.canvasContainerElement = document.createElement("div");
        this.canvasContainerElement.appendChild(pixiApp.view);
        this.canvasContainerElement.style.float = "left";
        this.containerElement.appendChild(this.canvasContainerElement);

        this.programContainerElement = document.createElement("div");
        this.programContainerElement.style.display = "inline-block";
        this.programContainerElement.style.width = "200px";
        this.programContainerElement.style.height = "500px";
        this.programContainerElement.style.background = "black";
        this.programContainerElement.style.borderLeft = "1px solid gray";

        this.containerElement.appendChild(this.programContainerElement);
    }

    changeSelectedNode(newNode) {
        if (newNode === this.selectedNode) {
            return;
        }
        this.selectedNode = newNode;

        this.rebuildProgramUI();
    }

    removeAllChildNodes(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    onProgramSlotClick = () => {
        
    }

    rebuildProgramUI() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i][0].removeEventListener('click', this.listeners[i][1])
        }
        this.listeners = [];
        this.removeAllChildNodes(this.programContainerElement);
        if (this.selectedNode === null) {
            return;
        }

        let newNode = this.templates.nodeDetails.cloneNode(true);

        let icon = newNode.querySelector(".nodeIcon");
        icon.setAttribute("src", this.selectedNode.getIconPath());
        
        let defendHealth = newNode.querySelector(".defendHealth");
        defendHealth.innerText = this.selectedNode.getDefendDisplayValue(this.player);

        this.programContainerElement.appendChild(newNode);

        let programSlotTemplate = this.templates.nodeDetails.querySelector(".programSlot");
        let programSlots = newNode.querySelector(".programSlots");
        this.removeAllChildNodes(programSlots);

        this.selectedNode.programSlots.forEach((slot) => {
            const newSlot = programSlotTemplate.cloneNode(true);
            
            const programIcon = newSlot.querySelector(".programIcon");
            const newIconPath = slot.getIconPath();
            if (newIconPath === null) {
                newSlot.removeChild(programIcon);
            } else {
                programIcon.setAttribute("src", newIconPath);
            }

            if (slot.program) {
                newSlot.classList.add('hasProgram');
                const callback = () => {
                    if (
                        this.selectedNode.owner && this.player && 
                        this.selectedNode.owner.id == this.player.id
                    ) {
                        slot.uninstallProgram();
                        this.rebuildProgramUI();
                    }
                };
                newSlot.addEventListener('click', callback)
                this.listeners.push([newSlot, callback]);
            }

            programSlots.appendChild(newSlot);
        });

        let installerSlots = newNode.querySelector(".installerSlots");

        if (
            this.player && this.selectedNode.owner && 
            this.player.id === this.selectedNode.owner.id
        ) {
            let installerSlotTemplate = this.templates.nodeDetails.querySelector(".installerSlot");
            this.removeAllChildNodes(installerSlots);
            let installers = this.player.getInstallerList();
            installers.forEach(installer => {
                const newInstallerSlot = installerSlotTemplate.cloneNode(true);

                const installerIcon = newInstallerSlot.querySelector(".installerIcon");
                
                const newIconPath = installer.getIconPath();
                if (newIconPath === null) {
                    const container = newInstallerSlot.querySelector(".installerImageContainer");
                    container.removeChild(installerIcon);
                } else {
                    installerIcon.setAttribute("src", newIconPath);
                }

                const installerName = newInstallerSlot.querySelector(".installerName");
                installerName.innerText = installer.getDisplayName();

                installerSlots.appendChild(newInstallerSlot);

                const callback = () => {
                    this.selectedNode.installProgram(installer);
                    this.rebuildProgramUI();
                };
                newInstallerSlot.addEventListener('click', callback)
                this.listeners.push([newInstallerSlot, callback]);
            });
        } else {
            newNode.removeChild(installerSlots);
        }
    }

    logicTick = (delta) => {
        if (this.selectedNode) {
            let defendHealth = this.programContainerElement.querySelector(".defendHealth");
            defendHealth.innerText = this.selectedNode.getDefendDisplayValue(this.player);
        }
    }
}
