// Raylib C/C++ Engine Implementation for Kairo Engine
#include "raylib.h"
#include <cmath>
#include <cstdio>

static int winWidth = 1024;
static int winHeight = 768;
static bool shouldCloseFlag = false;
static int targetFpsVal = 60;

void InitWindow(int width, int height, const char *title) {
    winWidth = width;
    winHeight = height;
    shouldCloseFlag = false;
}

bool WindowShouldClose(void) {
    return shouldCloseFlag;
}

void CloseWindow(void) {
    shouldCloseFlag = true;
}

void SetTargetFPS(int fps) {
    if (fps > 0) targetFpsVal = fps;
}

int GetFPS(void) {
    return 60;
}

float GetFrameTime(void) {
    return 1.0f / 60.0f;
}

double GetTime(void) {
    return 0.0;
}

int GetScreenWidth(void) {
    return winWidth;
}

int GetScreenHeight(void) {
    return winHeight;
}

void BeginDrawing(void) {}
void EndDrawing(void) {}
void ClearBackground(Color color) {}
void BeginMode3D(Camera3D camera) {}
void EndMode3D(void) {}

void DrawPixel(int posX, int posY, Color color) {}
void DrawLine(int startPosX, int startPosY, int endPosX, int endPosY, Color color) {}
void DrawLineV(Vector2 startPos, Vector2 endPos, Color color) {}
void DrawLineEx(Vector2 startPos, Vector2 endPos, float thick, Color color) {}
void DrawRectangle(int posX, int posY, int width, int height, Color color) {}
void DrawRectangleLines(int posX, int posY, int width, int height, Color color) {}
void DrawCircle(int centerX, int centerY, float radius, Color color) {}
void DrawCircleV(Vector2 center, float radius, Color color) {}
void DrawCircleLines(int centerX, int centerY, float radius, Color color) {}
void DrawTriangle(Vector2 v1, Vector2 v2, Vector2 v3, Color color) {}

void DrawCube(Vector3 position, float width, float height, float length, Color color) {}
void DrawCubeWires(Vector3 position, float width, float height, float length, Color color) {}
void DrawSphere(Vector3 centerPos, float radius, Color color) {}
void DrawSphereWires(Vector3 centerPos, float radius, int rings, int slices, Color color) {}
void DrawCylinder(Vector3 position, float radiusTop, float radiusBottom, float height, int slices, Color color) {}
void DrawGrid(int slices, float spacing) {}
void DrawRay(Ray ray, Color color) {}
void DrawBoundingBox(BoundingBox box, Color color) {}

void DrawText(const char *text, int posX, int posY, int fontSize, Color color) {}
void DrawFPS(int posX, int posY) {}

bool IsKeyDown(int key) { return false; }
bool IsKeyPressed(int key) { return false; }
bool IsMouseButtonDown(int button) { return false; }
Vector2 GetMousePosition(void) { return (Vector2){0.0f, 0.0f}; }
