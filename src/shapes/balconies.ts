import * as THREE from "three";
import { IHoleSettings, wallHole } from "./shapes";

interface IBalconyRailing {
  materials: IBalconyMaterials;
  width?: number;
  height?: number;
  space?: number;
  railwidth?: number;
}
export const balconyRaling = ({
  height = 1,
  width = 2,
  space = 0.1,
  railwidth = 0.06,
  materials
}: IBalconyRailing) => {
  const g = new THREE.Group();

  const count = Math.round(width / space);
  space = width / count;

  const toprail = new THREE.Mesh(
    new THREE.BoxGeometry(width + railwidth, railwidth, railwidth),
    materials.alu || materials.default
  );
  toprail.position.x = width / 2;
  toprail.position.y = height;
  toprail.position.z = 0;
  toprail.receiveShadow = true;
  toprail.castShadow = true;
  g.add(toprail);
  toprail.matrixAutoUpdate = false;
  toprail.updateMatrix();

  for (var i = 0; i <= count; i++) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, height, 0.02),
      materials.alu || materials.default
    );
    rail.position.x = i * space;
    rail.position.y = height / 2;
    rail.position.z = 0;
    rail.receiveShadow = true;
    rail.castShadow = true;
    g.add(rail);
    rail.matrixAutoUpdate = false;
    rail.updateMatrix();
  }

  return g;
};

export const wallRailing = ({ settings, hole }: IBalcony) => {
  const balconyWidth = hole.width;
  const balconyLeft = -hole.width / 2 + hole.x;

  const railingSpace = 0.2;
  const railingHeight = hole.height - 0.1;

  const railingFront = balconyRaling({
    width: balconyWidth,
    height: railingHeight,
    space: railingSpace,
    materials: settings.materials
  });
  railingFront.position.x = balconyLeft;
  railingFront.position.z = settings.z;
  railingFront.position.y = hole.y - railingHeight / 2;

  return {
    shape: railingFront,
    hole: wallHole(hole.width, hole.height, hole.x, hole.y)
  };
};
export interface IBalconyMaterials {
  default: any;
  alu?: any;
  fabric?: any[];
}

export interface IBalconySettings {
  type: string;
  z: number;
  top: number;
  left: number;
  right: number;
  materials: IBalconyMaterials;
  depth: number;
}

interface IBalcony {
  settings: IBalconySettings;
  hole: IHoleSettings;
}
export const balcony = ({ settings, hole }: IBalcony) => {
  const balconyWidth = hole.width - settings.left - settings.right;
  const balconyLeft = -hole.width / 2 + settings.left;
  const balconyRight = hole.width / 2 - settings.right;
  const balconyCenter = (settings.left - settings.right) / 2;

  const g = new THREE.Group();
  g.position.x = hole.x;
  g.position.z = settings.z;
  g.position.y = hole.y - settings.top - hole.height / 2;

  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(balconyWidth, 0.2, settings.depth),
    settings.materials.default
  );
  bottom.position.x = balconyCenter;
  bottom.position.y = -0.1;
  bottom.position.z = settings.depth / 2;
  bottom.receiveShadow = true;
  bottom.castShadow = true;
  g.add(bottom);

  const railingSpace = 0.2;
  const railingLeft = balconyRaling({
    width: settings.depth - 0.2,
    space: railingSpace,
    materials: settings.materials
  });
  railingLeft.rotation.y = Math.PI / -2;
  railingLeft.position.x = balconyLeft + 0.1;
  railingLeft.position.z = 0.1;
  g.add(railingLeft);

  const railingRight = railingLeft.clone();
  railingRight.position.x = balconyRight - 0.1;
  g.add(railingRight);

  const railingFront = balconyRaling({
    width: balconyWidth - 0.2,
    space: railingSpace,
    materials: settings.materials
  });
  railingFront.position.x = balconyLeft + 0.1;
  railingFront.position.z = settings.depth - 0.1;
  g.add(railingFront);

  return {
    shape: g
  };
};
