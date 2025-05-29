import { IHoleSettings } from "../shapes/shapes";

export {
  IBalconySettings,
  IBalconyDoorSettings,
  IAwningSettings,
  IPlantSettings,
  IHoleSettings,
  IHangingLightsSettings
} from "../shapes/shapes";

export interface IHouseSide {
  start?: THREE.Vector3;
  end?: THREE.Vector3;
  shift?: THREE.Vector3;
  width?: number;
  angle?: number;
  combinedAngle?: number;
  holes?: IHoleSettings[];
}

export interface IHouseFloor {
  height: number;
  y?: number;
  floor?: boolean;
  materials: any;
  sides: IHouseSide[];
  // ground?: any[];
}

export interface IHouse {
  floors: IHouseFloor[];
  wallthickness: number;
}
