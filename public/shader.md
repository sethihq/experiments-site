# GLSL Shader Development Skill

This skill provides comprehensive guidance for creating GLSL fragment shaders based on The Book of Shaders and Inigo Quilez's techniques.

---

## GLSL Fundamentals

### Basic Shader Structure
```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width, height)
uniform vec2 u_mouse;       // Mouse position in pixels
uniform float u_time;       // Time in seconds since load

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;  // Normalize coordinates 0-1
    vec3 color = vec3(0.0);

    // Shader logic here

    gl_FragColor = vec4(color, 1.0);
}
```

### Data Types
- `float` - Single floating point value (ALWAYS use decimal: `1.0` not `1`)
- `vec2` - 2D vector (x,y or s,t or r,g)
- `vec3` - 3D vector (x,y,z or r,g,b)
- `vec4` - 4D vector (x,y,z,w or r,g,b,a)
- `mat2`, `mat3`, `mat4` - 2x2, 3x3, 4x4 matrices
- `sampler2D` - 2D texture sampler

### Swizzling
Access and rearrange vector components:
```glsl
vec4 color = vec4(1.0, 0.5, 0.0, 1.0);
vec3 rgb = color.rgb;      // Get first 3 components
vec2 rg = color.xy;        // Same as color.rg
vec3 bgr = color.bgr;      // Swapped order
color.rg = vec2(0.5);      // Assign to specific components
```

---

## Essential GLSL Functions

### Shaping Functions
```glsl
step(edge, x)              // Returns 0.0 if x < edge, else 1.0
smoothstep(e0, e1, x)      // Smooth interpolation between edges
mix(a, b, t)               // Linear interpolation: a*(1-t) + b*t
clamp(x, min, max)         // Constrain x between min and max
fract(x)                   // Fractional part of x
mod(x, y)                  // Modulo operation
floor(x)                   // Round down to integer
ceil(x)                    // Round up to integer
abs(x)                     // Absolute value
sign(x)                    // Returns -1, 0, or 1
min(a, b)                  // Minimum of a and b
max(a, b)                  // Maximum of a and b
```

### Math Functions
```glsl
pow(x, y)                  // x raised to power y
exp(x)                     // e^x
log(x)                     // Natural logarithm
sqrt(x)                    // Square root
inversesqrt(x)             // 1/sqrt(x) - faster than dividing
```

### Trigonometric Functions
```glsl
sin(x), cos(x), tan(x)     // Trig functions (radians)
asin(x), acos(x), atan(x)  // Inverse trig
atan(y, x)                 // Two-argument atan (full angle)
radians(deg)               // Degrees to radians
degrees(rad)               // Radians to degrees
```

### Vector Functions
```glsl
length(v)                  // Vector magnitude
distance(p1, p2)           // Distance between points
dot(a, b)                  // Dot product
cross(a, b)                // Cross product (vec3 only)
normalize(v)               // Unit vector
reflect(I, N)              // Reflection vector
refract(I, N, eta)         // Refraction vector
faceforward(N, I, Nref)    // Flip normal if facing away
```

---

## Shaping Techniques

### Creating Curves
```glsl
// Exponential curves
float y = pow(x, 2.0);     // Quadratic (steeper)
float y = pow(x, 0.5);     // Square root (gentler)

// Smooth step variations
float y = x * x * (3.0 - 2.0 * x);           // Smoothstep formula
float y = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);  // Smoother

// Sine-based animation
float y = sin(x * 3.14159);                   // Half wave
float y = abs(sin(x * 3.14159));              // Bouncing ball
float y = fract(sin(x) * 10000.0);            // Pseudo-random
```

### Drawing Lines
```glsl
// Horizontal line at y = 0.5
float line = smoothstep(0.0, 0.01, abs(st.y - 0.5));

// Vertical line at x = 0.5
float line = smoothstep(0.0, 0.01, abs(st.x - 0.5));

// Diagonal line y = x
float line = smoothstep(0.0, 0.01, abs(st.y - st.x));

// Function plot
float y = sin(st.x * 6.28);
float line = smoothstep(0.0, 0.02, abs(st.y - y));
```

---

## Color Techniques

### RGB to HSB Conversion
```glsl
vec3 rgb2hsb(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);  // Cubic smoothing
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

### Color Mixing
```glsl
vec3 colorA = vec3(1.0, 0.0, 0.0);  // Red
vec3 colorB = vec3(0.0, 0.0, 1.0);  // Blue
vec3 mixed = mix(colorA, colorB, st.x);  // Gradient left to right

// Rainbow using HSB
vec3 rainbow = hsb2rgb(vec3(st.x, 1.0, 1.0));
```

### Polar Color Wheel
```glsl
vec2 toCenter = vec2(0.5) - st;
float angle = atan(toCenter.y, toCenter.x);
float radius = length(toCenter) * 2.0;

// Map angle to hue, radius to saturation
vec3 color = hsb2rgb(vec3((angle / 6.2831) + 0.5, radius, 1.0));
```

---

## Drawing Shapes

### Rectangle
```glsl
float rect(vec2 st, vec2 size) {
    vec2 bl = step(vec2(0.5) - size/2.0, st);       // Bottom-left
    vec2 tr = step(st, vec2(0.5) + size/2.0);       // Top-right
    return bl.x * bl.y * tr.x * tr.y;
}

// Rounded rectangle using SDF
float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
```

### Circle
```glsl
float circle(vec2 st, float radius) {
    vec2 dist = st - vec2(0.5);
    return 1.0 - smoothstep(radius - 0.01, radius + 0.01, dot(dist, dist) * 4.0);
}

// Using SDF
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}
```

### Polygon
```glsl
float polygon(vec2 st, int sides) {
    st = st * 2.0 - 1.0;
    float a = atan(st.x, st.y) + 3.14159;
    float r = 6.28319 / float(sides);
    return cos(floor(0.5 + a/r) * r - a) * length(st);
}
```

---

## 2D Signed Distance Functions (SDFs)

### Basic 2D Shapes
```glsl
// Circle
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// Box
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Rounded Box
float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x = (p.y > 0.0) ? r.x : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

