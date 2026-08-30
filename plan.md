1. **Identify Bottleneck**: In `packages/renderer/src/ShaderMaterial.ts`, `Object.entries(this.uniforms)` is called inside `updateThreeUniforms`, which is part of the `toThreeMaterial()` update cycle often run per-frame when rendering or syncing custom shaders. `Object.entries()` creates an array allocation on every call, generating GC churn.
2. **Optimize `ShaderMaterial.ts`**:
   - Replace `for (const [key, def] of Object.entries(this.uniforms))` with a standard `for...in` loop or by iterating over pre-cached keys, preventing object allocation in the hot loop.
   - Example fix:
     ```typescript
     for (const key in this.uniforms) {
       const def = this.uniforms[key];
       // ...
     }
     ```
3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
4. **Verify and Submit**: Ensure tests run fine, and submit the changes with a learning log in `bolt.md`.
