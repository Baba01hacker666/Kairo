import math

vertices = []
faces = []

def add_vertex(x, y, z):
    vertices.append((x, y, z))
    return len(vertices)

# Trunk (Cylinder/Hexagon)
trunk_height = 6.0
trunk_radius = 0.8
trunk_base_y = 0.0
sides = 6

# Base and Top vertices for trunk
for i in range(sides):
    angle = 2 * math.pi * i / sides
    x = math.cos(angle) * trunk_radius
    z = math.sin(angle) * trunk_radius
    add_vertex(x, trunk_base_y, z)

for i in range(sides):
    angle = 2 * math.pi * i / sides
    x = math.cos(angle) * (trunk_radius * 0.7) # taper
    z = math.sin(angle) * (trunk_radius * 0.7)
    add_vertex(x, trunk_height, z)

# Trunk Faces
for i in range(sides):
    next_i = (i + 1) % sides
    # Quad for each side
    faces.append((i+1, next_i+1, next_i+1+sides, i+1+sides))

# Canopy (Icosahedron)
canopy_y = trunk_height + 1.0
canopy_radius = 4.5

t = (1.0 + math.sqrt(5.0)) / 2.0
ico_verts = [
    (-1,  t,  0), ( 1,  t,  0), (-1, -t,  0), ( 1, -t,  0),
    ( 0, -1,  t), ( 0,  1,  t), ( 0, -1, -t), ( 0,  1, -t),
    ( t,  0, -1), ( t,  0,  1), (-t,  0, -1), (-t,  0,  1)
]

ico_faces = [
    (0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
    (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
    (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
    (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)
]

canopy_start_idx = len(vertices)
for v in ico_verts:
    # normalize and scale
    l = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    nx = (v[0]/l) * canopy_radius
    ny = (v[1]/l) * (canopy_radius * 0.8) + canopy_y
    nz = (v[2]/l) * canopy_radius
    add_vertex(nx, ny, nz)

canopy_faces_out = []
for f in ico_faces:
    # reverse winding to match front-face orientation if needed, or keep standard
    canopy_faces_out.append((f[0]+1+canopy_start_idx, f[1]+1+canopy_start_idx, f[2]+1+canopy_start_idx))

with open("tree.obj", "w") as f:
    for v in vertices:
        f.write(f"v {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}\n")
    for face in faces:
        f.write("f " + " ".join(str(idx) for idx in face) + "\n")

with open("canopy.obj", "w") as f:
    # To keep indices correct for canopy only, we just output it as a separate OBJ
    for v in vertices[canopy_start_idx:]:
        f.write(f"v {v[0]:.3f} {v[1]:.3f} {v[2]:.3f}\n")
    for face in ico_faces:
        f.write("f " + " ".join(str(idx+1) for idx in face) + "\n")
