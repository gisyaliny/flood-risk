import * as THREE from "three";
import { Vector3 } from "three";
import {
  roofMaterial,
  floorMaterial,
  wallMaterial,
  aluMaterial,
  aweningMaterial,
  aweningMaterial2,
  woodMaterial,
  plantMaterial,
  bulbMaterial,
  bulbMaterialOn
} from "./materials";

import { IHouse } from "./houses/types";

console.clear();

export function getNormal(u: Vector3, v: Vector3): Vector3 {
  return new THREE.Plane().setFromCoplanarPoints(new Vector3(), u, v).normal;
}

export function signedAngleTo(u: Vector3, v: Vector3): number {
  // Get the signed angle between u and v, in the range [-pi, pi]
  const angle = u.angleTo(v);
  const normal = getNormal(u, v);
  return normal.z * angle;
}

const angleTo = (from: THREE.Vector3, to: THREE.Vector3) => {
  let angle = 0;
  try {
    let closingAngle = to.angleTo(from);
    angle = THREE.MathUtils.radToDeg(closingAngle);

    if (angle < 0) {
      angle += 180;
    }
  } catch {
    console.log(from, to);
  }

  return angle;
};

const setData = (house: IHouse) => {
  if (house.floors.length > 0) {
    let previousFloor;
    for (var f = 1; f < house.floors.length; f++) {
      const floor = house.floors[f];
      previousFloor = house.floors[f - 1];
      if (!floor.sides) {
        floor.sides = [];
      }

      // Create empty arrays
      for (var s = 0; s < house.floors[0].sides.length; s++) {
        if (!floor.sides[s]) {
          floor.sides.push({});
        }
      }

      // Fill in side data from previous
      for (s = 0; s < house.floors[0].sides.length; s++) {
        const side = floor.sides[s];
        const y = previousFloor.sides[0].start.y + previousFloor.height;

        side.start = previousFloor.sides[s].start
          ?.clone()
          .add(side.shift || new Vector3());
        side.start.y = y;
        if (s === 0) {
          floor.sides[floor.sides.length - 1].end = side.start?.clone();
        } else {
          floor.sides[s - 1].end = side.start?.clone();
        }
        side.width = 3;
        // side.end = previousFloor.sides[s].end?.clone();
      }
    }

    for (f = 1; f < house.floors.length; f++) {
      for (s = 0; s < house.floors[0].sides.length; s++) {
        const side = house.floors[f].sides[s];
        side.width = side.start?.distanceTo(side.end);
      }
    }
  }
  for (f = 0; f < house.floors.length; f++) {
    const floor = house.floors[f];
    for (s = 0; s < floor.sides.length; s++) {
      const side = floor.sides[s];
      if (side.holes) {
        const sideWidth = side.width || 1;
        // const floorBase = house.floors
        //   .slice(0, f)
        //   .reduce((partialSum, a) => partialSum + a.height, 0);

        for (var ii = 0; ii < side.holes.length; ii++) {
          if (side.holes[ii]) {
            const hole = side.holes[ii];

            let windowOffset = hole.offsetLeft;
            if (hole.offsetLeft != null && hole.offsetLeft < 1) {
              windowOffset = sideWidth * hole.offsetLeft;
            }

            if (hole.top != null && hole.bottom != null && !hole.height) {
              const holeHeight = floor.height * (1 - hole.top - hole.bottom);

              hole.height = holeHeight;
            }
            if (side.start) {
              if (hole.bottom != null) {
                hole.y = floor.height * hole.bottom + hole.height / 2;
              } else if (hole.top != null) {
                hole.y =
                  floor.height - hole.height / 2 + floor.height * hole.top;
              } else {
                hole.y = 0;
              }
            }

            hole.x = windowOffset;
          }
        }
      }
    }
    // if (floor.ground) {
    //   for (var g = 0; g < floor.ground.length; g++) {
    //     const ground = floor.ground[g];
    //     if (ground) {
    //       console.log(ground);
    //     }
    //   }
    // }
  }
  console.log("--------");
  console.log(house);

  return house;
};

const fillData = (house: IHouse) => {
  if (!house.floors.length) return;

  for (var f = 0; f < 1; f++) {
    const floor = house.floors[f];
    for (var s = 0; s < floor.sides.length; s++) {
      const side = floor.sides[s];
      if (s < floor.sides.length - 1) {
        side.end = floor.sides[s + 1].start.clone();
      } else {
        side.end = floor.sides[0].start.clone();
      }
    }
  }

  return setData(house);
};

const init = (house: IHouse) => {
  return fillData(house);
};

export default init;
