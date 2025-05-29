import * as THREE from "three";
import {
  Evaluator,
  EdgesHelper,
  Operation,
  OperationGroup,
  ADDITION,
  SUBTRACTION
} from "three-bvh-csg";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

export { awning, retractableAwning, IAwningSettings } from "./awnings";
export { balcony, wallRailing, IBalconySettings } from "./balconies";
export { chair } from "./chairs";
export { table } from "./tables";

// CSG
let csgEvaluator: any;
csgEvaluator = new Evaluator();
csgEvaluator.attributes = ["position", "normal"];
csgEvaluator.useGroups = false;

export function wallHole(w: number, h: number, x: number, y: number) {
  const hole = new Operation(new THREE.BoxGeometry(w, h, 0.7)); //BoxBufferGeometry
  hole.operation = SUBTRACTION; //ADDITION; // ;
  hole.position.x = x;
  hole.position.y = y; //hole.positionFromGround(y);

  hole.matrixAutoUpdate = false;
  hole.updateMatrix();
  // console.log(w, h, x, y);

  //addWindow(w, h, x, y);

  return hole;
}

export function bulbLight(x: number, y: number, z: number) {
  // console.log("bulb", x, y, z);
  const bulbLight = new THREE.PointLight(0xffcf73, 0.1);
  // const bulbLight = new THREE.SpotLight(0xffcf73, 1);
  // const bulbLight = new THREE.DirectionalLight(0xffcf73, 1);
  bulbLight.castShadow = false;
  //Set up shadow properties for the light

  bulbLight.power = 20;
  bulbLight.decay = 0.5;
  // bulbLight.distance = Infinity;
  //bulbLight.position.set(-100, 600, -100);
  bulbLight.position.set(x, y, z);
  // bulbLight.target.updateMatrixWorld();

  bulbLight.matrixAutoUpdate = false;
  bulbLight.updateMatrix();
  // scene.add(bulbLight);

  const bulbLightshadowCam = bulbLight.shadow.camera;
  bulbLight.castShadow = true;
  bulbLight.shadow.mapSize.setScalar(512);
  bulbLight.shadow.mapSize.width = 512;
  bulbLight.shadow.mapSize.height = 512;
  bulbLight.shadow.camera.near = 0.05; // default
  bulbLight.shadow.camera.far = 10; // default
  bulbLight.shadow.bias = -0.00005; //1e-5;
  bulbLight.shadow.normalBias = 0.02; //1e-2;
  setTimeout(() => {
    bulbLight.shadow.autoUpdate = false;
  }, 500);

  // bulbLightshadowCam.left = bulbLightshadowCam.bottom = -1000;
  // bulbLightshadowCam.right = bulbLightshadowCam.top = 1000;
  bulbLightshadowCam.updateProjectionMatrix();

  return bulbLight;
}

interface IBulbMaterials {
  default: string;
  bulb: string;
}
export interface IHangingLightsSettings {
  type: string;
  z: number;
  depth: number;
  hanging: number[];
  materials: IBulbMaterials;
}

interface IHangingLights {
  settings: IHangingLightsSettings;
  hole: IHoleSettings;
}

// addShape( californiaShape, extrudeSettings, 0xf08000, - 300, - 100, 0, 0, 0, 0, 1 );
// function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {

function addLineShape(shape, color, x, y, z, rx, ry, rz, s) {
  // lines
  // console.log("shape", shape);

  shape.autoClose = false;

  const points = shape.getPoints(50);
  // const spacedPoints = shape.getSpacedPoints(50);

  // Create the final object to add to the scene
  //const curveObject = new THREE.Line( geometry, material );

  const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);

  // solid line

  let line = new THREE.Line(
    geometryPoints,
    new THREE.LineBasicMaterial({ color: color, linewidth: 0.1 })
  );
  line.position.set(x, y, z);
  line.rotation.set(rx, ry, rz);
  line.scale.set(s, s, s);
  return line;
}

export const hangingLightPosts = ({ settings, hole }: IHangingLights) => {
  const g = new THREE.Group();
  g.position.x = 0;
  g.position.z = 0;
  g.position.y = 0;

  for (var i = 0; i < settings.path.length; i++) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, hole.height, 6),
      settings.materials.default
    );
    post.position.copy(settings.path[i]);
    post.receiveShadow = true;
    post.castShadow = true;

    post.matrixAutoUpdate = false;
    post.updateMatrix();
    g.add(post);
  }

  return g;
};

