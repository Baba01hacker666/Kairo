# Kairo Engine: Agent Instructions & Lessons Learned 🤖

This file serves as a knowledge base and instruction manual for future AI agents working on the Kairo Engine. If you are an AI assistant reading this, **follow these rules carefully** to avoid repeating past mistakes.

---

## 🏗️ Architectural Rules

1. **The Hybrid Engine Architecture**
   - Game logic, physics, and collisions should be written in **Go WebAssembly** (`examples/go-fox/main.go`).
   - Rendering, cameras, lighting, and animations should be written in **TypeScript / Three.js** (`examples/go-fox/main.ts`).
   - The two systems communicate by passing serialized JSON state (e.g., `window.kairo.getEntities()`). 

2. **WebAssembly Distribution**
   - The `wasm_exec.js` runtime script MUST be placed in `public/wasm/wasm_exec.js` so Vite properly serves it at the root during production builds.
   - When referencing `wasm_exec.js` in an HTML file within an example folder (e.g., `examples/go-fox/index.html`), use relative paths (e.g., `../../wasm/wasm_exec.js`) to ensure it works on both localhost and GitHub Pages without breaking.

3. **Asset Resolution (Vite & GitHub Pages)**
   - When loading assets like `.glb` models from the `public/` directory inside a TypeScript file, you **MUST** use `(import.meta as any).env.BASE_URL + 'models/FileName.glb'`. 
   - Failing to prepend the `BASE_URL` will result in 404 errors when deployed to GitHub Pages, because the repository name (`/Kairo/`) needs to prefix the asset path.

---

## 🎥 Three.js & Rendering Rules

1. **Third-Person Camera (OrbitControls)**
   - **DO NOT** attach the camera's position to the player's rotation (Quaternion) if you are also using `OrbitControls`. This creates a terrible feedback loop where the camera chases the player's back, forcing the player to spin wildly when trying to move.
   - **DO** decouple them: Let the player rotate freely. Update the camera by hard-locking `controls.target` to the player's XYZ position, and move `camera.position` by the exact same delta.
   - Always set `controls.minDistance` to a reasonable value (e.g., `4`) to prevent the camera from zooming inside the player's mesh (First-Person clipping).

2. **Physically Based Rendering (PBR)**
   - If using `MeshStandardMaterial` or `GLTFLoader` (which uses standard PBR materials by default), you **MUST** provide adequate lighting.
   - Do **NOT** use an empty `PMREMGenerator` environment map. It will cause all PBR models to render pitch black.
   - If you do not have an HDRI environment map, rely on a strong `AmbientLight` and a `DirectionalLight` (with shadows enabled) to illuminate the models.

3. **Coordinate Systems & Math**
   - Three.js uses a right-handed coordinate system. Forward for the camera is generally `-Z`.
   - Go's `math.Atan2(y, x)` works identically to JavaScript's `Math.atan2(y, x)`. Remember that `y` comes first.
   - When extracting camera movement directions, use `camera.getWorldDirection()` and cross it with the global `UP` vector `(0, 1, 0)` to get the `RIGHT` vector. Use these vectors to apply WASD inputs relative to the camera's perspective.

---

## 🏃 Workflow

1. **Go WASM Compilation**
   - Every time you modify `.go` files in an example, you must recompile it to the `public/wasm` directory. Example:
     `GOOS=js GOARCH=wasm go build -o ../../public/wasm/go-fox.wasm main.go`

2. **Testing**
   - Run `npm run dev` to test locally.
   - Visually confirm changes using the frontend.
   - **Never run arbitrary installation commands (e.g. puppeteer)** unless explicitly requested. 

3. **Commit Messages**
   - Use conventional commits (`feat:`, `fix:`, `docs:`) and push directly to `main` so the GitHub Actions deployment workflow can pick it up.
