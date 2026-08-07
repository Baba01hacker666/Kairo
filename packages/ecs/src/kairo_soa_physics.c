#define MAX_ENTITIES 60000
#define HASH_SIZE 131072
#define HASH_MASK 131071
#define MAX_CELL_CAP 32

float posX[MAX_ENTITIES];
float posY[MAX_ENTITIES];
float posZ[MAX_ENTITIES];

float velX[MAX_ENTITIES];
float velY[MAX_ENTITIES];
float velZ[MAX_ENTITIES];

float radius[MAX_ENTITIES];
unsigned char active[MAX_ENTITIES];

int gridCount[HASH_SIZE];
unsigned int gridTag[HASH_SIZE];
int cellEntities[HASH_SIZE][MAX_CELL_CAP];

short cellCx[HASH_SIZE];
short cellCy[HASH_SIZE];
short cellCz[HASH_SIZE];

int occupiedCells[MAX_ENTITIES];
int occupiedCount = 0;

unsigned int frameId = 1;
float invCellSize = 0.08333333f; // Default Cell size 12.0m

const int OFF_X[14] = {0, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 1};
const int OFF_Y[14] = {0, -1,-1,-1,  0, 0, 0,  1, 1, 1,  1, 1, 1, 0};
const int OFF_Z[14] = {0,  1, 1, 1,  1, 1, 1,  1, 1, 1,  0, 0, 0, 0};

void set_cell_size(float cellSize) {
    if (cellSize > 0.001f) {
        invCellSize = 1.0f / cellSize;
    }
}

float* get_pos_x() { return posX; }
float* get_pos_y() { return posY; }
float* get_pos_z() { return posZ; }
float* get_vel_x() { return velX; }
float* get_vel_y() { return velY; }
float* get_vel_z() { return velZ; }
float* get_radius() { return radius; }
unsigned char* get_active() { return active; }

void spawn_entity(int id, float px, float py, float pz, float vx, float vy, float vz, float r) {
    if (id < 0 || id >= MAX_ENTITIES) return;
    posX[id] = px;
    posY[id] = py;
    posZ[id] = pz;
    velX[id] = vx;
    velY[id] = vy;
    velZ[id] = vz;
    radius[id] = r;
    active[id] = 1;
}

void clear_entities() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        active[i] = 0;
    }
}

static inline unsigned int hash_cell(int cx, int cy, int cz) {
    return (((unsigned int)cx * 73856093u) ^ ((unsigned int)cy * 19349663u) ^ ((unsigned int)cz * 83492791u)) & HASH_MASK;
}

static inline void resolve_collision(int a, int b, int* collisionCount) {
    float minDist = radius[a] + radius[b];

    float delX = posX[b] - posX[a];
    if (delX >= minDist || delX <= -minDist) return;

    float delY = posY[b] - posY[a];
    if (delY >= minDist || delY <= -minDist) return;

    float delZ = posZ[b] - posZ[a];
    if (delZ >= minDist || delZ <= -minDist) return;

    float distSq = delX * delX + delY * delY + delZ * delZ;

    if (distSq < minDist * minDist && distSq > 0.0001f) {
        (*collisionCount)++;
        float dist = __builtin_sqrtf(distSq);
        float nx = delX / dist;
        float ny = delY / dist;
        float nz = delZ / dist;

        float overlap = 0.5f * (minDist - dist);
        posX[a] -= nx * overlap;
        posY[a] -= ny * overlap;
        posZ[a] -= nz * overlap;
        posX[b] += nx * overlap;
        posY[b] += ny * overlap;
        posZ[b] += nz * overlap;

        float kx = velX[a] - velX[b];
        float ky = velY[a] - velY[b];
        float kz = velZ[a] - velZ[b];
        float p = nx * kx + ny * ky + nz * kz;

        velX[a] -= p * nx;
        velY[a] -= p * ny;
        velZ[a] -= p * nz;
        velX[b] += p * nx;
        velY[b] += p * ny;
        velZ[b] += p * nz;
    }
}