export const hangingLightBulbs = (
  curve: THREE.CatmullRomCurve3,
  bulbs: number,
  materials: any
) => {
  const g = new THREE.Group();

  const bulbgroup = new THREE.Group();
  const bulbstem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6),
    materials.default
  );
  const bulbtop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.05, 0.1, 16),
    materials.bulb
  );
  const bulbbottom = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    materials.bulb
  );

  bulbstem.position.y = 0;
  bulbtop.position.y = -0.1 / 2 - 0.025;
  bulbbottom.position.y = bulbtop.position.y - 0.1 / 2;

  bulbgroup.add(bulbstem);
  bulbgroup.add(bulbtop);
  bulbgroup.add(bulbbottom);

  const bulb = bulbLight(0, -0.2, 0);

  bulb.castShadow = false;
  bulb.power = 1;
  bulb.decay = 0.3;
  bulb.distance = 4;

  bulbgroup.add(bulb);

  const points = curve.getSpacedPoints(bulbs);

  for (var i = 1; i < points.length - 1; i++) {
    const bulbclone = bulbgroup.clone();
    bulbclone.position.copy(points[i]);
    bulbclone.rotation.x = THREE.MathUtils.randFloat(-0.2, 0.2);
    bulbclone.rotation.z = THREE.MathUtils.randFloat(-0.2, 0.2);
    bulbclone.updateMatrix();

    g.add(bulbclone);
  }
  return g;
};
// https://threejs.org/docs/#api/en/geometries/TubeGeometry
export const hangingLights = ({ settings, hole }: IHangingLights) => {
  const g = new THREE.Group();
  g.position.x = hole.x - hole.width / 2; //hole.x;
  g.position.z = -settings.z || -1; //settings.z;
  g.position.y = hole.height / 2;

  const posts = hangingLightPosts({ settings, hole });
  g.add(posts);
  let hanging = settings.hanging[0];
  for (var i = 1; i < settings.path.length; i++) {
    const previousPoint = settings.path[i - 1];
    const currentPoint = settings.path[i];
    const mid1 = new THREE.Vector3().lerpVectors(
      previousPoint,
      currentPoint,
      0.15
    );
    const mid2 = new THREE.Vector3().lerpVectors(
      previousPoint,
      currentPoint,
      0.5
    );
    const mid3 = new THREE.Vector3().lerpVectors(
      previousPoint,
      currentPoint,
      0.85
    );
    if (settings.hanging[i - 1]) {
      hanging = settings.hanging[i - 1];
    }
    mid1.y = mid3.y = -hanging / 2;
    mid2.y = -hanging;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(previousPoint.x, 0, previousPoint.z),
      mid1,
      mid2,
      mid3,
      new THREE.Vector3(currentPoint.x, 0, currentPoint.z)
    ]);

    const bulbs = hangingLightBulbs(
      curve,
      previousPoint.distanceTo(currentPoint) / 0.5,
      settings.materials
    );
    bulbs.position.y = hole.y + hole.height / 2;
    g.add(bulbs);

    const lineshape = addLineShape(
      curve,
      0x000000,
      0, //hole.x,
      hole.y + hole.height / 2,
      0,
      0,
      0,
      0,
      1
    );

    lineshape.matrixAutoUpdate = false;
    lineshape.updateMatrix();
    g.add(lineshape);
  }

  return {
    shape: g
  };
};

export interface IPlantSettings {
  type: string;
  z: number;
  materials: IBalconyMaterials;
}

interface IPlant {
  settings: IPlantSettings;
  hole: IHoleSettings;
}

export const plant = ({ settings, hole }: IPlant) => {
  // const balconyWidth = hole.width - settings.left - settings.right;
  // const balconyLeft = -hole.width / 2 + settings.left;
  // const balconyRight = hole.width / 2 - settings.right;
  // const balconyCenter = (settings.left - settings.right) / 2;

  console.log("Plant", hole);
  const g = new THREE.Group();
  g.position.x = hole.x; //hole.x;
  g.position.z = settings.z || -1; //settings.z;
  g.position.y = hole.height / 2;

  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.5, hole.height, 0.32),
    settings.materials.default
  );
  // bottom.position.x = balconyCenter;
  // bottom.position.y = -10;
  // bottom.position.z = settings.depth / 2;
  bottom.receiveShadow = true;
  bottom.castShadow = true;
  g.add(bottom);

  bottom.matrixAutoUpdate = false;
  bottom.updateMatrix();
  return {
    shape: g
  };
};

