import "./styles.css";
import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { FatLinesBatch } from "./js/FatLinesBatch";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//console.clear();

import setData, { IHouseFloor, IHouseSide } from "./house";
import {
  awning,
  retractableAwning,
  balcony,
  balconydoor,
  wallRailing,
  shuttersWithFrame,
  plant,
  hangingLights,
  bulbLight
} from "./shapes/shapes";

import {
  windowMaterial,
  wallMaterial,
  pavementMaterial,
  colors,
  groundMaterial,
  backgroundMaterial,
  floorMaterial
} from "./materials";

import dayLight from "./daylight";

const settings = {
  isNight: true
};

let scene = new THREE.Scene();
if (settings.isNight) {
  colors.background = 0x000000;
}
scene.background = new THREE.Color(colors.background);

const isocamera = false;

let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
let cameraSettings = {
  position: new THREE.Vector3(),
  lookAt: new THREE.Vector3(),
  fov: 45
};

if (isocamera) {
  const aspect = window.innerWidth / window.innerHeight;
  const d = 20;
  camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    1,
    4000
  );

  camera.position.set(20, 20, 20);
  camera.rotation.order = "YXZ";
  camera.rotation.y = -Math.PI / 4;
  camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
} else {
  let cameraPositionFront = {
    fov: 25,
    position: new THREE.Vector3(0, 2, 60),
    lookAt: new THREE.Vector3(0, 0, 0)
  };
  let cameraPositionAngled = {
    fov: 45,
    position: new THREE.Vector3(15, 15, 20),
    lookAt: new THREE.Vector3(0, 5, 0)
  };
  let cameraPositionISO = {
    fov: 15,
    position: new THREE.Vector3(50, 20, 50),
    lookAt: new THREE.Vector3(0, 0, 0)
  };
  cameraSettings = cameraPositionAngled;
  camera = new THREE.PerspectiveCamera(
    cameraSettings.fov,
    window.innerWidth / window.innerHeight,
    1,
    9000
  );
  camera.position.copy(cameraSettings.position);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor("#eee");
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;

//deferred rendering,
// renderer.toneMappingExposure = 1.75;
// renderer.shadowMap.autoUpdate = false;
// renderer.shadowMap.needsUpdate = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// progressive lightmap

document.body.appendChild(renderer.domElement);

window.addEventListener("resize", (event) => {
  //camera.aspect = window.innerWidth / window.innerHeight;
  //camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.target = cameraSettings.lookAt;

// const plane2 = new THREE.Mesh(
//   // new THREE.PlaneGeometry(5000, 5000),
//   new THREE.CylinderGeometry(2, 2, 1, 32),
//   wallMaterial
// );
// plane2.position.set(0, 2, 0);
// plane2.castShadow = true;
// scene.add(plane2);

const box = new THREE.Mesh(
  // new THREE.PlaneGeometry(5000, 5000),
  new THREE.BoxGeometry(2, 5, 2),
  wallMaterial
);
box.position.set(0, 2.5, 0);
box.castShadow = true;
scene.add(box);

//scene.add(bulbLight(-100, 900, 100));

const groupPlane = new THREE.Mesh(
  new THREE.CylinderGeometry(10, 10, 0.1, 32),
  groundMaterial
);
groupPlane.position.y = -0.1;
groupPlane.receiveShadow = true;
scene.add(groupPlane);

const lights = dayLight();
lights.render(scene);

let hour = 8;
let minutes = 0;
function updatetime() {
  // plane2.position.set(Math.random() * 100, 200, 0);
  lights.setTime({ hour: hour, minutes: minutes });

  minutes += 1;
  if (minutes >= 60) {
    minutes = 0;
    hour += 1;
    if (hour >= 24) {
      hour = 0;
    }
  }
  setTimeout(updatetime, 10);
}
updatetime();
// setTimeout(updatetime, 1000);

function animate() {
  requestAnimationFrame(animate);
  // setTimeout(animate, 200);
  controls.update();

  //edgesHelper.setEdges(csgEvaluator.debug.intersectionEdges);
  //edgesHelper.visible = true;

  renderer.render(scene, camera);
  // renderer.shadowMap.needsUpdate = false;
}

animate();