// Line Segment
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

// Equilateral Triangle
float sdEquilateralTriangle(vec2 p, float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}

// Regular Pentagon
float sdPentagon(vec2 p, float r) {
    const vec3 k = vec3(0.809016994, 0.587785252, 0.726542528);
    p.x = abs(p.x);
    p -= 2.0 * min(dot(vec2(-k.x, k.y), p), 0.0) * vec2(-k.x, k.y);
    p -= 2.0 * min(dot(vec2(k.x, k.y), p), 0.0) * vec2(k.x, k.y);
    p -= vec2(clamp(p.x, -r * k.z, r * k.z), r);
    return length(p) * sign(p.y);
}

// Regular Hexagon
float sdHexagon(vec2 p, float r) {
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
    return length(p) * sign(p.y);
}

// Star
float sdStar(vec2 p, float r, int n, float m) {
    float an = 3.141593 / float(n);
    float en = 3.141593 / m;
    vec2 acs = vec2(cos(an), sin(an));
    vec2 ecs = vec2(cos(en), sin(en));
    float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
    p = length(p) * vec2(cos(bn), abs(sin(bn)));
    p -= r * acs;
    p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
    return length(p) * sign(p.x);
}

// Heart
float sdHeart(vec2 p) {
    p.x = abs(p.x);
    if (p.y + p.x > 1.0)
        return sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    return sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
                    dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

// Ellipse (approximation)
float sdEllipse(vec2 p, vec2 ab) {
    p = abs(p);
    if (p.x > p.y) { p = p.yx; ab = ab.yx; }
    float l = ab.y * ab.y - ab.x * ab.x;
    float m = ab.x * p.x / l;
    float n = ab.y * p.y / l;
    float m2 = m * m, n2 = n * n;
    float c = (m2 + n2 - 1.0) / 3.0;
    float c3 = c * c * c;
    float q = c3 + m2 * n2 * 2.0;
    float d = c3 + m2 * n2;
    float g = m + m * n2;
    float co;
    if (d < 0.0) {
        float h = acos(q / c3) / 3.0;
        float s = cos(h);
        float t = sin(h) * sqrt(3.0);
        float rx = sqrt(-c * (s + t + 2.0) + m2);
        float ry = sqrt(-c * (s - t + 2.0) + m2);
        co = (ry + sign(l) * rx + abs(g) / (rx * ry) - m) / 2.0;
    } else {
        float h = 2.0 * m * n * sqrt(d);
        float s = sign(q + h) * pow(abs(q + h), 1.0/3.0);
        float u = sign(q - h) * pow(abs(q - h), 1.0/3.0);
        float rx = -s - u - c * 4.0 + 2.0 * m2;
        float ry = (s - u) * sqrt(3.0);
        float rm = sqrt(rx * rx + ry * ry);
        co = (ry / sqrt(rm - rx) + 2.0 * g / rm - m) / 2.0;
    }
    vec2 r = ab * vec2(co, sqrt(1.0 - co * co));
    return length(r - p) * sign(p.y - r.y);
}

// Arc
float sdArc(vec2 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    return ((sc.y * p.x > sc.x * p.y) ? length(p - sc * ra) : abs(length(p) - ra)) - rb;
}

// Bezier Curve (Quadratic)
float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
    vec2 a = B - A;
    vec2 b = A - 2.0 * B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float kk = 1.0 / dot(b, b);
    float kx = kk * dot(a, b);
    float ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
    float kz = kk * dot(d, a);
    float res = 0.0;
    float p = ky - kx * kx;
    float p3 = p * p * p;
    float q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    float h = q * q + 4.0 * p3;
    if (h >= 0.0) {
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x) * pow(abs(x), vec2(1.0/3.0));
        float t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        res = dot(d + (c + b * t) * t, d + (c + b * t) * t);
    } else {
        float z = sqrt(-p);
        float v = acos(q / (p * z * 2.0)) / 3.0;
        float m = cos(v);
        float n = sin(v) * 1.732050808;
        vec3 t = clamp(vec3(m + m, -n - m, n - m) * z - kx, 0.0, 1.0);
        res = min(dot(d + (c + b * t.x) * t.x, d + (c + b * t.x) * t.x),
                  dot(d + (c + b * t.y) * t.y, d + (c + b * t.y) * t.y));
    }
    return sqrt(res);
}
```

### SDF Operations
```glsl
// Union (combine shapes)
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

// Subtraction (cut out)
float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}

// Intersection
float opIntersection(float d1, float d2) {
    return max(d1, d2);
}

// Smooth Union
float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Smooth Subtraction
float opSmoothSubtraction(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
}

// Smooth Intersection
float opSmoothIntersection(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) + k * h * (1.0 - h);
}

// Rounding
float opRound(float d, float r) {
    return d - r;
}

// Annular (ring/outline)
float opOnion(float d, float r) {
    return abs(d) - r;
}
```

### Rendering SDFs
```glsl
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = st * 2.0 - 1.0;  // Center coordinates
    st.x *= u_resolution.x / u_resolution.y;  // Aspect ratio correction

    float d = sdCircle(st, 0.5);

    // Solid shape
    vec3 color = vec3(1.0 - step(0.0, d));

    // With smooth edge
    vec3 color = vec3(1.0 - smoothstep(0.0, 0.01, d));

    // Outline only
    vec3 color = vec3(1.0 - smoothstep(0.0, 0.01, abs(d) - 0.02));

    // Glow effect
    vec3 color = vec3(0.02 / abs(d));

    gl_FragColor = vec4(color, 1.0);
}
```

---

## 2D Transformations

### Translation
```glsl
vec2 translate(vec2 st, vec2 offset) {
    return st - offset;
}
```

### Rotation
```glsl
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));
}