interface IFrame {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  depth?: number;
  framewidth?: number[];
}
const frame = ({
  width = 2,
  height = 2,
  framewidth = [0.05, 0.05, 0.05, 0.05],
  depth = 5
}: IFrame) => {
  const frame = new Operation(new THREE.BoxGeometry(width, height, depth));

  const hole = new Operation(
    new THREE.BoxGeometry(
      width - framewidth[1] - framewidth[3],
      height - framewidth[0] - framewidth[2],
      depth * 2
    )
  );
  hole.operation = SUBTRACTION;
  hole.position.y = (framewidth[2] - framewidth[0]) / 2;
  hole.position.x = (framewidth[3] - framewidth[1]) / 2;

  frame.add(hole);

  const result = csgEvaluator.evaluateHierarchy(frame);
  result.castShadow = true;
  result.receiveShadow = true;

  return result;
};

interface IShutter {
  materials: IAweningMaterials;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
}
const shutter = ({ width = 2, height = 2, materials }: IShutter) => {
  const framemesh = frame({
    width: width,
    height: height,
    framewidth: [0.05, 0.05, 0.05, 0.05],
    depth: 0.04
  });
  const shutterframe = new Operation(framemesh.geometry);

  const innerheight = height - 0.05 - 0.05;
  const innerwidth = width - 0.05 - 0.05;
  const shutterparts = Math.ceil(innerheight / 0.1 + 0.005);

  const originalshutterpart = new Operation(
    new THREE.BoxGeometry(innerwidth, 0.1, 0.02)
  );
  originalshutterpart.operation = ADDITION;
  originalshutterpart.position.x = 0.01;
  originalshutterpart.rotation.x = 2.5;

  let shutterY = innerheight / 2 - 0 * 0.1;
  for (var i = 0; i < shutterparts; i++) {
    const shutterpart = originalshutterpart.clone();
    shutterpart.position.y = shutterY;
    shutterframe.add(shutterpart);

    shutterframe.matrixAutoUpdate = false;
    shutterframe.updateMatrix();
    shutterY -= 0.1;
  }

  const result = csgEvaluator.evaluateHierarchy(shutterframe);
  result.castShadow = true;
  result.receiveShadow = true;
  result.material = materials.default;

  return result;
};

export interface IBalconyDoorSettings {
  type: string;
  z: number;
  materials: IAweningMaterials;
  shutters: number;
  open?: number[];
}

export interface IHoleSettings {
  width: number;
  height?: number;
  x?: number;
  y?: number;
  groundY?: number;
  top?: number;
  bottom?: number;
  left?: number;
  offsetLeft?: number;
  shapes?: any[];
}

interface IBalconyDoor {
  settings: IBalconyDoorSettings;
  hole: IHoleSettings;
}

