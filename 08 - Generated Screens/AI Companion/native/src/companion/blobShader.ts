import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';

// Every sample comes from the approved material. The vector field moves its
// channels locally, while the silhouette responds separately to voice energy.
export const BLOB_SHADER_SOURCE = `
uniform shader material;
uniform float size;
uniform float time;
uniform float energy;
uniform float pulse;
uniform float listening;
uniform float processing;
uniform float motion;
uniform float saturation;
uniform float opacity;
uniform float success;
uniform float successProgress;
uniform float press;

half4 main(float2 position) {
  float2 p = (position - float2(size * 0.5)) / size;
  float r = length(p);
  float angle = atan(p.y, p.x);
  float t = time;

  float breath = sin(t * 0.92) * 0.0055 * motion;
  float voice = clamp(energy, 0.0, 1.0) * listening * motion;
  float beat = clamp(pulse, 0.0, 1.0) * listening * motion;
  float release = sin(successProgress * 3.141593) * success * motion;
  float scale = 0.97 * (1.0 + breath + voice * 0.038 + beat * 0.022 + release * 0.018);
  scale *= 1.0 - press * 0.025;

  float ripple = sin(angle * 3.0 + t * 0.66) * 0.62
               + sin(angle * 2.0 - t * 0.48 + 1.7) * 0.38;
  float deformation = (0.005 * motion + voice * 0.025 + beat * 0.006) * ripple;
  float2 q = p / (scale * (1.0 + deformation));

  float interior = 1.0 - smoothstep(0.15, 0.46, length(q));
  float flowStrength = (0.010 + voice * 0.019 + processing * 0.014) * motion;
  float2 flow = float2(
    sin(q.y * 8.1 + t * 0.55) * cos(q.x * 4.8 - t * 0.28),
    cos(q.x * 7.0 - t * 0.43 + 0.9) * sin(q.y * 5.6 + t * 0.31)
  );
  q += flow * flowStrength * interior;

  half4 texel = material.eval((q + 0.5) * size);
  float alpha = float(texel.a);
  float3 color = float3(texel.rgb) / max(alpha, 0.001);

  // The transparent export has isolated cyan pixels at its cutout edge.
  // Only low-alpha boundary pixels are softened; highlights stay intact.
  float edge = smoothstep(0.03, 0.58, alpha);
  float cyan = smoothstep(0.035, 0.12, color.b - color.r)
             * smoothstep(0.12, 0.42, color.g - color.r);
  color = mix(color, float3(0.22, 0.55, 0.35), cyan * (1.0 - edge) * 0.85);
  alpha *= edge;

  float luminance = dot(color, float3(0.2126, 0.7152, 0.0722));
  color = mix(float3(luminance), color, saturation);
  float caustic = sin(q.x * 9.0 + q.y * 5.0 + t * 0.41);
  float light = 1.0 + caustic * interior * motion * (0.012 + voice * 0.016);
  color = clamp(color * light + release * 0.024, 0.0, 1.0);
  alpha *= opacity;

  float haloWidth = 0.068 + voice * 0.023 + beat * 0.014;
  float haloDistance = (r - 0.376 - beat * 0.004) / haloWidth;
  float halo = exp(-haloDistance * haloDistance * 1.7)
             * (0.017 + listening * 0.037 + voice * 0.028 + beat * 0.05 + processing * 0.024);

  float ringRadius = 0.376 + successProgress * 0.104;
  float ringDistance = (r - ringRadius) / 0.006;
  float ring = exp(-ringDistance * ringDistance)
             * sin(successProgress * 3.141593) * success * 0.16 * motion;
  float behindAlpha = (halo + ring) * opacity;
  float3 behind = float3(0.27, 0.57, 0.36) * behindAlpha;

  return half4(color * alpha + behind * (1.0 - alpha),
               alpha + behindAlpha * (1.0 - alpha));
}
`;

let effect: SkRuntimeEffect | null | undefined;

export function getBlobShader(): SkRuntimeEffect | null {
  if (effect !== undefined) return effect;
  try {
    effect = Skia.RuntimeEffect.Make(BLOB_SHADER_SOURCE);
  } catch {
    effect = null;
  }
  return effect;
}