// Usage: rotate around center
vec2 st_rotated = rotate2d(u_time) * (st - 0.5) + 0.5;
```

### Scaling
```glsl
mat2 scale2d(vec2 s) {
    return mat2(s.x, 0.0,
                0.0, s.y);
}

// Usage: scale from center
vec2 st_scaled = scale2d(vec2(2.0)) * (st - 0.5) + 0.5;
```

---

## Pattern Generation

### Basic Tiling
```glsl
// Create 3x3 grid of repeating pattern
vec2 st = fract(st * 3.0);

// Offset every other row (brick pattern)
float row = floor(st.y * 3.0);
st.x += mod(row, 2.0) * 0.5;
st = fract(st * 3.0);
```

### Truchet Tiles
```glsl
vec2 tile(vec2 st, float zoom) {
    st *= zoom;
    return fract(st);
}

float truchetPattern(vec2 st, float index) {
    index = fract((index - 0.5) * 2.0);
    if (index > 0.75) {
        st = vec2(1.0) - st;
    } else if (index > 0.5) {
        st = vec2(1.0 - st.x, st.y);
    } else if (index > 0.25) {
        st = 1.0 - vec2(1.0 - st.x, st.y);
    }
    return st.x;
}
```

### Mirror Repeat
```glsl
vec2 mirrorRepeat(vec2 st, float n) {
    st *= n;
    vec2 f = fract(st);
    vec2 i = floor(st);
    // Mirror on odd tiles
    f = mix(f, 1.0 - f, mod(i, 2.0));
    return f;
}
```

---

## Randomness and Noise

### Pseudo-Random Function
```glsl
float random(float x) {
    return fract(sin(x) * 43758.5453123);
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)),
              dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}
```

### Value Noise
```glsl
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Cubic interpolation curve
    vec2 u = f * f * (3.0 - 2.0 * f);

    // Four corners
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Interpolate
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
```

### Gradient Noise (Perlin-style)
```glsl
float gnoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
```

### Simplex Noise
```glsl
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
```

---

## Fractional Brownian Motion (fBM)

### Basic fBM
```glsl
#define OCTAVES 6

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;      // Lacunarity
        amplitude *= 0.5;      // Gain/Persistence
    }
    return value;
}
```

### Turbulence (using abs)
```glsl
float turbulence(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * abs(snoise(st * frequency));
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

### Ridge Noise
```glsl
float ridge(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float prev = 1.0;

    for (int i = 0; i < OCTAVES; i++) {
        float n = abs(snoise(st * frequency));
        n = 1.0 - n;        // Invert for ridges
        n = n * n;          // Sharpen
        value += amplitude * n * prev;
        prev = n;
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

### Domain Warping
```glsl
float warpedFbm(vec2 st) {
    vec2 q = vec2(fbm(st + vec2(0.0, 0.0)),
                  fbm(st + vec2(5.2, 1.3)));

    vec2 r = vec2(fbm(st + 4.0 * q + vec2(1.7, 9.2)),
                  fbm(st + 4.0 * q + vec2(8.3, 2.8)));

    return fbm(st + 4.0 * r);
}
```

---

## Cellular Noise (Voronoi)

### Basic Cellular Noise
```glsl
float cellular(vec2 st) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float min_dist = 1.0;

    // Check 3x3 neighborhood
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_st + neighbor);
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);  // Animate
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            min_dist = min(min_dist, dist);
        }
    }
    return min_dist;
}
```

### Voronoi with Cell ID
```glsl
vec3 voronoi(vec2 st) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float min_dist = 1.0;
    vec2 min_point;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_st + neighbor);
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            if (dist < min_dist) {
                min_dist = dist;
                min_point = i_st + neighbor + point;
            }
        }
    }

    return vec3(min_dist, min_point);
}
```

### Voronoi Edges
```glsl
float voronoiEdges(vec2 st) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float min_dist = 1.0;
    float second_min_dist = 1.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_st + neighbor);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);

            if (dist < min_dist) {
                second_min_dist = min_dist;
                min_dist = dist;
            } else if (dist < second_min_dist) {
                second_min_dist = dist;
            }
        }
    }

    return second_min_dist - min_dist;  // Edge distance
}
```

---

## 3D Signed Distance Functions

### Basic 3D Primitives
```glsl
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdCylinder(vec3 p, float r, float h) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float sdCone(vec3 p, vec2 c, float h) {
    vec2 q = h * vec2(c.x / c.y, -1.0);
    vec2 w = vec2(length(p.xz), p.y);
    vec2 a = w - q * clamp(dot(w, q) / dot(q, q), 0.0, 1.0);
    vec2 b = w - q * vec2(clamp(w.x / q.x, 0.0, 1.0), 1.0);
    float k = sign(q.y);
    float d = min(dot(a, a), dot(b, b));
    float s = max(k * (w.x * q.y - w.y * q.x), k * (w.y - q.y));
    return sqrt(d) * sign(s);
}

float sdPyramid(vec3 p, float h) {
    float m2 = h * h + 0.25;
    p.xz = abs(p.xz);
    p.xz = (p.z > p.x) ? p.zx : p.xz;
    p.xz -= 0.5;
    vec3 q = vec3(p.z, h * p.y - 0.5 * p.x, h * p.x + 0.5 * p.y);
    float s = max(-q.x, 0.0);
    float t = clamp((q.y - 0.5 * p.z) / (m2 + 0.25), 0.0, 1.0);
    float a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
    float b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
    float d2 = min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : min(a, b);
    return sqrt((d2 + q.z * q.z) / m2) * sign(max(q.z, -p.y));
}

float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
}

float sdPlane(vec3 p, vec3 n, float h) {
    return dot(p, n) + h;
}
```

### 3D Transformations
```glsl
// Repetition (infinite)
float opRepetition(vec3 p, vec3 s) {
    vec3 q = p - s * round(p / s);
    return sdPrimitive(q);
}

