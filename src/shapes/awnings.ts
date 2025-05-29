import * as THREE from "three";
import { IHoleSettings } from "./shapes";

interface IAwningMaterials {
  default: any;
  alu?: any;
  fabric?: any[];
}

export interface IAwningSettings {
  type: string;
  materials: IAwningMaterials;
  depth: number;
  opened: number;
  top: number;
  left: number;
  right: number;
  height: number;
  z?: number;
  stiffness: number;
  segments: number;
}

interface IAwning {
  settings: IAwningSettings;
  hole: IHoleSettings;
}

function awningFabric({ settings, hole }: IAwning) {
  const thickness = 0.02;
  const meshZ = 0.02;
  const awningWidth = hole.width - settings.left - settings.right;
  const controlpoint = {
    x: 0 - settings.depth * (settings.stiffness / 2),
    y: -settings.height + settings.height * (settings.stiffness / 2)
  };

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(
    0,
    0,
    controlpoint.x,
    controlpoint.y,
    -settings.depth,
    -settings.height
  );
  shape.lineTo(-settings.depth, -settings.height + thickness);
  shape.bezierCurveTo(
    -settings.depth,
    -settings.height + thickness,
    controlpoint.x - thickness,
    controlpoint.y + thickness,
    -thickness,
    0
  );
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: awningWidth / settings.segments,
    bevelEnabled: false
  };

  const g = new THREE.Group();

  for (var i = 0; i < settings.segments; i++) {
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, settings.materials.fabric[i % 2]);
    mesh.position.x = (awningWidth / settings.segments) * i;
    mesh.position.z = meshZ;
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  }

  return g;
}

export function awning({ settings, hole }: IAwning) {
  const awningWidth = hole.width - settings.left - settings.right;
  const awningCenter = (settings.left - settings.right) / 2;
  const awningY = hole.y + hole.height / 2 - settings.top;
  const meshZ = 0.02;

  settings.materials.alu = settings.materials.alu || settings.materials.default;
  settings.materials.fabric = settings.materials.fabric || [
    settings.materials.default
  ];

  const g = new THREE.Group();

  const shape = awningFabric({ settings, hole });
  g.add(shape);

  const bottommesh = new THREE.Mesh(
    new THREE.BoxGeometry(awningWidth, 0.02, 0.02),
    settings.materials.alu
  );
  bottommesh.position.x = awningWidth / 2;
  bottommesh.position.y = -settings.height + 0.01;
  bottommesh.position.z = meshZ + settings.depth - 0.02;
  bottommesh.castShadow = true;
  g.add(bottommesh);

  const boxmesh = new THREE.Mesh(
    new THREE.BoxGeometry(awningWidth, 0.08, 0.08),
    settings.materials.alu
  );
  boxmesh.position.x = awningWidth / 2;
  boxmesh.position.y = 0.04;
  boxmesh.position.z = 0.04;
  boxmesh.castShadow = true;
  g.add(boxmesh);

  const sidemesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.02, settings.depth + meshZ),
    settings.materials.alu
  );
  sidemesh1.position.x = awningWidth - 0.01;
  sidemesh1.position.y = -settings.height + 0.01;
  sidemesh1.position.z = settings.depth / 2;
  sidemesh1.castShadow = true;
  g.add(sidemesh1);

  const sidemesh2 = sidemesh1.clone();
  sidemesh2.position.x = 0.02;
  g.add(sidemesh2);

  g.position.x = hole.x + (awningCenter - awningWidth / 2);
  g.position.z = settings.z;
  g.position.y = awningY;

  return {
    shape: g
  };
}

export function retractableAwning({ settings, hole }: IAwning) {
  const awningWidth = hole.width - settings.left - settings.right;
  const awningCenter = (settings.left - settings.right) / 2;
  const awningY = hole.y + hole.height / 2 - settings.top;

  settings.materials.alu = settings.materials.alu || settings.materials.default;
  settings.materials.fabric = settings.materials.fabric || [
    settings.materials.default
  ];

  const meshZ = 0.02;

  const g = new THREE.Group();

  const boxmesh = new THREE.Mesh(
    new THREE.BoxGeometry(awningWidth, 0.08, 0.08),
    settings.materials.alu
  );
  boxmesh.position.x = awningWidth / 2;
  boxmesh.position.y = 0.04;
  boxmesh.position.z = 0.04;
  boxmesh.castShadow = true;
  g.add(boxmesh);

  const sidemeshvert1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, settings.height + meshZ, 0.02),
    settings.materials.alu
  );
  sidemeshvert1.position.z = meshZ - 0.01;
  sidemeshvert1.position.x = awningWidth - 0.01;
  sidemeshvert1.position.y = -settings.height / 2;
  sidemeshvert1.castShadow = true;
  g.add(sidemeshvert1);

  const sidemeshvert2 = sidemeshvert1.clone();
  sidemeshvert2.position.x = 0.01;
  g.add(sidemeshvert2);

  const sidemeshGroup = new THREE.Group();
  sidemeshGroup.position.x = 0;
  sidemeshGroup.position.y = -settings.height;
  sidemeshGroup.position.z = 0.01;

  const sidemesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.02, settings.height + meshZ),
    settings.materials.alu
  );
  sidemesh1.rotation.x = THREE.MathUtils.degToRad(-90);
  sidemesh1.position.x = awningWidth - 0.01;
  sidemesh1.position.y = settings.height / 2;
  sidemesh1.castShadow = true;

  const sidemesh2 = sidemesh1.clone();
  sidemesh2.position.x = 0.01;

  const bottommesh = new THREE.Mesh(
    new THREE.BoxGeometry(awningWidth, 0.02, 0.02),
    settings.materials.alu
  );
  bottommesh.position.x = awningWidth / 2;
  bottommesh.position.y = settings.height + meshZ;
  bottommesh.position.z = 0;
  bottommesh.castShadow = true;

  sidemeshGroup.add(bottommesh);
  sidemeshGroup.add(sidemesh1);
  sidemeshGroup.add(sidemesh2);
  sidemeshGroup.rotation.x = THREE.MathUtils.degToRad(settings.opened);

  g.add(sidemeshGroup);

  let bottompos = new THREE.Vector3();
  bottommesh.getWorldPosition(bottompos);
  const fabricDepth = new THREE.Vector3(
    bottompos.x,
    bottompos.y,
    meshZ
  ).distanceTo(bottompos);
  const fabricHeight = new THREE.Vector3(
    bottompos.x,
    0,
    bottompos.z
  ).distanceTo(bottompos);

  settings.depth = fabricDepth;
  settings.height = fabricHeight;

  const shape = awningFabric({ settings, hole });

  g.add(shape);

  g.position.x = hole.x + (awningCenter - awningWidth / 2);
  g.position.z = settings.z;
  g.position.y = awningY;

  return { shape: g };
}
