export default class Astar {
    constructor(game, startNode) {
        this.game = game;
        this.nodeH = game.nodeH;
        this.running = false;
    }

    initStepByStep() {
        this.running = true;
    }

    continueStepbyStep() {
        if(this.nodeH.open.length && this.running) {
            //find node with the smallest f on the open list
            let node = this.nodeH.popSmallestF();
            //push the node to the closed list
            this.nodeH.pushToClosed(node);
            //generate successors
            this.genChildren(node);
        }
    }

    start() {
        this.running = true;
        this.time = new Date().getTime();
        while(this.nodeH.open.length && this.running) {
            //find node with the smallest f on the open list
            let node = this.nodeH.popSmallestF();
            //push the node to the closed list
            this.nodeH.pushToClosed(node);
            //generate successors
            this.genChildren(node);
        }
    }

    genChildren(node) {
        let vectors = {
            north: {x: 0, y: -1, g: 1},
            south: {x: 0, y: 1, g: 1},
            east: {x: 1, y: 0, g: 1},
            west: {x: -1, y: 0, g: 1},
            northeast: {x: 1, y: -1, g: 1.4},
            southwest: {x: -1, y: 1, g: 1.4},
            northwest: {x: -1, y: -1, g: 1.4},
            southeast: {x: 1, y: 1, g: 1.4},
        };
        for(let dir in vectors) {
            this.genChild(node, vectors[dir]);
        }
    }

    genChild(node, v) {
        let pos = {x: node.pos.x + v.x, y: node.pos.y + v.y};
        let g = node.g + v.g;

        if (this.inBounds(pos)) {
            let isWall = this.game.grid.isWall(pos);
            if (!isWall) {
                let nodeAtPos = this.nodeH.nodeAt(pos);
                if (nodeAtPos == null) {
                    //check diagonal parity
                    if (pos.x != node.pos.x && pos.y != node.pos.y) {
                        if (this.game.grid.isWall({x: pos.x, y: node.pos.y}) && 
                            this.game.grid.isWall({x: node.pos.x, y: pos.y})) {
                          return;
                        }
                    }
                    //calculate h heuristic (manhattan)
                    let h = Math.abs(pos.x - this.nodeH.end.pos.x) + Math.abs(pos.y - this.nodeH.end.pos.y);
                    //add it to the open list
                    this.nodeH.addOpen(g, h, node, pos);
                    
                } else if (nodeAtPos.end) {
                    if (pos.x != node.pos.x && pos.y != node.pos.y) {
                        if (this.game.grid.isWall({x: pos.x, y: node.pos.y}) && 
                            this.game.grid.isWall({x: node.pos.x, y: pos.y})) {
                          return;
                        }
                    }
                    this.tracePath(node);
                    return;
                } else if (!nodeAtPos.closed){
                    if (nodeAtPos.g > g) {
                        this.nodeH.reparent(nodeAtPos, g, node);
                    } 
                    return;
                }
            }
        }
    }

    //traces the path back
    tracePath(node) {
        console.log('END FOUND!');
        while(node.start != true) {
            node.path = true;
            node = node.parent;
        }
        this.running = false;
        let elapsed = new Date().getTime() - this.time;
        this.game.updateTime(elapsed);
        console.log('elapsed time: ' + elapsed/1000 + "(seconds)");
        console.log('elapsed time: ' + elapsed + "(ms)");
    }

    //test if a positon is in bounds
    inBounds(pos) {
        if (pos.x >= 0 && pos.x < this.game.gridWidth && 
            pos.y >= 0 && pos.y < this.game.gridHeight) { 
            return true;
        }
        return false;
    }
}