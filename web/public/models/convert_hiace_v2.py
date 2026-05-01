"""
Convert Toyota_HiAce 2012.3dm to a multi-material GLB.
- Each Rhino layer gets its own PBR material
- Coordinate system baked in: Rhino Z-up → GLTF Y-up
- Normals computed by trimesh (process=True)
"""
import rhino3dm
import trimesh
import numpy as np
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals

# Layer index → PBR material (matching layer names from check_3dm_materials.py)
LAYER_MATERIALS = {
    # 2  carrocerias (body panels) — white metallic
    2:  PBRMaterial(name='body',           baseColorFactor=[0.92, 0.92, 0.92, 1.0], metallicFactor=0.35, roughnessFactor=0.22),
    # 3  Layer 03 — treat as body
    3:  PBRMaterial(name='body_misc',      baseColorFactor=[0.88, 0.88, 0.88, 1.0], metallicFactor=0.3,  roughnessFactor=0.3),
    # 4  logo
    4:  PBRMaterial(name='logo',           baseColorFactor=[0.15, 0.15, 0.15, 1.0], metallicFactor=0.8,  roughnessFactor=0.2),
    # 5  plastico negro (black plastic trim)
    5:  PBRMaterial(name='black_plastic',  baseColorFactor=[0.04, 0.04, 0.04, 1.0], metallicFactor=0.0,  roughnessFactor=0.85),
    # 6  Parrilla (front grille)
    6:  PBRMaterial(name='grille',         baseColorFactor=[0.06, 0.06, 0.06, 1.0], metallicFactor=0.6,  roughnessFactor=0.5),
    # 7  vidrios laterales (side windows) — semi-transparent
    7:  PBRMaterial(name='side_glass',     baseColorFactor=[0.5,  0.7,  0.85, 0.35], metallicFactor=0.0, roughnessFactor=0.04, alphaMode='BLEND'),
    # 8  piso suelo (floor)
    8:  PBRMaterial(name='floor',          baseColorFactor=[0.25, 0.25, 0.25, 1.0], metallicFactor=0.0,  roughnessFactor=0.9),
    # 9  llantas (tires)
    9:  PBRMaterial(name='tires',          baseColorFactor=[0.04, 0.04, 0.04, 1.0], metallicFactor=0.0,  roughnessFactor=0.95),
    # 10 luces rojas (rear red lights)
    10: PBRMaterial(name='red_lights',     baseColorFactor=[0.9,  0.05, 0.05, 0.85], metallicFactor=0.0, roughnessFactor=0.08, alphaMode='BLEND'),
    # 11 vidrio transparente (clear glass — windshield inner layer)
    11: PBRMaterial(name='clear_glass',    baseColorFactor=[0.65, 0.82, 0.92, 0.22], metallicFactor=0.0, roughnessFactor=0.02, alphaMode='BLEND'),
    # 12 direccionales (amber turn signals)
    12: PBRMaterial(name='turn_signals',   baseColorFactor=[0.95, 0.6,  0.05, 0.85], metallicFactor=0.0, roughnessFactor=0.08, alphaMode='BLEND'),
    # 13 luces (headlight lenses)
    13: PBRMaterial(name='headlights',     baseColorFactor=[0.95, 0.95, 0.95, 0.9],  metallicFactor=0.0, roughnessFactor=0.05, alphaMode='BLEND'),
    # 14 Escobillas (wipers)
    14: PBRMaterial(name='wipers',         baseColorFactor=[0.05, 0.05, 0.05, 1.0], metallicFactor=0.4,  roughnessFactor=0.5),
    # 15 aros (wheel rims — chrome)
    15: PBRMaterial(name='rims',           baseColorFactor=[0.82, 0.83, 0.87, 1.0], metallicFactor=0.95, roughnessFactor=0.08),
    # 16 copas de aros (hub caps)
    16: PBRMaterial(name='hub_caps',       baseColorFactor=[0.8,  0.82, 0.86, 1.0], metallicFactor=0.9,  roughnessFactor=0.12),
    # 17 Freno de disco (disc brakes)
    17: PBRMaterial(name='disc_brake',     baseColorFactor=[0.22, 0.22, 0.22, 1.0], metallicFactor=0.75, roughnessFactor=0.55),
    # 18 espejos (door mirrors)
    18: PBRMaterial(name='mirrors',        baseColorFactor=[0.88, 0.88, 0.92, 1.0], metallicFactor=0.9,  roughnessFactor=0.07),
    # 19 Faros Cromados (chrome headlight housings)
    19: PBRMaterial(name='chrome_hl',      baseColorFactor=[0.92, 0.92, 0.95, 1.0], metallicFactor=0.98, roughnessFactor=0.03),
    # 20 Bombillos carro (bulb filaments / bright spots)
    20: PBRMaterial(name='bulbs',          baseColorFactor=[0.98, 0.98, 0.85, 1.0], metallicFactor=0.0,  roughnessFactor=0.05),
    # 21 forros internos de microbus (interior linings)
    21: PBRMaterial(name='interior',       baseColorFactor=[0.12, 0.12, 0.12, 1.0], metallicFactor=0.0,  roughnessFactor=0.9),
    # 22 Asientos micro (seats — dark blue/gray fabric)
    22: PBRMaterial(name='seats',          baseColorFactor=[0.08, 0.1,  0.22, 1.0], metallicFactor=0.0,  roughnessFactor=0.88),
    # 23 tubos de metal negros (black metal tubes)
    23: PBRMaterial(name='black_metal',    baseColorFactor=[0.05, 0.05, 0.05, 1.0], metallicFactor=0.8,  roughnessFactor=0.4),
    # 24 Partes Cromadas (chrome trim)
    24: PBRMaterial(name='chrome_parts',   baseColorFactor=[0.92, 0.92, 0.95, 1.0], metallicFactor=0.98, roughnessFactor=0.03),
    # 25 Seguros cinturones seguridad (seatbelt clips)
    25: PBRMaterial(name='seatbelts',      baseColorFactor=[0.18, 0.18, 0.18, 1.0], metallicFactor=0.5,  roughnessFactor=0.6),
    # 26 Marcos internos de ventanas (inner window frames)
    26: PBRMaterial(name='window_frames',  baseColorFactor=[0.05, 0.05, 0.05, 1.0], metallicFactor=0.3,  roughnessFactor=0.6),
    # 27 parabrisas central (main windshield)
    27: PBRMaterial(name='windshield',     baseColorFactor=[0.6,  0.8,  0.9,  0.22], metallicFactor=0.0, roughnessFactor=0.02, alphaMode='BLEND'),
    # 28 Dash (dashboard)
    28: PBRMaterial(name='dash',           baseColorFactor=[0.07, 0.07, 0.07, 1.0], metallicFactor=0.1,  roughnessFactor=0.82),
    # 29 Vinil palanca de cambios (gear shift vinyl)
    29: PBRMaterial(name='gear_shift',     baseColorFactor=[0.08, 0.08, 0.08, 1.0], metallicFactor=0.2,  roughnessFactor=0.72),
    # 30 plastico vidrio (plastic window trim)
    30: PBRMaterial(name='plastic_glass',  baseColorFactor=[0.65, 0.8,  0.9,  0.45], metallicFactor=0.0, roughnessFactor=0.12, alphaMode='BLEND'),
    # 31 Blanco lechoso iluminado (white interior panels)
    31: PBRMaterial(name='white_interior', baseColorFactor=[0.94, 0.94, 0.94, 1.0], metallicFactor=0.0,  roughnessFactor=0.55),
}
DEFAULT_MAT = PBRMaterial(name='default', baseColorFactor=[0.88, 0.88, 0.88, 1.0], metallicFactor=0.3, roughnessFactor=0.5)

