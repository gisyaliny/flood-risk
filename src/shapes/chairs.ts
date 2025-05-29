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

export function chair(x: number, y: number, z: number, yrotation: number) {
  const material = floorMaterial;

  const width = 0.45;
  const depth = 0.45;
  const backheight = 0.35;
  const legsheight = 0.45;
  const legswidth = 0.06;
  const legswidthhalf = legswidth / 2;

  const chair = new THREE.Group();

  const legGeometry0 = new THREE.BoxGeometry(legswidth, legsheight, legswidth);
  const leg = new THREE.Mesh(legGeometry0.clone(), material);
  leg.geometry.translate(
    -width / 2 + legswidthhalf,
    legsheight / 2,
    -depth / 2 + legswidthhalf
  );
  leg.castShadow = true;
  chair.add(leg);

  const leg2 = new THREE.Mesh(legGeometry0.clone(), material);
  leg2.geometry.translate(
    -width / 2 + legswidthhalf,
    legsheight / 2,
    depth / 2 - legswidthhalf
  );
  leg2.castShadow = true;
  chair.add(leg2);

  const leg3 = new THREE.Mesh(legGeometry0.clone(), material);
  leg3.geometry.translate(
    width / 2 - legswidthhalf,
    legsheight / 2,
    depth / 2 - legswidthhalf
  );
  leg3.castShadow = true;
  chair.add(leg3);

  const leg4 = new THREE.Mesh(legGeometry0.clone(), material);
  leg4.geometry.translate(
    width / 2 - legswidthhalf,
    legsheight / 2,
    -depth / 2 + legswidthhalf
  );
  leg4.castShadow = true;
  chair.add(leg4);

  leg.matrixAutoUpdate = false;
  leg2.matrixAutoUpdate = false;
  leg3.matrixAutoUpdate = false;
  leg4.matrixAutoUpdate = false;

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(width, legswidth, depth),
    material
  );
  seat.geometry.translate(0, legsheight, 0);
  seat.castShadow = true;
  seat.matrixAutoUpdate = false;
  chair.add(seat);

  const chairback = new THREE.Group();
  chairback.position.set(-depth / 2 + legswidthhalf, legsheight, 0);

  // const testgeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  // const test = new THREE.Mesh(testgeo, material);
  // chairback.add(test);

  const backleft = new THREE.Mesh(legGeometry0.clone(), material);
  backleft.geometry.translate(0, backheight / 2, depth / 2 - legswidthhalf);
  backleft.castShadow = true;
  backleft.matrixAutoUpdate = false;
  chairback.add(backleft);

  const backright = new THREE.Mesh(legGeometry0.clone(), material);
  backright.geometry.translate(0, backheight / 2, -depth / 2 + legswidthhalf);
  backright.castShadow = true;
  backright.matrixAutoUpdate = false;
  chairback.add(backright);

  const backseat = new THREE.Mesh(
    new THREE.BoxGeometry(legswidth, 0.2, width),
    material
  );
  backseat.geometry.translate(0, backheight + 0.1, 0);
  backseat.castShadow = true;
  backseat.matrixAutoUpdate = false;
  chairback.add(backseat);

  chairback.rotation.z = THREE.MathUtils.degToRad(10);

  chair.add(chairback);

  chair.position.set(x, y, z);
  if (yrotation) {
    chair.rotation.y = THREE.MathUtils.degToRad(yrotation);
  }

  return chair;
}
