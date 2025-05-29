import * as THREE from "three";
import chroma from "chroma-js";

function lerp(start: number, end: number, value: number) {
  return (1 - value) * start + value * end;
}

function rescale(
  value: number,
  srcRange: [number, number],
  dstRange: [number, number]
) {
  const [dstMin, dstMax] = dstRange;
  const [srcMin, srcMax] = srcRange;

  if (srcMin == srcMax) {
    return dstMin;
  }

  const scale = (value - srcMin) / (srcMax - srcMin);
  return scale * (dstMax - dstMin) + dstMin;
}

function interpolate(scale: number[], value: number) {
  const count = scale.length - 1;
  const low = Math.max(Math.floor(count * value), 0) | 0;
  const high = Math.min(Math.ceil(count * value), count) | 0;
  return lerp(
    scale[low],
    scale[high],
    rescale(value, [low / count, high / count], [0, 1])
  );
}

function ThreeHex(hex: string) {
  var color = new THREE.Color(hex);
  return color.getHex();
}

const dayLight = () => {
  const showHelpers = false;
  const output = document.querySelector("#timeofday");

  let sunmooncolors = chroma.scale([
    0x31a2ff,
    0x31a2ff,
    0xffffff,
    0x31a2ff,
    0x31a2ff
  ]);
  const suncolors = chroma
    .scale([
      "#31A2FF",
      "#7338BD",
      "#FFC5B8",
      "#FFEBB8",
      "#FFCE84",
      "#FF7ECC",
      "#31A2FF"
    ])
    .domain([0, 0.23, 0.37, 0.48, 0.86, 0.93, 1]);

  // const suncolors = chroma.scale(["#FFEBB8"]);
  const mooncolors = chroma
    .scale([
      "#FFCE84",
      "#FF7ECC",
      "#31A2FF",
      "#31A2FF",
      "#7338BD",
      "#FFC5B8",
      "#FFEBB8"
    ])
    .domain([0.86, 0.93, 1, 0, 0.23, 0.37, 0.48]);
  /*
  
  
  */

  const sunGroup = new THREE.Group();
  sunGroup.position.set(0, 7, 0);

  const moonGroup = new THREE.Group();
  moonGroup.position.set(0, -7, 0);

  const sun = new THREE.DirectionalLight(0xff0000, 1);

  const sunSphere = new THREE.Mesh(new THREE.SphereGeometry(0.5));
  sunSphere.position.set(0, 50, 20);
  sunGroup.add(sunSphere);

  const suncentersphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2));
  sunGroup.add(suncentersphereMesh);

  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(2048);
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = sun.shadow.mapSize.width;
  sun.shadow.camera.near = 0.5; // default
  sun.shadow.camera.far = 100; // default
  sun.shadow.bias = -0.00005; //1e-5;
  sun.shadow.normalBias = 0.02; //1e-2;

  const sunShadowCam = sun.shadow.camera;
  sunShadowCam.left = sunShadowCam.bottom = -10;
  sunShadowCam.right = sunShadowCam.top = 10;
  sunShadowCam.updateProjectionMatrix();

  const moon = new THREE.DirectionalLight(0xffffff, 1);

  const moonSphere = new THREE.Mesh(new THREE.SphereGeometry(0.2));
  moonSphere.position.set(2, -50, 20);
  moonGroup.add(moonSphere);

  const centersphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2));
  moonGroup.add(centersphereMesh);

  moon.castShadow = true;
  // moon.shadow.mapSize.setScalar(1024);
  moon.shadow.mapSize.width = sun.shadow.mapSize.width;
  moon.shadow.mapSize.height = sun.shadow.mapSize.height;
  moon.shadow.camera.near = sun.shadow.camera.near; // default
  moon.shadow.camera.far = sun.shadow.camera.far; // default
  moon.shadow.bias = sun.shadow.bias;
  moon.shadow.normalBias = sun.shadow.normalBias;

  const moonShadowCam = moon.shadow.camera;
  moonShadowCam.left = moonShadowCam.bottom = sunShadowCam.left;
  moonShadowCam.right = moonShadowCam.top = sunShadowCam.right;
  moonShadowCam.updateProjectionMatrix();

  const skycolors = chroma.scale([0xaaaaaa, 0xffeeb1, 0xaaaaaa]);
  const groundcolors = chroma.scale([0xffcf73, 0x080820, 0xffcf73]);

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  //sunGroup.add(sun);

  let sunHelper: THREE.DirectionalLightHelper;
  let moonHelper: THREE.DirectionalLightHelper;

  const render = (scene: THREE.Scene) => {
    scene.add(sun);
    scene.add(moon);
    // scene.add(sunTarget);
    // sun.target = sunTarget;
    scene.add(sunGroup);
    scene.add(moonGroup);
    scene.add(hemisphereLight);

    if (showHelpers) {
      moonHelper = new THREE.DirectionalLightHelper(moon, 0.1);
      scene.add(moonHelper);
      sunHelper = new THREE.DirectionalLightHelper(sun, 0.1);
      scene.add(sunHelper);

      const sunshadowhelper = new THREE.CameraHelper(sun.shadow.camera);
      scene.add(sunshadowhelper);
    }
  };
  const setTime = ({ hour = 1, minutes = 0 }) => {
    const timeofday = (hour * 60 + minutes) / (24 * 60);
    console.log("timeofday", timeofday);
    if (output) {
      output.innerHTML = hour + ":" + minutes;
    }
    const sunbrightness = interpolate([0, 0, 0, 1, 1, 1, 1, 0, 0], timeofday);
    const moonbrightness = interpolate([1, 1, 0, 0, 0, 0, 0, 0, 1], timeofday);

    //sun.color.setHex(0xffffff);
    sun.color.setHex(ThreeHex(suncolors(timeofday).hex()));
    sun.intensity = sunbrightness; //directColors[1];

    moon.color.setHex(ThreeHex(mooncolors(0).hex()));
    moon.intensity = moonbrightness; ///directColors[1];

    const skybrightness = interpolate(
      [0.1, 0.1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.1],
      timeofday
    );

    let hemiColors = [
      skycolors(timeofday).hex(),
      0xffffff, //groundcolors(timeofday).hex(),
      skybrightness / 4
    ];
    hemisphereLight.color.setHex(ThreeHex(hemiColors[0]));
    hemisphereLight.groundColor.setHex(hemiColors[1]);
    hemisphereLight.intensity = hemiColors[2];

    sunShadowCam.updateProjectionMatrix();

    sunGroup.rotation.z = THREE.MathUtils.degToRad(timeofday * 360 - 180);
    moonGroup.rotation.z = THREE.MathUtils.degToRad(timeofday * 360 - 180);
    // sun.position.copy(sphereMesh.position.clone());
    //sunGroup.rotation.x = THREE.MathUtils.degToRad(10);
    // sun.target.position.set(0, 0, 0);
    // console.log(
    //   "getWorldPosition",
    //   sphereMesh.getWorldPosition(new THREE.Vector3())
    // );
    sun.position.copy(sunSphere.getWorldPosition(new THREE.Vector3()));
    moon.position.copy(moonSphere.getWorldPosition(new THREE.Vector3()));

    // sun.position.z = 2000 * Math.sin(timeofday) + 0;
    // sphereMesh.position.x = Math.cos(timeofday * 10) * 50;
    // sphereMesh.position.y = Math.cos(timeofday * 7) * 3;
    // sphereMesh.position.z = Math.cos(timeofday * 8) * 40;

    if (showHelpers) {
      sunHelper.parent.updateMatrixWorld();
      sunHelper.update();
      moonHelper.parent.updateMatrixWorld();
      moonHelper.update();
    }
  };
  const setAutoUpdate = (autoUpdate: boolean) => {
    sun.shadow.autoUpdate = autoUpdate;
    moon.shadow.autoUpdate = autoUpdate;
  };
  return { render, setTime, setAutoUpdate };
};
export default dayLight;
