/*eslint no-unused-vars: "off", max-len: "off"*/
import React, { Component } from 'react';
import './Game.css';

const TILESIZE = 32; // Size of each tile in pixels
const GRIDSIZE = 15; // Number of tiles per row

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nickname: "",
            baddie_model: "",
            baddie_dir: " ",
            baddie_x: 7,
            baddie_y: 7
        };

        this.keypress = this.keypress.bind(this);

        /**
         * This is the game area with a 10x10 grid (GRIDSIZE)
         * 10 - nothing (grass)
         * 11 - wall (impassible)
         * 13 - door (passible)
         * 14 - water (passible)
         */
        // The array size must be GRIDSIZE*GRIDSIZE
        this.gameArea = [
            11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 13,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 14, 14, 14, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 14, 14, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 14, 14, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11,
            11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11
        ];
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keypress);
    }

    /**
     * This function checks that the move was possible and returns either true or false
     * @param  {int} moveLeft	- direction to move horizontally, range: -1 -> 1
     * @param  {int} moveTop	- direction to move vertically, range: -1 -> 1
     * @return {bool} 			- was baddie movable
     */
    isBaddieMovable(moveLeft, moveTop) {
        // This time we want the grid position values, not the pixel position values
        let newLeft = this.state.baddie_x + moveLeft,
            newTop = this.state.baddie_y + moveTop,

            movable = false,

            // Get the tile baddie wants to move to
            // left is the row number and top is the column number
            tilePos = newLeft + newTop*GRIDSIZE,

            tile =  this.gameArea[tilePos];

        if (newLeft > GRIDSIZE-1 || newLeft < 0) {
            return movable;
        }

        // Switch case on the tile value baddie is moving to
        switch (tile) {
            case 10: // empty
            case 14: // water
                // Move baddie to tile
                movable = true;
                break;
            case 13: // door
                // Move baddie to tile
                movable = true;
                break;
            case 11:
                // Wall, don't move baddie
                movable = false;
                break;
            default:
                // Tile was impassible - collided, do not move baddie
                movable = false;
        }
        return movable;
    }

    /**
     * Changes position variables for baddie and style to draw the change out on the screen
     * @param  {[type]} x	- direction to move horizontally
     * @param  {[type]} y	- direction to move vertically
     */
    moveBaddie(x, y) {
        let direction = x > 0 ? "r" : x < 0 ? "l" : this.state.baddie_dir === "baddie-left " ? "l" : "r";

        this.props.sendToChat(`/move ${this.state.baddie_x + x},${this.state.baddie_y + y},${direction}`);

        // Update baddies grid position variables
        this.setState((state) => ({
            "baddie_x": state.baddie_x + x,
            "baddie_y": state.baddie_y + y,
        }));
    }

    keypress(event) {
        if (!this.props.isConnected) {
            return;
        }

        // Gets what key was pressed as number
        let key = event.keyCode || event.which;

        // Switch case to decide where baddie is to go
        switch (key) {
            case 37: //left
                if (this.isBaddieMovable(-1, 0)) {
                    // Turn baddie left - transform handled in style.css
                    this.setState({"baddie_dir": "baddie-left "});
                    this.moveBaddie(-1, 0);
                }
                break;
            case 38: //up
                if (this.isBaddieMovable(0, -1)) {
                    this.moveBaddie(0, -1);
                }
                break;
            case 39: //right
                if (this.isBaddieMovable(1, 0)) {
                    // Turn baddie right - transform handled in style.css
                    this.setState({"baddie_dir": " "});
                    this.moveBaddie(1, 0);
                }
                break;
            case 40: //down
                if (this.isBaddieMovable(0, 1)) {
                    this.moveBaddie(0, 1);
                }
                break;

            default:
                // Button was pressed but no action is to be performed
                // return this function so that the default button action is performed instead
                return true;
        }
        // Baddie action was performed - prevent button default
        event.preventDefault();
    }

    componentDidUpdate() {
        let player = this.props.player;

        if (Object.keys(player).length > 0) {
            this.props.playerLoaded();
            let [x, y, dir] = player.position.split(',');

            let baddieDir = dir === "l" ? "baddie-left " : " ";

            if (this.state.nickname !== player.nickname ||
                this.state.baddie_model !== player.model ||
                this.state.baddie_dir !== baddieDir ||
                this.state.baddie_x !== parseInt(x) ||
                this.state.baddie_y !== parseInt(y)
            ) {
                this.setState({
                    nickname: player.nickname,
                    baddie_model: player.model,
                    baddie_dir: baddieDir,
                    baddie_x: parseInt(x),
                    baddie_y: parseInt(y)
                });
            }
        }
    }

    displayBaddie() {
        if (!this.props.isConnected) {
            return;
        }

        return (
            <div
                style={{
                    left: this.state.baddie_x * TILESIZE + "px",
                    top: this.state.baddie_y * TILESIZE + "px"
                }}
                className = {"baddie-container own-baddie"}
            >
                <div
                    className = {"baddie baddie-"
                                + (this.state.baddie_model || "basic")
                                + " "
                                + this.state.baddie_dir}
                />
                <div className="player-name">{this.state.nickname}</div>
            </div>
        );
    }

    displayOtherBaddies() {
        if (!this.props.isConnected) {
            return;
        }

        return Object.keys(this.props.baddies).map((item, index) => {
            let baddie = this.props.baddies[item];

            let [x, y, dir] = baddie.position.split(',');

            let baddieDir = dir === "l" ? "baddie-left " : " ";

            return (
                <div
                    style={{
                        left: x * TILESIZE + "px",
                        top: y * TILESIZE + "px"
                    }}
                    className = {"baddie-container"}
                    key={index}
                >
                    <div
                        className = {"baddie baddie-"
                                + (baddie.model || "basic")
                                + " "
                                + baddieDir}
                    />
                    <div className="player-name">{item}</div>
                </div>
            );
        });
    }

    render() {
        return (
            <div
                id="game-field"
                style={{
                    width: GRIDSIZE * TILESIZE + "px",
                    height: GRIDSIZE * TILESIZE + "px"
                }}
                className = "game-field"
            >
                {this.gameArea.map((item, index) => (
                    <div className={"tile t" + item} id={"n" + index} key={index} />
                ))}

                {this.displayOtherBaddies()}

                {this.displayBaddie()}
            </div>
        );
    }
}

export default Game;