// Limited repetition
float opLimitedRepetition(vec3 p, float s, vec3 l) {
    vec3 q = p - s * clamp(round(p / s), -l, l);
    return sdPrimitive(q);
}

// Twist
float opTwist(vec3 p, float k) {
    float c = cos(k * p.y);
    float s = sin(k * p.y);
    mat2 m = mat2(c, -s, s, c);
    vec3 q = vec3(m * p.xz, p.y);
    return sdPrimitive(q);
}

// Bend
float opBend(vec3 p, float k) {
    float c = cos(k * p.x);
    float s = sin(k * p.x);
    mat2 m = mat2(c, -s, s, c);
    vec3 q = vec3(m * p.xy, p.z);
    return sdPrimitive(q);
}

// Revolution (2D to 3D)
float opRevolution(vec3 p, float o) {
    vec2 q = vec2(length(p.xz) - o, p.y);
    return sd2DPrimitive(q);
}

// Extrusion (2D to 3D)
float opExtrusion(vec3 p, float h) {
    float d = sd2DPrimitive(p.xy);
    vec2 w = vec2(d, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}
```

---

## Ray Marching

### Basic Ray Marcher
```glsl
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001

float sceneSDF(vec3 p) {
    // Define your scene here
    float sphere = sdSphere(p - vec3(0.0, 1.0, 6.0), 1.0);
    float plane = p.y;
    return min(sphere, plane);
}

float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;

    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = sceneSDF(p);
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }

    return dO;
}

vec3 getNormal(vec3 p) {
    float d = sceneSDF(p);
    vec2 e = vec2(0.001, 0.0);
    vec3 n = d - vec3(
        sceneSDF(p - e.xyy),
        sceneSDF(p - e.yxy),
        sceneSDF(p - e.yyx)
    );
    return normalize(n);
}

float getLight(vec3 p) {
    vec3 lightPos = vec3(0.0, 5.0, 6.0);
    vec3 l = normalize(lightPos - p);
    vec3 n = getNormal(p);

    float diff = clamp(dot(n, l), 0.0, 1.0);

    // Shadow
    float d = rayMarch(p + n * SURF_DIST * 2.0, l);
    if (d < length(lightPos - p)) diff *= 0.1;

    return diff;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    vec3 ro = vec3(0.0, 1.0, 0.0);  // Ray origin (camera)
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));  // Ray direction

    float d = rayMarch(ro, rd);

    vec3 p = ro + rd * d;
    float diffuse = getLight(p);
    vec3 color = vec3(diffuse);

    gl_FragColor = vec4(color, 1.0);
}
```

---

## Textures

### Loading and Sampling
```glsl
uniform sampler2D u_tex0;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec4 texColor = texture2D(u_tex0, st);
    gl_FragColor = texColor;
}
```

### Texture Manipulation
```glsl
// Tiling
vec4 color = texture2D(u_tex0, fract(st * 3.0));

// Offset
vec4 color = texture2D(u_tex0, st + vec2(0.1, 0.2));

// Rotation
mat2 rot = rotate2d(0.5);
vec4 color = texture2D(u_tex0, rot * (st - 0.5) + 0.5);

// Distortion with noise
vec2 distorted = st + 0.1 * vec2(noise(st * 10.0), noise(st * 10.0 + 100.0));
vec4 color = texture2D(u_tex0, distorted);
```

---

## Animation Techniques

### Time-Based Animation
```glsl
// Oscillation
float y = sin(u_time);

// Pulsing
float pulse = (sin(u_time * 2.0) + 1.0) * 0.5;

// Easing (smooth start/stop)
float t = fract(u_time * 0.5);
float eased = t * t * (3.0 - 2.0 * t);

// Looping animation
float loop = mod(u_time, 2.0) / 2.0;
```

### Moving Shapes
```glsl
// Circular motion
vec2 center = vec2(
    0.5 + 0.3 * cos(u_time),
    0.5 + 0.3 * sin(u_time)
);

// Bouncing
float y = abs(sin(u_time * 3.0));

// Wave propagation
float wave = sin(length(st - 0.5) * 20.0 - u_time * 5.0);
```

---

## Common Shader Recipes

### Gradient Background
```glsl
vec3 color = mix(vec3(0.1, 0.2, 0.5), vec3(0.8, 0.4, 0.2), st.y);
```

### Plasma Effect
```glsl
float plasma = sin(st.x * 10.0 + u_time) +
               sin(st.y * 10.0 + u_time) +
               sin((st.x + st.y) * 10.0 + u_time) +
               sin(length(st - 0.5) * 10.0 - u_time);
vec3 color = vec3(sin(plasma), sin(plasma + 2.094), sin(plasma + 4.188)) * 0.5 + 0.5;
```

### Fire Effect
```glsl
float fire = fbm(vec2(st.x * 3.0, st.y * 2.0 - u_time * 2.0));
fire = fire * (1.0 - st.y);
vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), fire);
color = mix(vec3(0.0), color, step(0.1, fire));
```

### Water Ripples
```glsl
float ripple = sin(length(st - 0.5) * 50.0 - u_time * 5.0);
ripple *= smoothstep(0.5, 0.0, length(st - 0.5));
vec2 distorted = st + 0.02 * ripple * normalize(st - 0.5);
```

### Metaballs
```glsl
float metaballs(vec2 st) {
    float d = 0.0;
    for (int i = 0; i < 5; i++) {
        vec2 pos = vec2(
            0.5 + 0.3 * sin(u_time + float(i)),
            0.5 + 0.3 * cos(u_time * 1.3 + float(i) * 2.0)
        );
        d += 0.05 / length(st - pos);
    }
    return d;
}
```

---

## Performance Tips

1. **Avoid branching** - Use `step()`, `smoothstep()`, `mix()` instead of `if` statements
2. **Use `dot(v,v)` instead of `length(v)`** when only comparing distances
3. **Precompute constants** - Move calculations outside loops when possible
4. **Use `inversesqrt()` instead of `1.0/sqrt()`**
5. **Minimize texture lookups** - Cache results if sampling same location
6. **Use `lowp` precision when sufficient** - Especially for colors
7. **Reduce loop iterations** - Fewer octaves in fBM, fewer ray march steps

---

## Debugging Techniques

1. **Visualize values as colors**: `gl_FragColor = vec4(vec3(value), 1.0);`
2. **Check coordinate ranges**: Output `st` directly to verify normalization
3. **Step through components**: Isolate R, G, B channels
4. **Use gradient coloring**: Map values to rainbow for better visualization
5. **Check for NaN/Inf**: `isnan()`, `isinf()` functions

---

## React Three Fiber & Three.js Patterns

### Basic Shader Material Setup (R3F)
```jsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'

const MyShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uResolution: [0, 0],
    uMouse: [0, 0],
    uTexture: null,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec3 color = vec3(vUv.x, vUv.y, sin(uTime) * 0.5 + 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ MyShaderMaterial })

function ShaderMesh() {
  const materialRef = useRef()

  useFrame((state) => {
    materialRef.current.uTime = state.clock.elapsedTime
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <myShaderMaterial ref={materialRef} />
    </mesh>
  )
}
```

### Uniforms and Varyings
```glsl
// Vertex Shader - Pass data to fragment
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader - Receive varying data
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Use varying data for calculations
  vec3 color = vNormal * 0.5 + 0.5;  // Visualize normals
  gl_FragColor = vec4(color, 1.0);
}
```

---

## Render Targets & FBO Techniques

### Basic Render Target Setup
```jsx
import { useFBO } from '@react-three/drei'

function Effect() {
  const renderTarget = useFBO()

  useFrame((state) => {
    // Render scene to texture
    state.gl.setRenderTarget(renderTarget)
    state.gl.render(state.scene, state.camera)
    state.gl.setRenderTarget(null)

    // Use renderTarget.texture in materials
  })
}
```

### Portal/Window Effect with Render Targets
```glsl
// Render scene to texture, then sample with distortion
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Add distortion
  uv.x += sin(uv.y * 10.0 + uTime) * 0.02;
  uv.y += cos(uv.x * 10.0 + uTime) * 0.02;

  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}
```

### Ping-Pong Buffer (FBO Feedback)
```jsx
// For effects that need previous frame data
const fboA = useFBO()
const fboB = useFBO()
let currentFBO = fboA
let prevFBO = fboB

useFrame(() => {
  // Swap buffers
  [currentFBO, prevFBO] = [prevFBO, currentFBO]

  // Render with previous frame as input
  material.uniforms.uPrevFrame.value = prevFBO.texture
  gl.setRenderTarget(currentFBO)
  gl.render(scene, camera)
  gl.setRenderTarget(null)
})
```

---

## Post-Processing Effects

### Basic Post-Processing Setup (R3F)
```jsx
import { EffectComposer, ShaderPass } from '@react-three/postprocessing'

const customShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      // Apply effect
      gl_FragColor = color;
    }
  `
}
```

### Chromatic Aberration
```glsl
uniform sampler2D tDiffuse;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec2 direction = vUv - 0.5;
  float dist = length(direction);

  // Offset each color channel differently
  float rOffset = uIntensity * dist;
  float gOffset = 0.0;
  float bOffset = -uIntensity * dist;

  vec2 rUv = vUv + direction * rOffset;
  vec2 gUv = vUv + direction * gOffset;
  vec2 bUv = vUv + direction * bOffset;

  float r = texture2D(tDiffuse, rUv).r;
  float g = texture2D(tDiffuse, gUv).g;
  float b = texture2D(tDiffuse, bUv).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### Vignette Effect
```glsl
uniform sampler2D tDiffuse;
uniform float uIntensity;
uniform float uSmoothness;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  float dist = distance(vUv, vec2(0.5));
  float vignette = smoothstep(0.5, 0.5 - uSmoothness, dist * (1.0 + uIntensity));

  color.rgb *= vignette;
  gl_FragColor = color;
}
```

### Film Grain
```glsl
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  float grain = random(vUv + uTime) * uIntensity;
  color.rgb += grain - uIntensity * 0.5;

  gl_FragColor = color;
}
```

---

## Edge Detection & Outline Shaders

### Sobel Filter (Edge Detection)
```glsl
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uResolution;

  // Sample 3x3 neighborhood
  float tl = texture2D(tDiffuse, vUv + vec2(-texel.x, texel.y)).r;
  float t  = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).r;
  float tr = texture2D(tDiffuse, vUv + vec2(texel.x, texel.y)).r;
  float l  = texture2D(tDiffuse, vUv + vec2(-texel.x, 0.0)).r;
  float r  = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).r;
  float bl = texture2D(tDiffuse, vUv + vec2(-texel.x, -texel.y)).r;
  float b  = texture2D(tDiffuse, vUv + vec2(0.0, -texel.y)).r;
  float br = texture2D(tDiffuse, vUv + vec2(texel.x, -texel.y)).r;

  // Sobel kernels
  float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
  float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;

  float edge = sqrt(gx*gx + gy*gy);

  gl_FragColor = vec4(vec3(edge), 1.0);
}
```

### Moebius-Style Outline
```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform vec2 uResolution;
uniform float uOutlineThickness;
varying vec2 vUv;

float getDepth(vec2 uv) {
  return texture2D(tDepth, uv).r;
}

vec3 getNormal(vec2 uv) {
  return texture2D(tNormal, uv).rgb * 2.0 - 1.0;
}

