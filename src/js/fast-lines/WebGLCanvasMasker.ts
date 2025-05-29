class WebGLCanvasMasker {
  constructor(pixels, w, h, rf, printDiagnostics) {
    this.pixels = pixels;
    this.w = w;
    this.h = h;
    this.rf = rf;
    this.printDiagnostics = printDiagnostics;

    if (this.printDiagnostics) console.log("Initializing WebGL canvas masker");

    this.canvas = document.createElement("canvas");
    const gl = this.canvas.getContext("webgl2");
    this.gl = gl;
    const ext = gl.getExtension("EXT_color_buffer_float");
    if (!ext) throw "need EXT_color_buffer_float";

    this.program = createProgramFromSources(gl, [vertexShader, fragmentShader]);
    gl.useProgram(this.program);

    this.lPosition = gl.getAttribLocation(this.program, "a_position");
    this.lImg = gl.getUniformLocation(this.program, "u_img");
    this.lCoords = gl.getUniformLocation(this.program, "u_coords");
    this.lColors = gl.getUniformLocation(this.program, "u_colors");
    this.lInputSz = gl.getUniformLocation(this.program, "u_input_sz");
    this.lCanvasSz = gl.getUniformLocation(this.program, "u_canvas_sz");
    this.lFrame = gl.getUniformLocation(this.program, "u_frame");
    this.lSegLen = gl.getUniformLocation(this.program, "u_seg_len");
    this.lRF = gl.getUniformLocation(this.program, "u_rf");

    // Create position buffer - these will be our vertex attributes
    this.bufPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPosition);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1, // first triangle
        1,
        -1,
        -1,
        1,
        -1,
        1, // second triangle
        1,
        -1,
        1,
        1
      ]),
      gl.STATIC_DRAW
    );

    // Upload pixels into image texture
    this.txImage = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.txImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w * rf,
      h * rf,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  mask(lines, frame, segLen, maxIters = 32) {
    const calcStart = new Date();
    if (this.printDiagnostics)
      console.log("Calculating " + lines.length + " lines");

    const res = [];
    let toCheck = [];
    for (const ln of lines) {
      // No clue why, but if we get too large values here, the shader fails and no lines are returned as visible
      const lim = 500_000;
      if (
        ln.pt1.x > lim ||
        ln.pt1.x < -lim ||
        ln.pt1.y > lim ||
        ln.pt1.y < -lim
      )
        continue;
      if (
        ln.pt2.x > lim ||
        ln.pt2.x < -lim ||
        ln.pt2.y > lim ||
        ln.pt2.y < -lim
      )
        continue;
      toCheck.push(ln);
    }
    let iters = 0;
    while (toCheck.length > 0 && iters < maxIters) {
      let viss = this.maskOnce(toCheck, frame, segLen);
      let checkNext = [];
      for (const vl of viss) {
        res.push([vl[0], vl[1]]);
        const edge = toCheck[vl[2]];
        checkNext.push({
          pt1: vl[1].clone(),
          pt2: edge.pt2.clone(),
          clr1: edge.clr1,
          clr2: edge.clr2
        });
      }
      toCheck = checkNext;
      ++iters;
    }

    if (this.printDiagnostics) {
      let elapsed = new Date() - calcStart;
      console.log("Kept " + res.length + " lines");
      let sec = Math.floor(elapsed / 1000);
      let ms = elapsed - sec * 1000;
      console.log("Elapsed: " + sec.toString() + "." + ms.toString());
    }

    return res;
  }

  maskOnce(lines, frame, segLen) {
    const gl = this.gl;

    // Input and target textures
    let texWidth = Math.ceil(Math.sqrt(lines.length));
    let texHeight = Math.ceil(lines.length / texWidth);
    this.canvas.width = texWidth;
    this.canvas.height = texHeight;
    gl.viewport(0, 0, texWidth, texHeight);

    if (this.printDiagnostics)
      console.log("Data texture: " + texWidth + " x " + texHeight);

    // Data for coordinates and colors texture
    const coordsData = [],
      colorsData = [];
    for (const ln of lines) {
      coordsData.push(ln.pt1.x, ln.pt1.y, ln.pt2.x, ln.pt2.y);
      verifyRGBVals([
        ln.clr1.r,
        ln.clr1.g,
        ln.clr1.b,
        ln.clr2.r,
        ln.clr2.g,
        ln.clr2.b
      ]);
      const clrX = ln.clr1.r * 256 + ln.clr1.g;
      const clrY = ln.clr1.b * 256 + ln.clr2.r;
      const clrZ = ln.clr2.g * 256 + ln.clr2.b;
      colorsData.push(clrX, clrY, clrZ, 0);
    }
    while (coordsData.length < texWidth * texHeight * 4) coordsData.push(0);
    while (colorsData.length < texWidth * texHeight * 4) colorsData.push(0);

    function verifyRGBVals(vals) {
      for (const val of vals) {
        if (val < 0 || val > 255) throw "RGB value out of 0..255 range";
        if (val != Math.round(val)) throw "RGB value not integer";
      }
    }

    // Create textures
    const txTarget = createTexture(null);
    const txCoords = createTexture(coordsData);
    const txColors = createTexture(colorsData);

    function createTexture(data) {
      const tex = gl.createTexture();
      let arr = null;
      if (data) arr = new Float32Array(data);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0, // mip level
        gl.RGBA32F, // format
        texWidth, // width
        texHeight, // height
        0, // border
        gl.RGBA, // format
        gl.FLOAT, // type
        arr // data
      );
      // We don't need any filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      // Unbind texture!
      gl.bindTexture(gl.TEXTURE_2D, null);
      // Done
      return tex;
    }

    // Render to target texture
    const frameBuf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      txTarget,
      0
    );

    // Put image texture on texture unit 0; tell shader to use it
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, this.txImage);
    gl.uniform1i(this.lImg, 0);

    // Put coords texture on texture unit 1; tell shader to use it
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, txCoords);
    gl.uniform1i(this.lCoords, 1);

    // Put colors texture on texture unit 2; tell shader to use it
    gl.activeTexture(gl.TEXTURE0 + 2);
    gl.bindTexture(gl.TEXTURE_2D, txColors);
    gl.uniform1i(this.lColors, 2);

    // Non-texture uniforms
    gl.uniform2f(this.lCanvasSz, this.w, this.h);
    gl.uniform2f(this.lInputSz, texWidth, texHeight);
    if (frame) gl.uniform4f(this.lFrame, ...frame);
    else gl.uniform4f(this.lFrame, 0, 0, this.w, this.h);
    gl.uniform1f(this.lSegLen, segLen);
    gl.uniform1f(this.lRF, this.rf);

    // Render a square (two triangles / 6 vertices for full image)
    gl.bindVertexArray(null);
    gl.enableVertexAttribArray(this.lPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPosition);
    gl.vertexAttribPointer(this.lPosition, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Fetch target texture data
    let targetData = new Float32Array(texWidth * texHeight * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);
    gl.readPixels(0, 0, texWidth, texHeight, gl.RGBA, gl.FLOAT, targetData);

    // const res = [];
    // for (let i = 0; i != lines.length; ++i) {
    //   const j = i * 4;
    //   res.push([lines[i].pt1, targetData[j], targetData[j+1], targetData[j+2]])
    // }
    // return res;

    const visibleLines = [];
    for (let i = 0; i != lines.length; ++i) {
      const j = i * 4;
      const pt1 = new paper.Point(targetData[j], targetData[j + 1]);
      const pt2 = new paper.Point(targetData[j + 2], targetData[j + 3]);
      if (pt1.x == 0 && pt1.y == 0 && pt2.x == 0 && pt2.y == 0) continue;
      visibleLines.push([pt1, pt2, i]);
    }
    return visibleLines;
  }
}

