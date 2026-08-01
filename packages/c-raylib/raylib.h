// Raylib C/C++ Header Wrapper for Kairo Engine
// Provides native C/C++ Raylib API compatibility for WebAssembly & Desktop

#ifndef KAIRO_RAYLIB_H
#define KAIRO_RAYLIB_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>
#include <stdint.h>

// Color Structure
typedef struct Color {
    unsigned char r;
    unsigned char g;
    unsigned char b;
    unsigned char a;
} Color;

// Vector2 Structure
typedef struct Vector2 {
    float x;
    float y;
} Vector2;

// Vector3 Structure
typedef struct Vector3 {
    float x;
    float y;
    float z;
} Vector3;

// Vector4 Structure
typedef struct Vector4 {
    float x;
    float y;
    float z;
    float w;
} Vector4;

// Matrix Structure
typedef struct Matrix {
    float m0, m4, m8, m12;
    float m1, m5, m9, m13;
    float m2, m6, m10, m14;
    float m3, m7, m11, m15;
} Matrix;

// Camera3D Structure
typedef struct Camera3D {
    Vector3 position;
    Vector3 target;
    Vector3 up;
    float fov;
    int projection;
} Camera3D;

// Ray Structure
typedef struct Ray {
    Vector3 position;
    Vector3 direction;
} Ray;

// BoundingBox Structure
typedef struct BoundingBox {
    Vector3 min;
    Vector3 max;
} BoundingBox;

// Predefined Raylib Colors
static const Color LIGHTGRAY = {200, 200, 200, 255};
static const Color GRAY      = {130, 130, 130, 255};
static const Color DARKGRAY  = {80, 80, 80, 255};
static const Color YELLOW    = {253, 249, 0, 255};
static const Color GOLD      = {255, 203, 0, 255};
static const Color ORANGE    = {255, 161, 0, 255};
static const Color PINK      = {255, 109, 194, 255};
static const Color RED       = {230, 41, 55, 255};
static const Color MAROON    = {190, 33, 55, 255};
static const Color GREEN     = {0, 228, 48, 255};
static const Color LIME      = {0, 158, 47, 255};
static const Color SKYBLUE   = {102, 191, 255, 255};
static const Color BLUE      = {0, 121, 241, 255};
static const Color PURPLE    = {200, 122, 255, 255};
static const Color WHITE     = {255, 255, 255, 255};
static const Color BLACK     = {0, 0, 0, 255};
static const Color RAYWHITE  = {245, 245, 245, 255};
static const Color CYAN      = {0, 255, 255, 255};

// Window & Core Functions
void InitWindow(int width, int height, const char *title);
bool WindowShouldClose(void);
void CloseWindow(void);
void SetTargetFPS(int fps);
int GetFPS(void);
float GetFrameTime(void);
double GetTime(void);
int GetScreenWidth(void);
int GetScreenHeight(void);

// Drawing Functions
void BeginDrawing(void);
void EndDrawing(void);
void ClearBackground(Color color);
void BeginMode3D(Camera3D camera);
void EndMode3D(void);

// 2D Shapes
void DrawPixel(int posX, int posY, Color color);
void DrawLine(int startPosX, int startPosY, int endPosX, int endPosY, Color color);
void DrawLineV(Vector2 startPos, Vector2 endPos, Color color);
void DrawLineEx(Vector2 startPos, Vector2 endPos, float thick, Color color);
void DrawRectangle(int posX, int posY, int width, int height, Color color);
void DrawRectangleLines(int posX, int posY, int width, int height, Color color);
void DrawCircle(int centerX, int centerY, float radius, Color color);
void DrawCircleV(Vector2 center, float radius, Color color);
void DrawCircleLines(int centerX, int centerY, float radius, Color color);
void DrawTriangle(Vector2 v1, Vector2 v2, Vector2 v3, Color color);

// 3D Shapes
void DrawCube(Vector3 position, float width, float height, float length, Color color);
void DrawCubeWires(Vector3 position, float width, float height, float length, Color color);
void DrawSphere(Vector3 centerPos, float radius, Color color);
void DrawSphereWires(Vector3 centerPos, float radius, int rings, int slices, Color color);
void DrawCylinder(Vector3 position, float radiusTop, float radiusBottom, float height, int slices, Color color);
void DrawGrid(int slices, float spacing);
void DrawRay(Ray ray, Color color);
void DrawBoundingBox(BoundingBox box, Color color);

// Text Functions
void DrawText(const char *text, int posX, int posY, int fontSize, Color color);
void DrawFPS(int posX, int posY);

// Input Functions
bool IsKeyDown(int key);
bool IsKeyPressed(int key);
bool IsMouseButtonDown(int button);
Vector2 GetMousePosition(void);

#ifdef __cplusplus
}
#endif

#endif // KAIRO_RAYLIB_H
