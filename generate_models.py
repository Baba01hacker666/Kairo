import math
import random
import os

def write_obj(filename, verts, faces):
    os.makedirs("public/models", exist_ok=True)
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

for i in range(sides):
    angle = 2 * math.pi * i / sides
    crystal_verts.append((math.cos(angle) * radius, 0, math.sin(angle) * radius))

top_idx = len(crystal_verts)
crystal_verts.append((0, half_height, 0))
bottom_idx = len(crystal_verts)
crystal_verts.append((0, -half_height, 0))

for i in range(sides):
    next_i = (i + 1) % sides
    crystal_faces.append((i, next_i, top_idx))
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

# 3. Grass (unchanged, correct)
grass_verts = [
    (-0.05, 0, 0), (0.05, 0, 0), (0, 0.8, 0),
    (-0.04, 0, 0.02), (0.04, 0, 0.02), (0, 0.65, 0.15),
    (-0.04, 0, -0.02), (0.04, 0, -0.02), (0, 0.7, -0.15),
]

grass_faces = [
    (0, 1, 2),
    (3, 5, 4),
    (6, 7, 8),
]

write_obj("grass.obj", grass_verts, grass_faces)

# 4. Flower – removed degenerate face
flower_verts = [
    (0, 0, 0),          # 0 (base, unused in faces)
    (0, 1, 0),          # 1 (stem top / petal center)
    (0.2, 1.1, 0),      # 2 (right petal)
    (-0.2, 1.1, 0),     # 3 (left petal)
    (0, 1.1, 0.2),      # 4 (front petal)
    (0, 1.1, -0.2),     # 5 (back petal)
    (0, 1.25, 0)        # 6 (top point)
]

flower_faces = [
    (1, 2, 6),
    (1, 6, 3),
    (1, 4, 6),
    (1, 6, 5)
]

write_obj("flower.obj", flower_verts, flower_faces)

# 5. Mushroom (unchanged, already valid)
mush_verts = [
    (-0.08,0,-0.08),(0.08,0,-0.08),(0.08,0,0.08),(-0.08,0,0.08),
    (-0.05,0.4,-0.05),(0.05,0.4,-0.05),(0.05,0.4,0.05),(-0.05,0.4,0.05),
    (-0.25,0.4,-0.25),(0.25,0.4,-0.25),(0.25,0.4,0.25),(-0.25,0.4,0.25),
    (0,0.7,0)
]

mush_faces = [
    (0,1,5),(0,5,4),
    (1,2,6),(1,6,5),
    (2,3,7),(2,7,6),
    (3,0,4),(3,4,7),
    (8,9,12),
    (9,10,12),
    (10,11,12),
    (11,8,12)
]

write_obj("mushroom.obj", mush_verts, mush_faces)

# 6. Log – flipped all faces to correct outward normals
log_verts = [
    (-1,-0.2,-0.2), (1,-0.2,-0.2), (1,0.2,-0.2), (-1,0.2,-0.2),
    (-1,-0.2,0.2),  (1,-0.2,0.2),  (1,0.2,0.2),  (-1,0.2,0.2)
]

log_faces = [
    (0,2,1), (0,3,2),     # -Z cap
    (4,5,6), (4,6,7),     # +Z cap
    (0,5,4), (0,1,5),     # bottom
    (1,6,5), (1,2,6),     # right
    (2,7,6), (2,3,7),     # top
    (3,4,7), (3,0,4)      # left
]

write_obj("log.obj", log_verts, log_faces)

# 7. Bush – fixed bottom faces (normals now point downward)
bush_verts = [
    (0,0.8,0),
    (0.8,0,0),
    (-0.8,0,0),
    (0,0,0.8),
    (0,0,-0.8),
    (0,-0.4,0)
]

bush_faces = [
    (0,1,3),
    (0,3,2),
    (0,2,4),
    (0,4,1),
    (5,1,3),   # corrected bottom
    (5,3,2),
    (5,2,4),
    (5,4,1)
]

write_obj("bush.obj", bush_verts, bush_faces)

# 8. Crate – flipped all faces (same topology as log)
crate_verts = [
    (-0.5,-0.5,-0.5),(0.5,-0.5,-0.5),(0.5,0.5,-0.5),(-0.5,0.5,-0.5),
    (-0.5,-0.5,0.5),(0.5,-0.5,0.5),(0.5,0.5,0.5),(-0.5,0.5,0.5)
]

crate_faces = [
    (0,2,1), (0,3,2),
    (4,5,6), (4,6,7),
    (0,5,4), (0,1,5),
    (1,6,5), (1,2,6),
    (2,7,6), (2,3,7),
    (3,4,7), (3,0,4)
]

write_obj("crate.obj", crate_verts, crate_faces)

# 9. Crystal Cluster (added a seed for reproducibility)
random.seed(123)  # reproducible clusters
cluster_verts = []
cluster_faces = []

for ox in (-0.5, 0, 0.5):
    base = len(cluster_verts)
    cluster_verts += [
        (ox-0.15,0,-0.15),
        (ox+0.15,0,-0.15),
        (ox+0.15,0,0.15),
        (ox-0.15,0,0.15),
        (ox,random.uniform(0.7,1.3),0)
    ]
    cluster_faces += [
        (base,base+1,base+4),
        (base+1,base+2,base+4),
        (base+2,base+3,base+4),
        (base+3,base,base+4)
    ]

write_obj("crystal_cluster.obj", cluster_verts, cluster_faces)

# 10. Coin – uses the corrected crate faces
coin_verts = [
    (-0.3,-0.05,-0.3),(0.3,-0.05,-0.3),(0.3,0.05,-0.3),(-0.3,0.05,-0.3),
    (-0.3,-0.05,0.3),(0.3,-0.05,0.3),(0.3,0.05,0.3),(-0.3,0.05,0.3)
]

coin_faces = crate_faces   # now correctly wound

write_obj("coin.obj", coin_verts, coin_faces)
