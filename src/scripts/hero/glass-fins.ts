/**
 * Glass fins: tonelabs' beams rebuilt in glass. The same tilted slats with
 * wavering edges, but each is a curved fin of glass with a narrow gap to the
 * next. Light behind the fins is refracted through them (undistorted in the
 * gaps), each fin has crisp edges and a fainter inner line for thickness,
 * slow glints slide along the crests, and the trailing face disperses into
 * a thin, muted coloured fringe. Rendered 1-bit with a
 * screen-anchored Bayer 8×8 threshold, bone on obsidian, like tonelabs.
 */
import { runAmbient } from "./loop";

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uCells;     // field size in dither cells
uniform float uTime;
uniform float uFins;     // number of fins across the diagonal
uniform float uBend;     // refraction strength, in fin widths
uniform float uMask;     // 1: tonelabs-style fade away from the text
uniform float uSpeed;    // overall motion speed
uniform float uHeader;   // header height, in cells
uniform vec3 uAccent;    // the dispersion fringe colour
uniform vec3 uBase;      // the field (obsidian)
uniform vec3 uLight;     // the glass's light (bone)
out vec4 outColor;

const float FIN = 0.7;                     // fin width; the rest is gap
const float FROST = 0.06;                  // faint grain in the glass
const float PI = 3.14159265;

const float BAYER[64] = float[64](
  0., 32., 8., 40., 2., 34., 10., 42., 48., 16., 56., 24., 50., 18., 58., 26.,
  12., 44., 4., 36., 14., 46., 6., 38., 60., 28., 52., 20., 62., 30., 54., 22.,
  3., 35., 11., 43., 1., 33., 9., 41., 51., 19., 59., 27., 49., 17., 57., 25.,
  15., 47., 7., 39., 13., 45., 5., 37., 63., 31., 55., 23., 61., 29., 53., 21.);

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
        mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
        mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

// The light behind the glass: soft drifting glow plus a faint regular
// dot lattice, so refraction has structure to bend.
float backdrop(vec2 p, float t) {
  float glow = noise3(vec3(p * 0.022, t * 0.05)) * 0.75
             + noise3(vec3(p * 0.06 + 31.0, t * 0.09)) * 0.25;
  glow = smoothstep(0.25, 0.85, glow);
  vec2 g = fract(p / 5.0) - 0.5;
  float lattice = 1.0 - smoothstep(0.12, 0.3, length(g));
  return glow * (0.35 + 0.65 * lattice);
}

