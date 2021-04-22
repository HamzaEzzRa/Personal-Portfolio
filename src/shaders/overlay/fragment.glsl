#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

#define S(a,s) smoothstep((1. / u_resolution.y) * 2. * s, 0., a)
#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))
#define R(a,b) (b * rot(a))

varying vec2 v_uv;

uniform float u_time;
uniform vec3 u_bgColor;
uniform vec3 u_mouseColor;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_alpha;
uniform float u_loadingFactor;
uniform float u_mixAddFactor;

float spheres(vec2 p,float rep) {
  p *= rep;
  p = fract(p) - .5;
  return 1. - S(length(p) - .02, 10.);
}

float sdc(vec2 p, vec2 r) {
  vec2 q = abs(p) - r;
  return max(q.x, q.y);
}

highp float rand(vec2 co)
{
    return fract(sin(mod(dot(co.xy, vec2(12.9898, 78.233)), 3.14)) * 43758.5453);
}

float circle(in vec2 _st, in float _radius, in float blurriness)
{
	vec2 dist = _st;
	return 0.0 + smoothstep(_radius - (_radius * blurriness), _radius + (_radius * blurriness), dot(dist, dist) * 4.0);
}

void main()
{
    // Mouse & Coords Adjustment
    vec2 res = u_resolution * devicePR;
    vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
    st.y *= u_resolution.y / u_resolution.x;
    vec2 mouse = u_mouse * -0.5;
	mouse.y *= u_resolution.y / u_resolution.x;

    // Circle Mask
    vec2 circlePos = st + mouse;
	float c = circle(circlePos, (u_resolution.x / u_resolution.y + u_resolution.y / u_resolution.x) * 0.07, 2.0) * 2.5;

    // Additive Noise
    float offX = v_uv.x + sin(v_uv.y + u_time * 0.1);
    float offY = v_uv.y - u_time * 0.1 - cos(u_time * 0.001) * 0.01;
    float n = snoise3(vec3(offX, offY, u_time * 0.1) * 8.0) - 1.0;

    // Final Mouse Mask
    float mask = smoothstep(0.4, 0.5, n + pow(c, 2.0));
    
    // Colors
    vec3 col = vec3(0.85);
    col *= spheres(st + floor(u_time) * .15, 20. * (u_resolution.x / u_resolution.y + u_resolution.y / u_resolution.x) * 0.3);
    
    float redbox = sdc(R((st.x / st.y * st.y / st.x) * 0.5, st), vec2(1.1, .14) * (u_resolution.x / u_resolution.y + u_resolution.y / u_resolution.x) * 0.4);
    col = mix(col, vec3(1, 0, .2), S(redbox, 1.));
    
    float stripes = sdc(fract(st * 15. + -st.y + u_time) - .5, vec2(.3, .5));
    float sbound = sdc(st * vec2(0.7, 1.2), vec2(.25, .05));
    stripes = max(stripes, sbound);
    col = mix(col, 1. - col, S(stripes, 1.) * u_loadingFactor);
    col = mix(col, 1. - col, S(abs(sbound) - .002, 1.) * u_loadingFactor);

    gl_FragColor = vec4(col, clamp(u_alpha * mask + u_mixAddFactor, 0.0, 1.0));
}
