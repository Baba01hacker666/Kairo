export interface CompilationOptions {
    minifyShaders?: boolean;
    prebakeSpatialHash?: boolean;
    compressBinaryLevels?: boolean;
    quantizeMeshBuffers?: boolean;
    targetPlatform?: 'web' | 'mobile' | 'wasm';
}
export interface CompiledLevelBundle {
    id: number;
    name: string;
    world: number;
    binaryPayload: string;
    spatialHashBake: Array<{
        key: string;
        elementIds: string[];
    }>;
    checksum: number;
}
export interface CompilationResult {
    success: boolean;
    compiledAt: string;
    targetPlatform: string;
    levelsCompiled: number;
    totalOriginalSizeBytes: number;
    totalCompiledSizeBytes: number;
    compressionRatio: string;
    estimatedMemorySavingsPercent: number;
    compiledLevels: CompiledLevelBundle[];
    logs: string[];
}
export declare class EngineCompiler {
    /**
     * Ahead-of-Time (AOT) Game & Level Compiler
     * Compiles, optimizes, bakes spatial collision hashes, and minifies levels/assets for maximum runtime execution speed.
     */
    static compileGame(levels: any[], options?: CompilationOptions): CompilationResult;
    /**
     * Minify GLSL or WGSL shader code strings at compile time
     */
    static minifyShader(shaderCode: string): string;
    /**
     * Ahead-of-Time EasyScript AST Compiler & Syntax Optimizer
     */
    static compileEasyScript(scriptCode: string): {
        compiledCode: string;
        astStats: {
            statements: number;
            helperCalls: number;
        };
    };
    /**
     * Quantize 32-bit Float vertex position buffer into compressed 16-bit Uint16 array
     */
    static quantizeGeometryBuffers(positions: Float32Array): Uint16Array;
    /**
     * Compile standalone single-file HTML5 playable game bundle
     */
    static compileStandaloneGameHtml(title: string, levels: any[], options?: CompilationOptions): string;
}
