import { Skia, type SkRuntimeEffect } from '@shopify/react-native-skia';

// An orthographic ray intersects a glass sphere. Its material rotates in object
// space and flows along the sphere independently; light stays in world space.
// Refraction is a single interior sample, not a path-traced optical simulation.
export const BLOB_3D_SHADER_SOURCE = `
uniform shader material;
uniform float size;
uniform float time;
uniform float materialTime;
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
uniform float idle;
uniform float3 voiceRingProgress;
uniform float3 voiceRingStrength;

float3 rotateObject(float3 p, float yaw, float pitch) {
  float cy = cos(yaw);
  float sy = sin(yaw);
  float cx = cos(pitch);
  float sx = sin(pitch);
  float3 q = float3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  return float3(q.x, cx * q.y - sx * q.z, sx * q.y + cx * q.z);
}

float3 sampleMaterial(float2 p) {
  // Keep every sample inside the approved material's clean glass cutout.
  half4 texel = material.eval((float2(0.496, 0.482) + p * 0.398) * size);
  float3 color = float3(texel.rgb) / max(float(texel.a), 0.001);
  return mix(float3(0.20, 0.58, 0.39), color, smoothstep(0.6, 0.95, float(texel.a)));
}

float3 flowMaterialPoint(float3 p, float t, float amount) {
  // Spatially varying tangent currents stretch the liquid channels locally.
  // Normalizing keeps samples on the sphere, away from the image cutout edge.
  float3 current = float3(
    sin(p.y * 2.8 + p.z * 1.7 + t * 0.61),
    sin(p.z * 2.6 - p.x * 1.6 - t * 0.47 + 2.1),
    sin(p.x * 2.4 + p.y * 1.8 + t * 0.39 + 4.2)
  );
  float3 tangent = current - p * dot(current, p);
  float3 q = normalize(p + tangent * 0.23 * amount);
  float3 eddy = float3(
    sin(q.z * 3.7 - q.y * 1.3 - t * 0.29 + 1.4),
    sin(q.x * 3.2 + q.z * 1.5 + t * 0.37 + 3.7),
    sin(q.y * 3.4 - q.x * 1.2 - t * 0.23)
  );
  return normalize(q + (eddy - q * dot(eddy, q)) * 0.075 * amount);
}

float3 objectMaterial(float3 p, float flowTime, float flowAmount) {
  // A projection through object space keeps the approved wide liquid channels.
  // The z-dependent bend makes front and back material differ continuously;
  // rotation brings those 3D surface points around the silhouette into view.
  float3 flowing = flowMaterialPoint(p, flowTime, flowAmount);
  float bend = 0.045 * (1.0 - flowing.z * flowing.z);
  float2 uv = flowing.xy + float2(flowing.z * flowing.y, -flowing.z * flowing.x) * bend;
  return sampleMaterial(uv * 0.985);
}

float speechRing(float r, float progress, float strength) {
  float age = clamp(progress, 0.0, 1.0);
  float radius = mix(0.376, 0.490, age);
  float width = mix(0.0058, 0.0085, age);
  float d = (r - radius) / width;
  float envelope = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.32, 1.0, age));
  return exp(-d * d) * envelope * clamp(strength, 0.0, 1.0) * 0.30;
}

half4 main(float2 position) {
  float2 p = (position - float2(size * 0.5)) / size;
  float r = length(p);
  float voice = clamp(energy, 0.0, 1.0) * listening * motion;
  float beat = clamp(pulse, 0.0, 1.0) * listening * motion;
  float release = sin(successProgress * 3.141593) * success * motion;
  float radius = 0.400 * (1.0 + voice * 0.011 + beat * 0.004);
  radius *= 1.0 - press * 0.016 * motion;

  // Voice only changes the contour by a fraction of a percent. Silence has no
  // breathing or periodic deformation, and the ring clock is driven externally.
  float axis = voice * 0.0035 * sin(time * 1.7);
  float2 stretch = float2(1.0 + axis, 1.0 - axis);
  float2 sphereXY = p / stretch;
  float radiusSquared = dot(sphereXY, sphereXY);
  float aa = 1.25 / max(size, 1.0);
  float alpha = 1.0 - smoothstep(radius - aa, radius + aa, length(sphereXY));

  float haloDistance = (r - radius) / 0.035;
  float halo = exp(-haloDistance * haloDistance * 1.7)
             * (0.016 + voice * 0.026 + beat * 0.018);
  float rings = speechRing(r, voiceRingProgress.x, voiceRingStrength.x)
              + speechRing(r, voiceRingProgress.y, voiceRingStrength.y)
              + speechRing(r, voiceRingProgress.z, voiceRingStrength.z);
  rings *= motion * listening;
  float finishDistance = (r - 0.376 - successProgress * 0.104) / 0.006;
  float finishRing = exp(-finishDistance * finishDistance) * release * 0.20;
  float behindAlpha = clamp(halo + rings + finishRing, 0.0, 0.65) * opacity;
  float3 behind = float3(0.25, 0.56, 0.34) * behindAlpha;

  if (alpha <= 0.0) return half4(behind, behindAlpha);

  // The front ray/sphere hit and its analytic surface normal, in world space.
  float z = sqrt(max(radius * radius - radiusSquared, 0.000001));
  float3 hit = float3(sphereXY, z);
  float3 normal = normalize(float3(sphereXY / stretch, z));
  float3 ray = float3(0.0, 0.0, -1.0);
  float yaw = time * 0.115 * motion;
  float pitch = sin(time * 0.045) * 0.12 * motion;
  float3 objectPoint = rotateObject(normalize(hit), yaw, pitch);
  float flowTime = materialTime * motion;
  float flowAmount = motion;
  float3 color = objectMaterial(objectPoint, flowTime, flowAmount);

  // A refracted ray crosses the sphere once. Chord length controls absorption;
  // the far intersection adds faint interior parallax under the front material.
  float3 through = refract(ray, normal, 1.0 / 1.42);
  float chord = max(-2.0 * dot(hit, through), 0.0);
  float3 backHit = normalize(hit + through * chord);
  float3 backPoint = rotateObject(backHit, yaw, pitch);
  float3 interior = objectMaterial(backPoint, flowTime, flowAmount);
  float facing = clamp(dot(normal, -ray), 0.0, 1.0);
  float fresnel = 0.035 + 0.965 * pow(1.0 - facing, 4.0);
  float transmission = 0.075 * (1.0 - fresnel);
  color = mix(color, interior, transmission);
  color *= 1.0 - (chord / (2.0 * radius)) * 0.035;

  // A broad overhead light and a narrow rim stay fixed as the material turns.
  float3 light = normalize(float3(-0.48, -0.63, 1.15));
  float3 halfDirection = normalize(light - ray);
  float highlight = pow(max(dot(normal, halfDirection), 0.0), 70.0);
  float rim = pow(1.0 - facing, 3.2);
  float rimLight = 0.65 + 0.35 * dot(normal, light);
  color = mix(color, float3(0.91, 0.99, 0.87), highlight * 0.12);
  color = mix(color, float3(0.08, 0.40, 0.29), rim * 0.23);
  color += float3(0.54, 0.79, 0.57) * rim * rimLight * 0.11;
  color += release * 0.018;

  float luminance = dot(color, float3(0.2126, 0.7152, 0.0722));
  color = clamp(mix(float3(luminance), color, saturation), 0.0, 1.0);
  alpha *= opacity;
  return half4(color * alpha + behind * (1.0 - alpha),
               alpha + behindAlpha * (1.0 - alpha));
}
`;

let effect: SkRuntimeEffect | null | undefined;

export function getBlob3dShader(): SkRuntimeEffect | null {
  if (effect !== undefined) return effect;
  try {
    effect = Skia.RuntimeEffect.Make(BLOB_3D_SHADER_SOURCE);
  } catch {
    effect = null;
  }
  return effect;
}