void main() {
  vec2 cell = floor(vec2(gl_FragCoord.x, uCells.y - gl_FragCoord.y));
  vec2 c = cell - uCells * 0.5;
  // Tonelabs' beam frame: tilted 30°.
  vec2 dirU = vec2(0.8660254, 0.5);
  float u = dot(c, dirU);
  float v = -c.x * 0.5 + c.y * 0.8660254;
  float span = length(uCells) / uFins;
  float t = uTime * uSpeed;

  float raw = u / span;
  float index = floor(raw);
  float wave = (noise3(vec3(v * 0.012, index * 3.7, t * 0.35)) - 0.5) * 0.5;
  float a = fract(raw + wave);

  float threshold = (BAYER[int(mod(cell.y, 8.0)) * 8 + int(mod(cell.x, 8.0))] + 0.5) / 64.0;
  float mask = 1.0;
  if (uMask > 0.5) {
    // Away from the name (left); running up under the header and thinning
    // gradually toward the top edge (as on tonelabs), and fading out toward
    // the section below.
    float top = smoothstep(0.0, uHeader * 2.4, cell.y);
    mask = smoothstep(0.22, 0.68, cell.x / uCells.x)
         * top * top
         * (1.0 - smoothstep(0.72, 1.0, cell.y / uCells.y));
  }

  vec3 color = uBase;

  // A narrow gap between fins shows the light behind, undistorted: seeing
  // it straight beside bent is what reads as glass.
  if (a > FIN) {
    float plain = backdrop(cell, t) * 0.5 * mask;
    if (plain > threshold) color = mix(color, uLight, 0.16);
    outColor = vec4(color, 1.0);
    return;
  }

  float f = a / FIN;                    // 0..1 across the fin
  float cellUnit = 1.0 / (span * FIN);  // one cell, in fin units
  float thick = sin(f * PI);
  float slope = cos(f * PI);

  // Refraction: the fin's curve bends the light behind it sideways.
  float body = backdrop(cell + dirU * slope * span * uBend, t);

  // A crisp line on both faces, and a fainter inner line: the glass's
  // thickness. Fresnel brightens the glass toward its edges.
  float outer = 1.0 - smoothstep(0.0, 1.6 * cellUnit, min(f, 1.0 - f));
  float inner = (1.0 - smoothstep(0.0, 1.2 * cellUnit, abs(f - 5.0 * cellUnit))) * 0.55;
  float fresnel = pow(1.0 - thick, 3.0);
  // Occasional glints sliding slowly along the crest.
  float slide = noise3(vec3(index * 5.1, v * 0.008 - t * 0.3, t * 0.08));
  float glint = smoothstep(0.7, 0.95, slide) * pow(thick, 12.0);
  // Dispersion: a thin sea-glass line just inside the trailing face.
  float fringe = 1.0 - smoothstep(0.0, 1.5 * cellUnit, abs(f - (1.0 - 3.0 * cellUnit)));

  float edge = clamp((outer * 0.9 + inner + glint * 0.8) * mask, 0.0, 1.0);
  float tint = clamp((body * (0.35 + 0.25 * thick) + FROST + fresnel * 0.18) * mask, 0.0, 1.0);

  if (edge > threshold) {
    color = mix(color, uLight, 0.45);     // glass edges and glints
  } else if (fringe * mask * 0.7 > threshold) {
    color = mix(color, uAccent, 0.5);   // a muted coloured fringe
  } else if (tint > threshold) {
    color = mix(color, uLight, 0.18);     // light seen through the glass
  }
  outColor = vec4(color, 1.0);
}`;

type Rgb = readonly [number, number, number];

const OBSIDIAN: Rgb = [0.075, 0.067, 0.086];
const BONE: Rgb = [0.965, 0.925, 0.867];
const SEA_GLASS: Rgb = [0.42, 0.62, 0.66];

export interface GlassFinsOptions {
  cellPx?: number;
  fins?: number;
  bend?: number;
  mask?: boolean;
  speed?: number;
  /** Fringe colour as 0–1 RGB. */
  accent?: Rgb;
}

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function mountGlassFins(
  canvas: HTMLCanvasElement,
  {
    cellPx = 4,
    fins = 5,
    bend = 0.55,
    mask = true,
    speed = 0.15,
    accent = SEA_GLASS,
  }: GlassFinsOptions = {},
): void {
  const gl = canvas.getContext("webgl2", { antialias: false });
  if (!gl) return;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uCells = u("uCells");
  const uTime = u("uTime");
  const uHeader = u("uHeader");
  gl.uniform1f(u("uFins"), fins);
  gl.uniform1f(u("uBend"), bend);
  gl.uniform1f(u("uMask"), mask ? 1 : 0);
  gl.uniform1f(u("uSpeed"), speed);
  gl.uniform3f(u("uAccent"), ...accent);
  gl.uniform3f(u("uBase"), ...OBSIDIAN);
  gl.uniform3f(u("uLight"), ...BONE);

  runAmbient(
    canvas,
    {
      resize() {
        // Render one pixel per dither cell; CSS scales it up crisp.
        const width = Math.max(1, Math.ceil(canvas.clientWidth / cellPx));
        const height = Math.max(1, Math.ceil(canvas.clientHeight / cellPx));
        if (canvas.width === width && canvas.height === height) return;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uCells, width, height);
        gl.uniform1f(uHeader, (5.5 * 16) / cellPx);
      },
      draw(time) {
        gl.uniform1f(uTime, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    },
    { fps: 30, stillTime: 14 },
  );
}
