///

"main": "index.html",
"scripts": {
  "start": "parcel index.html --open",
  "build": "parcel build index.html"
},


////

const squarefloor = {
  height: 40,
  materials: {
    floor: floorMaterial
  },
  sides: [
    {
      start: new THREE.Vector3(0, 0, 200),
      holes: []
    },
    {
      start: new THREE.Vector3(400, 0, 200),
      holes: []
    },
    {
      start: new THREE.Vector3(400, 0, -200),
      holes: []
    },
    {
      start: new THREE.Vector3(0, 0, -200)
    }
  ]
};
const offsquarefloor = {
  height: 400,
  sides: [
    {
      start: new THREE.Vector3(0, 0, 200),
      width: 400,
      angle: 90,
      holes: []
    },
    {
      width: 400,
      angle: 80,
      holes: []
    },
    {
      width: 400,
      angle: 90,
      holes: []
    },
    {}
  ]
};
const hexafloor = {
  height: 400,
  sides: [
    {
      start: new THREE.Vector3(0, 0, 200),
      width: 400,
      angle: 60,
      holes: []
    },
    {
      width: 400,
      angle: 60,
      holes: []
    },
    {
      width: 400,
      angle: 60,
      holes: []
    },
    {
      width: 400,
      angle: 60,
      holes: []
    },
    {
      width: 400,
      angle: 60,
      holes: []
    },
    {}
  ]
};

function addSubCubes() {
  const geometry = new BoxGeometry(1, 1, 1);
  root = new Operation(geometry, gridMat);

  const geometry2 = new BoxGeometry(1, 1, 1);
  const box2 = new Operation(geometry2, gridMat);
  box2.position.x = 0.5;
  box2.position.y = 0.5;
  box2.position.z = 0.1;
  box2.operation = SUBTRACTION;

  root.add(box2);

  if (result) {
    result.geometry.dispose();
    result.parent.remove(result);
  }

  result = csgEvaluator.evaluateHierarchy(root);
  result.material = gridMat;

  // result.toNonIndexed();
  scene.add(result);
}
//addSubCubes();
function addCubes() {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  const geometry2 = new BoxGeometry(1, 1, 1);
  const material2 = new MeshBasicMaterial({ color: 0xff0000 });
  const cube2 = new Mesh(geometry2, material2);
  cube2.position.set(0.5, 0.5, 0.1);
  scene.add(cube2);
}
//addCubes();
function addWall() {
  root = new Operation(new BoxBufferGeometry(1000, 1500, 50), gridMat);
  // root.position.y = 5;
  {
    const hole = new Operation(
      new CylinderBufferGeometry(50, 50, 100, 20),
      gridMat
    );
    hole.operation = SUBTRACTION;
    hole.position.y = 100;
    hole.rotateX(Math.PI / 2);

    const hole2 = new Operation(new BoxBufferGeometry(100, 200, 100), gridMat);
    hole2.operation = SUBTRACTION;

    const doorGroup = new OperationGroup();
    doorGroup.add(hole, hole2);
    doorGroup.position.x = 300;
    doorGroup.position.y = hole2.positionFromGround(0);
    root.add(doorGroup);
    // transformControls.attach(doorGroup);
  }

  wallHole(120, 180, -300, 200);
  wallHole(120, 180, -300, 500);
  //windowHole(1.5, 2, -3, 3);
  renderOutput();
  //result.position.z = 5;
}

function drawLines() {
  let model = scene;
  let gs = [];
  let nm = new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });
  model.traverse((node) => {
    if (node.isMesh) {
      node.material = nm;
      node.updateMatrixWorld();
      gs.push(node.geometry.clone().applyMatrix4(node.matrixWorld));
    }
  });
  let flb = new FatLinesBatch(gs);
  flb.items.forEach((it, idx) => {
    flb.setColorAt(idx, 0x000000);
  });
  flb.material.linewidth = 1;
  flb.update();
  //model.scale.setScalar(5);
  model.add(flb);
  //scene.add(model);

  let gui = new GUI();
  let props = {
    thresholdAngle: 0
  };
  flb.thresholdAngle.value = MathUtils.degToRad(props.thresholdAngle);

  gui.add(flb.material, "linewidth", 1, 5).step(1).name("linewidth (px)");
  gui
    .add(props, "thresholdAngle", 0, 180)
    .name("thresholdAngle (deg)")
    .onChange((value) => {
      flb.thresholdAngle.value = MathUtils.degToRad(value);
    });
}

//drawLines();

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(
  obj: THREE.Mesh,
  point: THREE.Vector3,
  axis: THREE.Vector3,
  theta: number,
  pointIsWorld: boolean
) {
  pointIsWorld = pointIsWorld === undefined ? false : pointIsWorld;

  if (obj && obj.parent) {
    if (pointIsWorld) {
      obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
      obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
  }
}

// Line renderer
const renderPass = new RenderPass(scene, camera);

let useComposer = ""; //"PencilLinesPass",
let composer: EffectComposer;
let edgesHelper: EdgesHelper;

if (useComposer !== "") {
  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);

  if (useComposer === "PencilLinesPass") {
    const pencilLinePass = new PencilLinesPass({
      width: renderer.domElement.clientWidth,
      height: renderer.domElement.clientHeight,
      scene,
      camera
    });
    composer.addPass(pencilLinePass);
  }
}

// helpers
edgesHelper = new EdgesHelper();
edgesHelper.color.set(0xe91e63).convertSRGBToLinear();
scene.add(edgesHelper);

if (useComposer) {
  composer.render();
} else {
  renderer.render(scene, camera);
}

//////