void main() {
  vec2 texel = uOutlineThickness / uResolution;
  vec4 color = texture2D(tDiffuse, vUv);

  float depth = getDepth(vUv);
  float depthDiff = 0.0;

  // Sample neighbors for depth discontinuity
  depthDiff += abs(depth - getDepth(vUv + vec2(texel.x, 0.0)));
  depthDiff += abs(depth - getDepth(vUv + vec2(-texel.x, 0.0)));
  depthDiff += abs(depth - getDepth(vUv + vec2(0.0, texel.y)));
  depthDiff += abs(depth - getDepth(vUv + vec2(0.0, -texel.y)));

  // Normal-based edge detection
  vec3 normal = getNormal(vUv);
  float normalDiff = 0.0;
  normalDiff += distance(normal, getNormal(vUv + vec2(texel.x, 0.0)));
  normalDiff += distance(normal, getNormal(vUv + vec2(-texel.x, 0.0)));
  normalDiff += distance(normal, getNormal(vUv + vec2(0.0, texel.y)));
  normalDiff += distance(normal, getNormal(vUv + vec2(0.0, -texel.y)));

  float outline = step(0.1, depthDiff) + step(0.5, normalDiff);
  outline = clamp(outline, 0.0, 1.0);

  color.rgb = mix(color.rgb, vec3(0.0), outline);
  gl_FragColor = color;
}
```

---

## Dithering & Retro Effects

### Bayer Matrix Dithering
```glsl
uniform sampler2D tDiffuse;
uniform float uColorDepth;
varying vec2 vUv;

// 4x4 Bayer matrix
const mat4 bayerMatrix = mat4(
   0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
  12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
   3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
  15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

float getBayer(vec2 uv) {
  ivec2 pos = ivec2(mod(uv, 4.0));
  return bayerMatrix[pos.x][pos.y];
}

vec3 dither(vec3 color, vec2 fragCoord) {
  float threshold = getBayer(fragCoord);
  float levels = uColorDepth;

  // Quantize with dithering
  vec3 quantized = floor(color * levels + threshold) / levels;
  return quantized;
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  vec2 fragCoord = vUv * vec2(textureSize(tDiffuse, 0));

  color.rgb = dither(color.rgb, fragCoord);
  gl_FragColor = color;
}
```

### Color Quantization (Limited Palette)
```glsl
uniform sampler2D tDiffuse;
uniform float uLevels;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Quantize to limited color levels
  color.rgb = floor(color.rgb * uLevels + 0.5) / uLevels;

  gl_FragColor = color;
}
```

### Pixelation Effect
```glsl
uniform sampler2D tDiffuse;
uniform float uPixelSize;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 pixelatedUv = floor(vUv * uResolution / uPixelSize) * uPixelSize / uResolution;
  vec4 color = texture2D(tDiffuse, pixelatedUv);
  gl_FragColor = color;
}
```

---

## Painterly & Artistic Effects

### Kuwahara Filter (Oil Paint Effect)
```glsl
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform int uRadius;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uResolution;
  int radius = uRadius;

  // Sample 4 quadrants
  vec3 meanTL = vec3(0.0), meanTR = vec3(0.0);
  vec3 meanBL = vec3(0.0), meanBR = vec3(0.0);
  vec3 sqMeanTL = vec3(0.0), sqMeanTR = vec3(0.0);
  vec3 sqMeanBL = vec3(0.0), sqMeanBR = vec3(0.0);

  float count = 0.0;

  for (int x = -radius; x <= 0; x++) {
    for (int y = -radius; y <= 0; y++) {
      vec3 c = texture2D(tDiffuse, vUv + vec2(x, y) * texel).rgb;
      meanBL += c;
      sqMeanBL += c * c;
      count += 1.0;
    }
  }
  // Repeat for other quadrants...

  meanBL /= count;
  sqMeanBL /= count;

  // Calculate variance for each quadrant
  vec3 varBL = sqMeanBL - meanBL * meanBL;
  float sigBL = varBL.r + varBL.g + varBL.b;

  // Choose quadrant with lowest variance
  vec3 result = meanBL;
  float minVar = sigBL;

  // Compare with other quadrants and pick minimum variance

  gl_FragColor = vec4(result, 1.0);
}
```

### Watercolor Effect
```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tPaper;  // Paper texture for grain
uniform float uWetness;
uniform float uBleed;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Sample paper texture for variation
  float paper = texture2D(tPaper, vUv * 5.0).r;

  // Edge darkening (pigment accumulation)
  vec2 texel = 1.0 / vec2(textureSize(tDiffuse, 0));
  float edge = 0.0;
  for (int i = -2; i <= 2; i++) {
    for (int j = -2; j <= 2; j++) {
      vec4 neighbor = texture2D(tDiffuse, vUv + vec2(i, j) * texel);
      edge += distance(color.rgb, neighbor.rgb);
    }
  }
  edge /= 25.0;

  // Darken edges
  color.rgb -= edge * uBleed;

  // Add paper texture
  color.rgb = mix(color.rgb, color.rgb * paper, uWetness);

  gl_FragColor = color;
}
```

---

## Refraction & Dispersion

### Basic Refraction
```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform float uIOR;  // Index of Refraction
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 normal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;

  // Calculate refraction offset
  vec3 refracted = refract(vViewDir, normal, 1.0 / uIOR);
  vec2 offset = refracted.xy * 0.1;

  vec4 color = texture2D(tDiffuse, vUv + offset);
  gl_FragColor = color;
}
```

### Chromatic Dispersion (Rainbow Refraction)
```glsl
uniform sampler2D tDiffuse;
uniform float uDispersion;
uniform float uIOR;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 normal = normalize(vNormal);

  // Different IOR for each color channel
  float iorR = uIOR - uDispersion;
  float iorG = uIOR;
  float iorB = uIOR + uDispersion;

  vec3 refractR = refract(vViewDir, normal, 1.0 / iorR);
  vec3 refractG = refract(vViewDir, normal, 1.0 / iorG);
  vec3 refractB = refract(vViewDir, normal, 1.0 / iorB);

  float r = texture2D(tDiffuse, vUv + refractR.xy * 0.1).r;
  float g = texture2D(tDiffuse, vUv + refractG.xy * 0.1).g;
  float b = texture2D(tDiffuse, vUv + refractB.xy * 0.1).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

