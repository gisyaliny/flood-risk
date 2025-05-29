import * as THREE from "three";
import toonVertexShader from "./toon.vert";
import toonFragmentShader from "./toon.frag";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

export const toonmaterial_toarrayerror = new THREE.ShaderMaterial({
  uniforms: {
    ...THREE.UniformsLib.lights,
    uGlossiness: {
      value: 20
    },
    uColor: {
      value: new THREE.Color("#ff0000")
    }
  },

  vertexShader: toonVertexShader,

  fragmentShader: toonFragmentShader
});

// export const bouncingMaterial = THREE.extendMaterial(
//   THREE.MeshStandardMaterial,
//   {
//     class: THREE.CustomMaterial, // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

//     vertexHeader: "uniform float offsetScale;",
//     vertex: {
//       transformEnd: "transformed += normal * offsetScale;"
//     },

//     uniforms: {
//       roughness: 0.75,
//       offsetScale: {
//         mixed: true, // Uniform will be passed to a derivative material (MeshDepthMaterial below)
//         linked: true, // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
//         value: 0
//       }
//     }
//   }
// );

// export const toonMaterial = THREE.ShaderMaterial.extend(
//   THREE.MeshMatcapMaterial,
//   {
//     //       // Will be prepended to vertex and fragment code

//     //       header: 'varying vec3 vNN; varying mat3 NM; varying vec3 vEye;',

//     //       // Insert code lines by hinting at a existing

//     //       vertex: {
//     //         // Inserts the line after #include <fog_vertex>
//     //         '#include <fog_vertex>': `
//     //           vNN = normalize(transformedNormal);
//     //           NM = normalMatrix;
//     //           vEye = normalize(transformed-cameraPosition);`
//     //       },
//     //       fragment: {
//     //         'gl_FragColor = vec4( outgoingLight, diffuseColor.a );' : 'gl_FragColor.rgb += diffuseColor.rgb * pow(1.0 - abs(dot(normalize(NM*vEye), vNN )), 2.5) * 2.0;'
//     //       },

//     material: {
//       lights: false,
//       side: THREE.DoubleSide,
//       color: 0xcc4444
//     }
//     // Uniforms (will be applied to existing or added)

//     // uniforms: {
//     //   diffuse: new THREE.Color('orange')
//     // }
//   }
// );

export class ToonShaderMaterial_error extends THREE.ShaderMaterial {
  constructor({ color = "#fff" }: { color: string }) {
    super({
      lights: true,
      uniforms: {
        ...THREE.UniformsLib.lights,
        uGlossiness: {
          value: 20
        },
        uColor: {
          value: new THREE.Color(color)
        }
      }
    });

    this.vertexShader = toonVertexShader;
    this.fragmentShader = toonFragmentShader;
  }
}
