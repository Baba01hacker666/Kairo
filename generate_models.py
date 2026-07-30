import math
import random

def write_obj(filename, verts, faces):
    with open(f"public/models/{filename}", "w") as f:
        for v in verts:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for face in faces:
            # OBJ uses 1-based indexing
            f.write("f " + " ".join(str(idx + 1) for idx in face) + "\n")

# 1. Crystal (Hexagonal Bipyramid)
crystal_verts = []
crystal_faces = []
sides = 6
radius = 1.0
half_height = 2.5

# Middle ring
for i in range(sides):
    angle = 2 * math.pi * i / sides
    crystal_verts.append((math.cos(angle) * radius, 0, math.sin(angle) * radius))

# Top and bottom tips
top_idx = len(crystal_verts)
crystal_verts.append((0, half_height, 0))
bottom_idx = len(crystal_verts)
crystal_verts.append((0, -half_height, 0))

# Faces
for i in range(sides):
    next_i = (i + 1) % sides
    # Top half (Counter-clockwise)
    crystal_faces.append((i, next_i, top_idx))
    # Bottom half (Counter-clockwise)
    crystal_faces.append((next_i, i, bottom_idx))

write_obj("crystal.obj", crystal_verts, crystal_faces)

# 2. Rock (Displaced Icosahedron)
t = (1.0 + math.sqrt(5.0)) / 2.0
rock_verts_base = [
    (-1,  t,  0), ( 1,  t,  0), (-1, -t,  0), ( 1, -t,  0),
    ( 0, -1,  t), ( 0,  1,  t), ( 0, -1, -t), ( 0,  1, -t),
    ( t,  0, -1), ( t,  0,  1), (-t,  0, -1), (-t,  0,  1)
]

rock_verts = []
random.seed(42)
for v in rock_verts_base:
    # Normalize to radius 1.5, then add random noise
    l = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    noise = random.uniform(0.7, 1.3) * 1.5
    rock_verts.append((v[0]/l * noise, v[1]/l * noise, v[2]/l * noise))

rock_faces = [
    (0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
    (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
    (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
    (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)
]

write_obj("rock.obj", rock_verts, rock_faces)