const vertexShader = `#version 300 es
precision highp float;
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0, 1.);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
uniform sampler2D u_img;
uniform sampler2D u_coords;
uniform sampler2D u_colors;
uniform vec2 u_canvas_sz;
uniform vec2 u_input_sz;
uniform vec4 u_frame;
uniform float u_seg_len;
uniform float u_rf;
out vec4 outColor;
#define PI 3.1415926538
#define PIFOURTH 0.7853981635
bool clrEq(vec3 a, vec3 b) {
  float maxDiff = abs(a.r - b.r);
  maxDiff = max(maxDiff, abs(a.g - b.g));
  maxDiff = max(maxDiff, abs(a.b - b.b));
  return maxDiff < 0.01;
}
vec3 getColor(vec2 pt) {
  pt.y = u_canvas_sz.y - pt.y;
  return texture(u_img, pt / u_canvas_sz).rgb;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_input_sz;
  vec4 txCoords = texture(u_coords, uv);
  vec4 txColors = texture(u_colors, uv);
  // Colors 1 and 2 in RGB 0..255
  float r1 = floor(txColors.x / 256.);
  float g1 = txColors.x - r1 * 256.;
  float b1 = floor(txColors.y / 256.);
  float r2 = txColors.y - b1 * 256.;
  float g2 = floor(txColors.z / 256.);
  float b2 = txColors.z - g2 * 256.;
  vec3 clr1 = vec3(r1, g1, b1);
  vec3 clr2 = vec3(r2, g2, b2);
  clr1 /= 256.;
  clr2 /= 256.;
   
  vec2 pt1 = vec2(txCoords[0], txCoords[1]);
  vec2 pt2 = vec2(txCoords[2], txCoords[3]);
  vec2 delta = pt2 - pt1;
  float len = length(delta);
  float nSegs = max(2., floor(len / u_seg_len) + 1.);
  
  // vec2 orto = vec2(-delta.y, delta.x) / len / u_rf;
  vec2 orto = vec2(-delta.y, delta.x) / len * 1.8;
  mat2 mDiag = mat2(cos(PIFOURTH), -sin(PIFOURTH), sin(PIFOURTH), cos(PIFOURTH));
  vec2 diag1 = mDiag * (vec2(-delta.y, delta.x) / len * 1.8);
  vec2 diag2 = vec2(-diag1.y, diag1.x);
  vec2 pt, firstVisible, lastVisible;
  bool gotFirstVisible = false;
  
  for (float i = 0.; i <= nSegs + 0.5; i += 1.) {
    pt = pt1 + delta * i / nSegs;
    // if (pt.x < 0. || pt.x > u_canvas_sz.x) continue;
    // if (pt.y < 0. || pt.y > u_canvas_sz.y) continue;
    if (pt.x < u_frame.x || pt.x > u_frame.x + u_frame.z) continue;
    if (pt.y < u_frame.y || pt.y > u_frame.y + u_frame.w) continue;
    vec3 clrHere = getColor(pt);
    
    bool isVisible = clrEq(clrHere, clr1);
    if (!isVisible) isVisible = clrEq(clrHere, clr2);
    if (!isVisible) {
      clrHere = getColor(pt + orto);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    if (!isVisible) {
      clrHere = getColor(pt - orto);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    if (!isVisible) {
      clrHere = getColor(pt + diag1);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    if (!isVisible) {
      clrHere = getColor(pt - diag1);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    if (!isVisible) {
      clrHere = getColor(pt + diag2);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    if (!isVisible) {
      clrHere = getColor(pt - diag2);
      isVisible = clrEq(clrHere, clr1);
      if (!isVisible) isVisible = clrEq(clrHere, clr2);
    }
    
    if (isVisible) {
      lastVisible = pt;
      if (!gotFirstVisible) {
        firstVisible = pt;
        gotFirstVisible = true;
      }
    }
    else if (gotFirstVisible) {
      float visibleLen = length(lastVisible - firstVisible);
      if (visibleLen > u_seg_len) break;
      gotFirstVisible = false;
    }
  }
  
  // // DBG: keep all inputs
  // float fullLen = length(pt2 - pt1);
  // if (fullLen > u_seg_len) outColor = vec4(pt1, pt2);
  // else outColor = vec4(0.);
  // return;
  
  if (!gotFirstVisible) outColor = vec4(0.);
  else {
    float visibleLen = length(lastVisible - firstVisible);
    if (visibleLen > u_seg_len) outColor = vec4(firstVisible, lastVisible);
    else outColor = vec4(0.);
  }
}
`;

