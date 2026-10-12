import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 1;
  @type("number") z: number = 0;
  @type("number") rotY: number = 0;
  @type("number") health: number = 100;
  @type("uint8") team: number = 0; // 0 = Police, 1 = Thief
  @type("boolean") alive: boolean = true;
  @type("uint8") ammo: number = 30;
  @type("uint16") kills: number = 0;
  @type("uint16") deaths: number = 0;
  @type("boolean") isShooting: boolean = false;
  @type("uint16") lastShotTime: number = 0;
}