int update(int count, float dt, float boundSize) {
    if (count > MAX_ENTITIES) count = MAX_ENTITIES;
    
    frameId++;
    if (frameId == 0xFFFFFFFF) {
        for (int i = 0; i < HASH_SIZE; i++) gridTag[i] = 0;
        frameId = 1;
    }

    float invCell = invCellSize;
    occupiedCount = 0;

    // Step 1: Position Integration & Cell-Centric Insertion
    for (int i = 0; i < count; i++) {
        if (!active[i]) continue;

        float x = posX[i] + velX[i] * dt;
        float y = posY[i] + velY[i] * dt;
        float z = posZ[i] + velZ[i] * dt;

        if (x < -boundSize) { x = -boundSize; velX[i] = -velX[i]; }
        else if (x > boundSize) { x = boundSize; velX[i] = -velX[i]; }

        if (y < -boundSize) { y = -boundSize; velY[i] = -velY[i]; }
        else if (y > boundSize) { y = boundSize; velY[i] = -velY[i]; }

        if (z < -boundSize) { z = -boundSize; velZ[i] = -velZ[i]; }
        else if (z > boundSize) { z = boundSize; velZ[i] = -velZ[i]; }

        posX[i] = x;
        posY[i] = y;
        posZ[i] = z;

        int cx = (int)((x + 500.0f) * invCell);
        int cy = (int)((y + 500.0f) * invCell);
        int cz = (int)((z + 500.0f) * invCell);

        unsigned int key = hash_cell(cx, cy, cz);

        if (gridTag[key] != frameId) {
            gridTag[key] = frameId;
            gridCount[key] = 0;
            cellCx[key] = (short)cx;
            cellCy[key] = (short)cy;
            cellCz[key] = (short)cz;
            occupiedCells[occupiedCount++] = key;
        }

        int c = gridCount[key];
        if (c < MAX_CELL_CAP) {
            cellEntities[key][c] = i;
            gridCount[key] = c + 1;
        }
    }

    // Step 2: Zero-GC Cell-Centric Collision Resolution
    int collisionCount = 0;

    for (int occ = 0; occ < occupiedCount; occ++) {
        int keyA = occupiedCells[occ];
        int countA = gridCount[keyA];
        int cx = cellCx[keyA];
        int cy = cellCy[keyA];
        int cz = cellCz[keyA];

        // Self-collisions
        for (int i = 0; i < countA; i++) {
            int a = cellEntities[keyA][i];
            for (int j = i + 1; j < countA; j++) {
                int b = cellEntities[keyA][j];
                resolve_collision(a, b, &collisionCount);
            }
        }

        // 13 Forward Neighbor Cells
        for (int k = 1; k < 14; k++) {
            int ncx = cx + OFF_X[k];
            int ncy = cy + OFF_Y[k];
            int ncz = cz + OFF_Z[k];

            unsigned int keyB = hash_cell(ncx, ncy, ncz);

            if (gridTag[keyB] == frameId) {
                int countB = gridCount[keyB];
                for (int i = 0; i < countA; i++) {
                    int a = cellEntities[keyA][i];
                    for (int j = 0; j < countB; j++) {
                        int b = cellEntities[keyB][j];
                        resolve_collision(a, b, &collisionCount);
                    }
                }
            }
        }
    }

    return collisionCount;
}

void write_instance_matrices(float* outMatrixArray, int count) {
    int idx = 0;
    for (int i = 0; i < count; i++) {
        float d = radius[i] * 2.0f;
        outMatrixArray[idx]      = d;
        outMatrixArray[idx + 1]  = 0.0f;
        outMatrixArray[idx + 2]  = 0.0f;
        outMatrixArray[idx + 3]  = 0.0f;

        outMatrixArray[idx + 4]  = 0.0f;
        outMatrixArray[idx + 5]  = d;
        outMatrixArray[idx + 6]  = 0.0f;
        outMatrixArray[idx + 7]  = 0.0f;

        outMatrixArray[idx + 8]  = 0.0f;
        outMatrixArray[idx + 9]  = 0.0f;
        outMatrixArray[idx + 10] = d;
        outMatrixArray[idx + 11] = 0.0f;

        outMatrixArray[idx + 12] = posX[i];
        outMatrixArray[idx + 13] = posY[i];
        outMatrixArray[idx + 14] = posZ[i];
        outMatrixArray[idx + 15] = 1.0f;
        idx += 16;
    }
}