// WebGL shader loader taken from WebGL 2 Fundamentals
// ============================================================================
/*
 * Copyright 2021, GFXFundamentals.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of GFXFundamentals. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
function createProgram(
  gl,
  shaders,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  const errFn = opt_errorCallback || error;
  const program = gl.createProgram();
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib
      );
    });
  }
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    errFn(
      `Error in program linking: ${lastError}\n${shaders
        .map((shader) => {
          const src = addLineNumbersWithError(gl.getShaderSource(shader));
          const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
          return `${glEnumToString(gl, type)}:\n${src}`;
        })
        .join("\n")}`
    );

    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Creates a program from 2 sources.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSourcess Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:webgl-utils
 */
function createProgramFromSources(
  gl,
  shaderSources,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  const shaders = [];
  for (let ii = 0; ii < shaderSources.length; ++ii) {
    shaders.push(
      loadShader(
        gl,
        shaderSources[ii],
        gl[defaultShaderType[ii]],
        opt_errorCallback
      )
    );
  }
  return createProgram(
    gl,
    shaders,
    opt_attribs,
    opt_locations,
    opt_errorCallback
  );
}

/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
  const errFn = opt_errorCallback || error;
  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    errFn(
      `Error compiling shader: ${lastError}\n${addLineNumbersWithError(
        shaderSource,
        lastError
      )}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Wrapped logging function.
 * @param {string} msg The message to log.
 */
function error(msg) {
  if (window.console) {
    if (window.console.error) {
      window.console.error(msg);
    } else if (window.console.log) {
      window.console.log(msg);
    }
  }
}

const errorRE = /ERROR:\s*\d+:(\d+)/gi;

function addLineNumbersWithError(src, log = "") {
  // Note: Error message formats are not defined by any spec so this may or may not work.
  const matches = [...log.matchAll(errorRE)];
  const lineNoToErrorMap = new Map(
    matches.map((m, ndx) => {
      const lineNo = parseInt(m[1]);
      const next = matches[ndx + 1];
      const end = next ? next.index : log.length;
      const msg = log.substring(m.index, end);
      return [lineNo - 1, msg];
    })
  );
  return src
    .split("\n")
    .map((line, lineNo) => {
      const err = lineNoToErrorMap.get(lineNo);
      return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ""}`;
    })
    .join("\n");
}

const defaultShaderType = ["VERTEX_SHADER", "FRAGMENT_SHADER"];

export { WebGLCanvasMasker };
