import { Float32BufferAttribute } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { EdgesGeometryExt } from "./EdgesGeometryExt";

function batchGeometries(geometries) {
  let colorIdx = [];
  let colorIdxStart = 0;
  let gs = geometries.map((g, idx) => {
    let ng = new EdgesGeometryExt(g);
    let instIdx = [];
    for (let i = 0; i < ng.attributes.position.count / 2; i++) {
      instIdx.push(idx);
    }
    ng.setAttribute("instIdx", new Float32BufferAttribute(instIdx, 1));
    let iil = instIdx.length;
    colorIdx.push([colorIdxStart, iil]);
    colorIdxStart += iil;
    return ng;
  });
  let fg = BufferGeometryUtils.mergeBufferGeometries(gs);
  fg.userData.colorIdx = colorIdx;
  return fg;
}
export { batchGeometries };