export const shuttersWithFrame = ({ hole, settings }: IBalconyDoor) => {
  const g = new THREE.Group();
  // console.log("shuttersWithFrame", hole, settings);
  const h = hole.height;
  const w = hole.width;
  const doorframe = 0.05;
  const innerWidth = w - doorframe * 2;

  const framemesh = frame({
    width: w,
    height: h,
    framewidth: [0.05, 0.05, 0.05, 0.05],
    depth: 0.04
  });

  const doorframeMesh = new THREE.Mesh(
    framemesh.geometry,
    settings?.materials?.default
  );
  doorframeMesh.position.x = w / 2;
  doorframeMesh.position.y = h / 2;
  doorframeMesh.matrixAutoUpdate = false;
  doorframeMesh.updateMatrix();
  g.add(doorframeMesh);

  const shutterwidth = innerWidth / settings.shutters;
  const shutterheight = h - doorframe * 2;
  let doorX = doorframe;
  const doorGroupRight = new THREE.Group();

  const door = shutter({
    width: shutterwidth,
    height: shutterheight,
    materials: settings.materials
  });
  door.receiveShadow = true;
  // door.position.z = 0;
  door.castShadow = true;

  let previousGroup;
  let counter = 0;
  for (var i = settings.shutters; i > 0; i--) {
    counter++;
    const isEven = counter % 2 === 1;
    // const is0orEven = i === 1 || isEven;

    const doorGroup = new THREE.Group();
    // doorGroup.name = `doorGroup${i}`;
    // const sphere = new THREE.SphereGeometry(5 * i);
    // const sphereMesh = new THREE.Mesh(sphere, materials.default);
    // sphereMesh.position.y = 240;
    // doorGroup.add(sphereMesh);

    // console.log("shutters", shutters, i, isEven);
    let posX = 0;
    if (i !== 1 && previousGroup) {
      // console.log("add to previousGroup");
      // previousGroup.add(doorGroup);
      const rotatedShutterWidth =
        shutterwidth * Math.abs(Math.cos(previousGroup.rotation.y));

      posX = doorX + innerWidth - rotatedShutterWidth * 2;
    }
    if (i === 1) {
      doorGroup.position.x = doorX;
    } else if (isEven) {
      doorGroup.position.x = doorX + innerWidth;
    } else {
      doorGroup.position.x = doorX + innerWidth - i * shutterwidth; // - (doorX + (i - 1) * shutterwidth);
      //   // doorGroupRight.position.x = doorX + shutters * shutterwidth;
    }
    // doorGroup.position.y = i * 100;

    // const door = new THREE.Mesh(
    //   new THREE.BoxGeometry(doorwidth, height - doorframe, 2),
    //   materials.default
    // );

    const doorclone = door.clone();
    doorGroup.add(doorclone);
    if (i === 1) {
      doorclone.position.x = shutterwidth / 2;
    } else if (isEven) {
      doorclone.position.x = -shutterwidth / 2;
    } else {
      doorclone.position.x = shutterwidth / 2;
      //doorGroupRight.add(doorGroup);
    }
    doorclone.position.y = h / 2;

    doorclone.matrixAutoUpdate = false;
    doorclone.updateMatrix();

    if (settings.open && settings.open[i] !== null) {
      if (i === 1) {
        doorGroup.rotation.y = THREE.MathUtils.degToRad(settings.open[0]);
      } else if (isEven) {
        doorGroup.rotation.y = THREE.MathUtils.degToRad(-settings.open[1]);
      } else {
        doorGroup.rotation.y = THREE.MathUtils.degToRad(settings.open[1]);
        doorGroup.position.x = posX;
      }
      g.add(doorGroup);
    }

    previousGroup = doorGroup;
  }
  g.add(doorGroupRight);

  // for (var i = shutters; i > 0; i--) {
  //   const isEven = i % 2 === 1;
  //   const is0orEven = i === 1 || isEven;
  //   const doorGroup = g.getObjectByName(`doorGroup${i}`);
  //   if (open[i] !== null && doorGroup) {
  //     if (i === 1) {
  //       doorGroup.rotation.y = THREE.MathUtils.degToRad(open[0]);
  //     } else if (isEven) {
  //       doorGroup.rotation.y = THREE.MathUtils.degToRad(-open[1]);
  //     } else {
  //       // doorGroup.rotation.y = THREE.MathUtils.degToRad(open[1]);
  //       // doorGroup.position.x = posX;
  //     }
  //   }
  // }

  g.position.x = hole.x - hole.width / 2;
  g.position.z = settings.z;
  g.position.y = hole.y - hole.height / 2;

  return {
    shape: g,
    hole: wallHole(hole.width, hole.height, hole.x, hole.y)
  };
};

export const balconydoor = ({ hole, settings }: IBalconyDoor) => {
  return shuttersWithFrame({
    hole: hole,
    settings: settings
  });
};

//N https://stackoverflow.com/questions/50957349/threejs-how-to-offset-all-points-on-a-2d-geometry-by-distance
function OffsetContour(offset, contour) {
  let result = [];

  offset = new THREE.BufferAttribute(new Float32Array([offset, 0, 0]), 3);
  console.log("offset", offset);

  for (let i = 0; i < contour.length; i++) {
    let v1 = new THREE.Vector2().subVectors(
      contour[i - 1 < 0 ? contour.length - 1 : i - 1],
      contour[i]
    );
    let v2 = new THREE.Vector2().subVectors(
      contour[i + 1 == contour.length ? 0 : i + 1],
      contour[i]
    );
    let angle = v2.angle() - v1.angle();
    let halfAngle = angle * 0.5;

    let hA = halfAngle;
    let tA = v2.angle() + Math.PI * 0.5;

    let shift = Math.tan(hA - Math.PI * 0.5);
    let shiftMatrix = new THREE.Matrix4().set(
      1,
      0,
      0,
      0,
      -shift,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );

    let tempAngle = tA;
    let rotationMatrix = new THREE.Matrix4().set(
      Math.cos(tempAngle),
      -Math.sin(tempAngle),
      0,
      0,
      Math.sin(tempAngle),
      Math.cos(tempAngle),
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );

    let translationMatrix = new THREE.Matrix4().set(
      1,
      0,
      0,
      contour[i].x,
      0,
      1,
      0,
      contour[i].y,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    );

    let cloneOffset = offset.clone();
    console.log("cloneOffset", cloneOffset);
    shiftMatrix.applyToBufferAttribute(cloneOffset);
    rotationMatrix.applyToBufferAttribute(cloneOffset);
    translationMatrix.applyToBufferAttribute(cloneOffset);

    result.push(new THREE.Vector2(cloneOffset.getX(0), cloneOffset.getY(0)));
  }

  return result;
}
