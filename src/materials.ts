import {
  Clock,
  Color,
  MathUtils,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  WebGLRenderer,
  BoxBufferGeometry,
  CylinderBufferGeometry,
  Mesh,
  DirectionalLight,
  AmbientLight,
  RawShaderMaterial,
  DoubleSide,
  Vector2,
  Vector3,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial
} from "three";

import crosshatchMaterial from "./js/shader/pencil.js";
import stripedCutoutMaterial from "./js/shader/stripes.js";
// import {
//   ToonShaderMaterial_error,
//   custommaterial,
//   toonmaterial_toarrayerror
// } from "./js/ToonShaderMaterial";

const normalMaterial = new MeshNormalMaterial();
const standartMaterial = new MeshStandardMaterial({ color: 0x666666 });
const lambert = new MeshLambertMaterial({ color: "#fff" });
const phongMaterial = new MeshPhongMaterial({ color: 0x0908ef });
function toonMaterial() {
  const uniforms = {
    u_time: { type: "f", value: 0.0 },
    u_resolution: { type: "v3", value: new Vector2() },
    u_mouse: { type: "v2", value: new Vector2() },
    u_lightDirection: { type: "v3", value: new Vector3(1.0, 1.0, 1.0) },
    u_globalColor: { type: "v3", value: new Vector3(1.0, 1.0, 1.0) },
    u_gradient: { type: "f,", value: 3.0 },
    u_inflate: { type: "f", value: 0.0 },
    u_isEdge: { type: "i", value: true }
  };

  const material = new RawShaderMaterial({
    vertexShader: document.querySelector("#js-vertex-shader").textContent,
    fragmentShader: document.querySelector("#js-fragment-shader").textContent,
    wireframe: false,
    transparent: true,
    uniforms: uniforms,
    flatShading: true,
    side: DoubleSide
  });

  return material;
}

//着色器材质
// let fishShaderMaterial = new THREE.ShaderMaterial({
//   uniforms: {
//     light: { type: "v3", value: directionalLight.position },
//     color: {
//       // 方块的基础色
//       type: "v3", // 指定变量类型为三维向量
//       value: new THREE.Color("#1308EF")
//     }
//   },
//   vertexShader: document.getElementById("fish-vertexShader").textContent,
//   fragmentShader: document.getElementById("fish-fragmentShader").textContent,
//   side: THREE.FrontSide,
//   blending: THREE.AdditiveBlending,
//   transparent: true
// });

const colors = {
  ground: 0x333333,
  pavement: 0x999999,
  background: 0xffffff,
  wall: 0xff9999, //0xf4e4d5,
  window: 0x333333,
  alu: 0x111111,
  white: 0xffffff,
  awening: 0x0000ff,
  wood: 0xffffff,
  floor: 0x864427,
  roof: 0x330000,
  green: 0x008833
};

let bulbMaterial = new MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0
});
let bulbMaterialOn = new MeshLambertMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 1
});
let plantMaterial = new MeshStandardMaterial({
  color: colors.green,
  metalness: 0,
  roughness: 0.5
});
let groundMaterial = new MeshStandardMaterial({
  color: colors.ground
});
let pavementMaterial = new MeshStandardMaterial({ color: colors.pavement });
let backgroundMaterial = new MeshStandardMaterial({ color: colors.background });
let roofMaterial = new MeshLambertMaterial({
  color: colors.roof,
  side: DoubleSide
});
let floorMaterial = new MeshLambertMaterial({
  color: colors.floor,
  side: DoubleSide
});
let windowMaterial = new MeshStandardMaterial({ color: colors.window });
let wallMaterial = new MeshLambertMaterial({
  color: colors.wall,
  side: DoubleSide
});
let aluMaterial = new MeshStandardMaterial({
  color: colors.alu,
  metalness: 0,
  roughness: 0.5
});
let aweningMaterial = new MeshStandardMaterial({
  color: colors.awening,
  metalness: 0,
  roughness: 1
});
let aweningMaterial2 = new MeshStandardMaterial({
  color: colors.white,
  metalness: 0,
  roughness: 1
});
let woodMaterial = new MeshStandardMaterial({
  color: colors.wood,
  metalness: 0,
  roughness: 0.5
});

export {
  colors,
  lambert,
  normalMaterial,
  standartMaterial,
  crosshatchMaterial,
  stripedCutoutMaterial,
  phongMaterial,
  toonMaterial,
  windowMaterial,
  wallMaterial,
  aluMaterial,
  aweningMaterial,
  aweningMaterial2,
  woodMaterial,
  floorMaterial,
  roofMaterial,
  backgroundMaterial,
  groundMaterial,
  pavementMaterial,
  plantMaterial,
  bulbMaterial,
  bulbMaterialOn
};