### Fresnel Effect
```glsl
varying vec3 vNormal;
varying vec3 vViewDir;

float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - abs(dot(viewDir, normal)), power);
}

void main() {
  float fresnelTerm = fresnel(normalize(vViewDir), normalize(vNormal), 2.0);

  vec3 baseColor = vec3(0.1, 0.2, 0.5);
  vec3 fresnelColor = vec3(0.5, 0.8, 1.0);

  vec3 color = mix(baseColor, fresnelColor, fresnelTerm);
  gl_FragColor = vec4(color, 1.0);
}
```

---

## Caustics

### Animated Caustics Pattern
```glsl
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

// Generate caustic pattern using layered noise
float causticLayer(vec2 uv, float time, float scale) {
  vec2 p = uv * scale;

  float c = 0.0;
  c += sin(p.x * 3.0 + time) * 0.5;
  c += sin(p.y * 4.0 - time * 0.7) * 0.5;
  c += sin((p.x + p.y) * 2.0 + time * 0.5) * 0.5;
  c += sin(length(p) * 5.0 - time) * 0.5;

  return c * 0.25 + 0.5;
}

void main() {
  vec2 uv = vUv;

  // Layer multiple caustic patterns
  float caustic = 0.0;
  caustic += causticLayer(uv, uTime, 3.0);
  caustic += causticLayer(uv + 0.5, uTime * 1.3, 5.0) * 0.5;
  caustic += causticLayer(uv - 0.3, uTime * 0.7, 7.0) * 0.25;

  caustic = pow(caustic, 2.0);  // Increase contrast

  vec3 color = vec3(0.1, 0.3, 0.5) + vec3(caustic * 0.5);
  gl_FragColor = vec4(color, 1.0);
}
```

### Voronoi-Based Caustics
```glsl
uniform float uTime;
varying vec2 vUv;

vec2 random2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float voronoiCaustic(vec2 uv, float time) {
  vec2 i_uv = floor(uv);
  vec2 f_uv = fract(uv);

  float minDist = 1.0;
  float secondMin = 1.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random2(i_uv + neighbor);
      point = 0.5 + 0.5 * sin(time + 6.2831 * point);

      float dist = length(neighbor + point - f_uv);

      if (dist < minDist) {
        secondMin = minDist;
        minDist = dist;
      } else if (dist < secondMin) {
        secondMin = dist;
      }
    }
  }

  return secondMin - minDist;
}

void main() {
  float caustic = voronoiCaustic(vUv * 5.0, uTime);
  caustic = pow(caustic, 0.5);

  gl_FragColor = vec4(vec3(caustic), 1.0);
}
```

---

## Volumetric Lighting (God Rays)

### Screen-Space God Rays
```glsl
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 uLightPosition;  // Screen space
uniform float uDensity;
uniform float uWeight;
uniform float uDecay;
uniform float uExposure;
uniform int uSamples;
varying vec2 vUv;

void main() {
  vec2 texCoord = vUv;
  vec2 deltaTexCoord = (texCoord - uLightPosition) / float(uSamples) * uDensity;

  vec4 color = texture2D(tDiffuse, texCoord);
  float illuminationDecay = 1.0;

  for (int i = 0; i < uSamples; i++) {
    texCoord -= deltaTexCoord;
    vec4 sampleColor = texture2D(tDiffuse, texCoord);
    sampleColor *= illuminationDecay * uWeight;
    color += sampleColor;
    illuminationDecay *= uDecay;
  }

  gl_FragColor = color * uExposure;
}
```

### Volumetric Light Shaft
```glsl
uniform sampler2D tDiffuse;
uniform vec3 uLightPos;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform float uDensity;
varying vec2 vUv;

#define NUM_SAMPLES 64

void main() {
  // Project light position to screen space
  vec4 lightScreen = uProjectionMatrix * uViewMatrix * vec4(uLightPos, 1.0);
  lightScreen.xy = lightScreen.xy / lightScreen.w * 0.5 + 0.5;

  vec2 ray = vUv - lightScreen.xy;
  float rayLength = length(ray);
  ray /= rayLength;

  float stepSize = rayLength / float(NUM_SAMPLES);
  vec2 pos = vUv;

  float accumLight = 0.0;

  for (int i = 0; i < NUM_SAMPLES; i++) {
    pos -= ray * stepSize;
    float depth = texture2D(tDiffuse, pos).r;
    accumLight += depth * uDensity;
  }

  accumLight /= float(NUM_SAMPLES);

  vec4 color = texture2D(tDiffuse, vUv);
  color.rgb += vec3(accumLight);

  gl_FragColor = color;
}
```

---

## Volumetric Clouds