# Rotation matrix: Rhino Z-up → GLTF/Three.js Y-up
# x' = x,  y' = z,  z' = -y
R = np.array([
    [1,  0,  0],
    [0,  0,  1],
    [0, -1,  0],
], dtype=np.float32)

print("Reading 3DM...")
model = rhino3dm.File3dm.Read("Toyota_HiAce 2012.3dm")

# Group raw trimesh objects by layer index
layer_tris: dict[int, list] = {}

for obj in model.Objects:
    geom = obj.Geometry
    if type(geom).__name__ != "Mesh":
        continue

    verts = np.array([[v.X, v.Y, v.Z] for v in geom.Vertices], dtype=np.float32)
    if len(verts) == 0:
        continue

    faces = []
    for f in geom.Faces:
        a, b, c, d = f
        faces.append([a, b, c])
        if c != d:
            faces.append([a, c, d])
    if not faces:
        continue

    verts = (R @ verts.T).T          # apply coordinate rotation
    faces = np.array(faces, dtype=np.int32)
    layer_idx = obj.Attributes.LayerIndex

    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=True)
    layer_tris.setdefault(layer_idx, []).append(mesh)

print(f"Loaded {sum(len(v) for v in layer_tris.values())} meshes across {len(layer_tris)} layers")

# Merge per-layer meshes and assign materials
scene_geoms = []
for layer_idx, tri_list in sorted(layer_tris.items()):
    merged = trimesh.util.concatenate(tri_list)
    # Force normal computation before export — trimesh won't include NORMAL
    # attribute in GLB unless vertex_normals have been explicitly accessed
    _ = merged.vertex_normals
    material = LAYER_MATERIALS.get(layer_idx, DEFAULT_MAT)
    merged.visual = TextureVisuals(material=material)
    scene_geoms.append(merged)
    layer_name = [l.Name for i, l in enumerate(model.Layers) if i == layer_idx]
    print(f"  layer {layer_idx} ({layer_name[0] if layer_name else '?'}): {len(merged.vertices)} verts, mat={material.name}")

scene = trimesh.Scene(scene_geoms)
out = "hiace-layered.glb"
scene.export(out)
print(f"\nExported: {out}")
