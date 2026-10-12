import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema {
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>();
  @type("uint16") policeScore: number = 0;
  @type("uint16") thiefScore: number = 0;
  @type("uint16") maxScore: number = 50;
  @type("string") lastKillMessage: string = "";
}
