#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")

varying vec2 v_uv;

uniform float u_time;
uniform vec3 u_bgColor;
uniform vec3 u_mouseColor;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_alpha;
uniform float u_mixAddFactor;

highp float rand(vec2 co)
{
    return fract(sin(mod(dot(co.xy ,vec2(12.9898,78.233)),3.14))*43758.5453);
}

float tnoise(vec2 co)
{
    vec2 w = co;
    co.y += co.x * 0.5;
    const vec2 s = vec2(1.0, 0.0);
	vec2 p = floor(co);
    if (fract(co.x) < fract(co.y))
        p += 0.5;    
    return rand(p);
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
	float c = circle(circlePos, (u_resolution.x / u_resolution.y + u_resolution.y / u_resolution.x) * 0.05, 2.0) * 2.5;

    // Additive Noise
    float offX = v_uv.x + sin(v_uv.y + u_time * 0.1);
    float offY = v_uv.y - u_time * 0.1 - cos(u_time * 0.001) * 0.01;
    float n = snoise3(vec3(offX, offY, u_time * 0.1) * 8.0) - 1.0;

    // Final Mask
    float mask = smoothstep(0.4, 0.5, n + pow(c, 2.0));
    
    // Colors
    vec2 mod_uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) * 0.015;
    float noise = tnoise(mod_uv);
    vec4 col = vec4(sin(u_time * 1.75 * noise * 7.0 + noise * 3.141592653589793 * 2.0) * 0.5 + 0.5) * 0.3 + 0.5;
    col += sin((mod_uv.x - mod_uv.y) * 30.0) * 0.5;
    col += rand(mod_uv) * 0.5;
    col *= 0.25;

    gl_FragColor = vec4(mix(u_bgColor, col.xyz, 0.4), clamp(u_alpha * mask + u_mixAddFactor, 0.0, 1.0)); // Don't forget to use u_mixAddFactor with [0-1] clamping to smooth
}
