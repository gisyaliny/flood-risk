import * as THREE from "three";

import {
  windowMaterial,
  wallMaterial,
  pavementMaterial,
  colors,
  groundMaterial,
  backgroundMaterial,
  floorMaterial
} from "../materials";

export function table(x: number, y: number, z: number, yrotation: number) {
  const material = floorMaterial;

  const width = 0.8;
  const depth = 1.2;
  const legsheight = 0.7;
  const legswidth = 0.06;
  const legswidthhalf = legswidth / 2;

  const table = new THREE.Group();

  const legGeometry = new THREE.BoxGeometry(legswidth, legsheight, legswidth);
  legGeometry.translate(0, legsheight / 2, 0);
  const leg = new THREE.Mesh(legGeometry, material);
  leg.matrixAutoUpdate = false;
  leg.castShadow = true;
  leg.position.set(-width / 2 + legswidthhalf, 0, -depth / 2 + legswidthhalf);
  table.add(leg);
  leg.updateMatrix();

  const leg2 = leg.clone();
  leg2.position.set(-width / 2 + legswidthhalf, 0, depth / 2 - legswidthhalf);
  table.add(leg2);
  leg2.updateMatrix();

  const leg3 = leg.clone();
  leg3.position.set(width / 2 - legswidthhalf, 0, depth / 2 - legswidthhalf);
  table.add(leg3);
  leg3.updateMatrix();

  const leg4 = leg.clone();
  leg4.position.set(width / 2 - legswidthhalf, 0, -depth / 2 + legswidthhalf);
  table.add(leg4);
  leg4.updateMatrix();

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.06, depth),
    material
  );
  top.matrixAutoUpdate = false;
  top.castShadow = true;
  top.position.set(0, legsheight, 0);
  table.add(top);
  top.updateMatrix();

  table.position.set(x, y, z);
  if (yrotation) {
    table.rotation.y = THREE.MathUtils.degToRad(yrotation);
  }
  return table;
}