### Basic Cloud Raymarching
```glsl
uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uLightDir;
varying vec3 vWorldPos;
varying vec3 vRayDir;

#define MAX_STEPS 64
#define CLOUD_BOTTOM 1000.0
#define CLOUD_TOP 2000.0

// 3D noise function (use your preferred implementation)
float noise3D(vec3 p);

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise3D(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float cloudDensity(vec3 p) {
  // Shape with FBM
  float density = fbm(p * 0.001 + uTime * 0.01);

  // Fade at boundaries
  float heightFade = smoothstep(CLOUD_BOTTOM, CLOUD_BOTTOM + 200.0, p.y);
  heightFade *= smoothstep(CLOUD_TOP, CLOUD_TOP - 200.0, p.y);

  return max(0.0, density - 0.5) * heightFade;
}

vec4 raymarchClouds(vec3 ro, vec3 rd) {
  float t = 0.0;
  float transmittance = 1.0;
  vec3 light = vec3(0.0);

  // Find intersection with cloud layer
  float tMin = (CLOUD_BOTTOM - ro.y) / rd.y;
  float tMax = (CLOUD_TOP - ro.y) / rd.y;
  if (tMin > tMax) { float temp = tMin; tMin = tMax; tMax = temp; }

  t = max(tMin, 0.0);
  float stepSize = (tMax - t) / float(MAX_STEPS);

  for (int i = 0; i < MAX_STEPS; i++) {
    if (transmittance < 0.01) break;

    vec3 pos = ro + rd * t;
    float density = cloudDensity(pos);

    if (density > 0.0) {
      // Light contribution
      float lightDensity = cloudDensity(pos + uLightDir * 50.0);
      float shadow = exp(-lightDensity * 10.0);

      vec3 ambient = vec3(0.4, 0.5, 0.6);
      vec3 sunColor = vec3(1.0, 0.9, 0.7);

      vec3 luminance = ambient + sunColor * shadow;
      light += transmittance * luminance * density * stepSize;
      transmittance *= exp(-density * stepSize);
    }

    t += stepSize;
  }

  return vec4(light, 1.0 - transmittance);
}

void main() {
  vec3 rayDir = normalize(vRayDir);
  vec4 clouds = raymarchClouds(uCameraPos, rayDir);

  vec3 skyColor = vec3(0.4, 0.6, 0.9);
  vec3 color = mix(skyColor, clouds.rgb, clouds.a);

  gl_FragColor = vec4(color, 1.0);
}
```

---

## Particle Systems

### GPU Particles with Shaders
```glsl
// Vertex Shader for particles
attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute float aLife;
attribute float aSize;

uniform float uTime;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying float vLife;

void main() {
  // Animate position
  vec3 pos = aPosition + aVelocity * uTime;

  // Add gravity
  pos.y -= 0.5 * 9.8 * uTime * uTime;

  vLife = aLife;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}

// Fragment Shader for particles
varying float vLife;

void main() {
  // Circular particle
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  alpha *= vLife;  // Fade with life

  vec3 color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 0.0), 1.0 - vLife);

  gl_FragColor = vec4(color, alpha);
}
```

### FBO Particle Simulation
```glsl
// Position update shader (renders to texture)
uniform sampler2D tPositions;
uniform sampler2D tVelocities;
uniform float uDeltaTime;
varying vec2 vUv;

void main() {
  vec3 position = texture2D(tPositions, vUv).xyz;
  vec3 velocity = texture2D(tVelocities, vUv).xyz;

  // Update position
  position += velocity * uDeltaTime;

  // Boundary conditions
  if (position.y < 0.0) {
    position.y = 0.0;
    velocity.y *= -0.8;  // Bounce
  }

  gl_FragColor = vec4(position, 1.0);
}

// Velocity update shader
uniform sampler2D tPositions;
uniform sampler2D tVelocities;
uniform vec3 uGravity;
uniform vec3 uWind;
uniform float uDeltaTime;
varying vec2 vUv;

void main() {
  vec3 velocity = texture2D(tVelocities, vUv).xyz;

  // Apply forces
  velocity += uGravity * uDeltaTime;
  velocity += uWind * uDeltaTime;

  // Drag
  velocity *= 0.99;

  gl_FragColor = vec4(velocity, 1.0);
}
```

---

## Vertex Displacement

### Wave Displacement
```glsl
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;

  vec3 pos = position;

  // Multiple wave layers
  float wave1 = sin(pos.x * uFrequency + uTime) * uAmplitude;
  float wave2 = sin(pos.z * uFrequency * 0.8 + uTime * 1.3) * uAmplitude * 0.5;
  float wave3 = sin((pos.x + pos.z) * uFrequency * 0.5 + uTime * 0.7) * uAmplitude * 0.3;

  pos.y += wave1 + wave2 + wave3;
  vElevation = pos.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Noise-Based Terrain
```glsl
uniform float uTime;
uniform float uScale;
uniform float uHeight;

varying vec2 vUv;
varying vec3 vNormal;

// Include noise functions...

void main() {
  vUv = uv;

  vec3 pos = position;

  // Terrain height from FBM
  float height = fbm(pos.xz * uScale + uTime * 0.1) * uHeight;
  pos.y += height;

  // Calculate normal from neighboring heights
  float eps = 0.01;
  float hL = fbm((pos.xz + vec2(-eps, 0.0)) * uScale) * uHeight;
  float hR = fbm((pos.xz + vec2(eps, 0.0)) * uScale) * uHeight;
  float hD = fbm((pos.xz + vec2(0.0, -eps)) * uScale) * uHeight;
  float hU = fbm((pos.xz + vec2(0.0, eps)) * uScale) * uHeight;

  vNormal = normalize(vec3(hL - hR, 2.0 * eps, hD - hU));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

---

## TSL (Three.js Shading Language) & WebGPU

### Node-Based Shader Example
```javascript
import {
  color, float, vec2, vec3, vec4,
  uv, time, sin, cos, mix, smoothstep,
  texture, uniform
} from 'three/tsl';

// Create a gradient material
const gradientMaterial = new MeshBasicNodeMaterial();
gradientMaterial.colorNode = mix(
  color(0x0000ff),
  color(0xff0000),
  uv().y
);

// Animated pattern
const patternMaterial = new MeshBasicNodeMaterial();
const pattern = sin(uv().x.mul(20).add(time)).mul(0.5).add(0.5);
patternMaterial.colorNode = vec3(pattern, pattern.mul(0.5), 1.0);

// Noise-based effect
const noiseMaterial = new MeshBasicNodeMaterial();
const noiseValue = noise(uv().mul(10).add(time.mul(0.5)));
noiseMaterial.colorNode = mix(
  color(0x000033),
  color(0x3366ff),
  noiseValue
);
```

---

## Resources

- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/)
- [Inigo Quilez - Distance Functions](https://iquilezles.org/articles/distfunctions/)
- [LYGIA Shader Library](https://lygia.xyz/)
- [GraphToy](https://graphtoy.com/)
- [Maxime Heckel's Blog](https://blog.maximeheckel.com/)
- [Three.js Journey](https://threejs-journey.com/)
