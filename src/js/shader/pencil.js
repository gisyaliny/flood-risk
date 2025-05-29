import * as THREE from "three";

const pencil = () => {
  // Define the shader uniforms
  let uniforms = {
    u_time: {
      type: "f",
      value: 0.0
    },
    u_frame: {
      type: "f",
      value: 0.0
    },
    u_resolution: {
      type: "v2",
      value: new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ).multiplyScalar(window.devicePixelRatio)
    },
    u_mouse: {
      type: "v2",
      value: new THREE.Vector2(
        0.7 * window.innerWidth,
        window.innerHeight
      ).multiplyScalar(window.devicePixelRatio)
    }
  };

  // Create the shader material
  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("pencil-vertexShader").textContent,
    fragmentShader: document.getElementById("pencil-fragmentShader")
      .textContent,
    side: THREE.DoubleSide,
    transparent: true,
    extensions: {
      derivatives: true
    }
  });

  return material;
};

export default pencil;
