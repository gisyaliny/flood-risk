import {
  Color,
  DataTexture,
  FloatType,
  InstancedBufferAttribute,
  Object3D,
  RGBAFormat
} from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry";
import * as Utils from "../js/geometries/Utils";

class FatLinesBatch extends LineSegments2 {
  constructor(geometries) {
    super();
    this.thresholdAngle = { value: 0 };
    let edges = Utils.batchGeometries(geometries);
    this.colorIdx = edges.userData.colorIdx;
    let g = new LineSegmentsGeometry();
    g.setPositions(edges.attributes.position.array);
    g.setColors(
      new Float32Array(edges.attributes.position.array.length).fill(1)
    );
    g.setAttribute(
      "normal0",
      new InstancedBufferAttribute(edges.attributes.normal0.array, 3)
    );
    g.setAttribute(
      "normal1",
      new InstancedBufferAttribute(edges.attributes.normal1.array, 3)
    );
    g.setAttribute(
      "instIndex",
      new InstancedBufferAttribute(edges.attributes.instIdx.array, 1)
    );
    let m = new LineMaterial({
      linewidth: 0.05,
      worldUnits: false,
      vertexColors: true,
      alphaToCoverage: true,
      polygonOffset: true,
      polygonOffsetFactor: -10,
      onBeforeCompile: (shader) => {
        shader.uniforms.uMediator = this.uMediator;
        shader.uniforms.thresholdAngle = this.thresholdAngle;
        shader.vertexShader = `
          uniform sampler2D uMediator;
          uniform float thresholdAngle;
          attribute float instIndex;
          attribute vec3 normal0;
          attribute vec3 normal1;
          varying float vInstDiscard;
          ${shader.vertexShader}
        `
          .replace(
            `// camera space`,
            `// camera space
          vec4 row0 = texelFetch(uMediator, ivec2(0, int(instIndex)), 0);
          vec4 row1 = texelFetch(uMediator, ivec2(1, int(instIndex)), 0);
          vec4 row2 = texelFetch(uMediator, ivec2(2, int(instIndex)), 0);
          vec4 row3 = texelFetch(uMediator, ivec2(3, int(instIndex)), 0);
          mat4 instMatrix = mat4(row0, row1, row2, row3);
          `
          )
          .replaceAll(
            `= modelViewMatrix * vec4( instance`,
            `= modelViewMatrix * instMatrix * vec4( instance`
          )
          .replace(
            `#include <fog_vertex>`,
            `#include <fog_vertex>
            
            vec3 mp = (instanceStart + instanceEnd) / 2.;
            vec3 cp0 = mp + cross(normal0, normalize(instanceEnd - instanceStart));
            vec3 cp1 = mp + cross(normal1, normalize(instanceEnd - instanceStart));

            vec4 midEdge = projectionMatrix * modelViewMatrix * instMatrix * vec4(mp, 1.);
            vec4 c0edge = projectionMatrix * modelViewMatrix * instMatrix * vec4(cp0, 1.);
            vec4 c1edge = projectionMatrix * modelViewMatrix * instMatrix * vec4(cp1, 1.);

            vec2 me = midEdge.xy / midEdge.w;
            vec2 c0 = c0edge.xy / c0edge.w;
            vec2 c1 = c1edge.xy / c1edge.w;

            c0 = normalize(c0 - me);
            c1 = normalize(c1 - me);

            vec2 mdir = normalize(vec2(-dir.y, dir.x));

            float d0 = dot(mdir, c0);
            float d1 = dot(mdir, c1);

            bool type5  = sign( d0 ) != sign( d1 );
            bool threshold = dot(normal0, normal1) <= cos(thresholdAngle);

            vInstDiscard = float(type5 || threshold);
            `
          );
        //console.log(shader.vertexShader);
        shader.fragmentShader = `
            varying float vInstDiscard;
            ${shader.fragmentShader}
        `.replace(
          `#include <premultiplied_alpha_fragment>`,
          `#include <premultiplied_alpha_fragment>
            float instDiscard = vInstDiscard;
            if (instDiscard < 0.5) discard;
            
          `
        );
        //console.log(shader.fragmentShader);
      }
    });
    this.items = new Array(geometries.length).fill().map((_) => {
      return new Object3D();
    });

    this.geometry = g;
    this.material = m;

    let mediatorWidth = 4;
    let mediatorHeight = geometries.length;
    let mediator = new DataTexture(
      new Float32Array(mediatorWidth * mediatorHeight * 4),
      mediatorWidth,
      mediatorHeight,
      RGBAFormat,
      FloatType
    );
    this.uMediator = { value: mediator };

    this.update = () => {
      this.items.forEach((o, idx) => {
        o.updateMatrix();
        this.uMediator.value.image.data.set(o.matrix.elements, idx * 16);
      });
      this.uMediator.value.needsUpdate = true;
      this.material.resolution.set(window.innerWidth, window.innerHeight);
    };

    let _c = new Color();
    this.setColorAt = (idx, color) => {
      _c.set(color);
      let cStart = this.geometry.attributes["instanceColorStart"];
      let cEnd = this.geometry.attributes["instanceColorEnd"];
      let cIdx = this.colorIdx[idx];
      let cIdxStart = cIdx[0];
      let cIdxLength = cIdx[1];
      for (let i = cIdxStart; i < cIdxStart + cIdxLength; i++) {
        cStart.setXYZ(i, _c.r, _c.g, _c.b);
        cEnd.setXYZ(i, _c.r, _c.g, _c.b);
      }
      cStart.needsUpdate = true;
      cEnd.needsUpdate = true;
    };
  }
}
export { FatLinesBatch };
