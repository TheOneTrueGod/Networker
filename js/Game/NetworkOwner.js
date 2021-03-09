class NetworkOwner {
    constructor() {
        this.id = NetworkOwner.NODE_ID_INDEX ++;
        const colors = [0x7777FF, 0xFF1111, 0x00FF00];
        this.color = colors[this.id % colors.length] * Math.pow(0.5, Math.floor(this.id / colors.length))
        this.installers = [
            new AttackInstaller(),
            new DefendInstaller(),
        ];
    }

    getInstallerList() {
        return this.installers;
    }

    getColor() {
        return this.color;
    }
}
NetworkOwner.NODE_ID_INDEX = 0;