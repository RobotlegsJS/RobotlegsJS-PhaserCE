import { injectable } from "robotlegs";

import { StateMediator } from "@robotlegsjs/robotlegsjs-phaser";

import { Preload } from "../states/Preload";

@injectable()
export class PreloadMediator extends StateMediator<Preload> {

    public initialize(): void {
        console.log("PreloadMediator: initialize");
    }

    public destroy(): void {
        console.log("PreloadMediator: destroy");
    }
}