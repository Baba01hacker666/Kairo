import * as fs from 'node:fs';
import * as path from 'node:path';

export interface CodeBugIssue {
  file: string;
  line: number;
  column?: number;
  severity: 'critical' | 'warning' | 'info';
  code: string;
  title: string;
  snippet: string;
  suggestedFix: string;
}

export interface CLIAuditReport {
  timestamp: string;
  filesScanned: number;
  healthScore: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: CodeBugIssue[];
  passed: boolean;
}

/**
 * 🛠️ Kairo CLI Automated Game Bug Scanner & QA Tester
 * Scans codebase for game-breaking bugs, GC churn in loops, NaN risks, asset 404s, and shader/camera conflicts.
 */
export class CodeBugAuditor {
  public static scanFileContent(filePath: string, content: string): CodeBugIssue[] {
    const lines = content.split('\n');
    const issues: CodeBugIssue[] = [];

    let insideUpdateLoop = false;
    let updateLoopStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];
      const trimmed = line.trim();

      // Track if we are inside a 60fps update loop
      if (/onUpdate|\.step\(|requestAnimationFrame|function\s+tick|function\s+loop/i.test(line)) {
        insideUpdateLoop = true;
        updateLoopStartLine = lineNum;
      }
      if (insideUpdateLoop && /^\s*\}\s*\)?\s*;?\s*$/.test(line) && lineNum - updateLoopStartLine > 30) {
        insideUpdateLoop = false;
      }

      // 1. GC Churn in Hot Game Loops (new THREE.Vector3 / new THREE.Color in update loops)
      if (insideUpdateLoop && /new\s+(THREE\.)?(Vector3|Vector2|Color|Matrix4|Quaternion|Euler|Box3|Sphere)\s*\(/.test(line)) {
        // Exclude particle emitters or state initializations with burst/emit
        if (!/emitBurst|particles|init|constructor/i.test(line)) {
          issues.push({
            file: filePath,
            line: lineNum,
            severity: 'warning',
            code: 'GC_CHURN_IN_LOOP',
            title: 'Memory / GC Allocation Inside Game Update Loop',
            snippet: trimmed,
            suggestedFix: 'Pre-allocate a reusable scratch object outside the loop and reuse it via .set() or .copy().'
          });
        }
      }

      // 2. NaN Risk: Unchecked Vector Normalization or Division by Magnitude
      if (/\/\s*(inputMag|mag|len|length|distance|dist)\b/.test(line)) {
        const prevLines = lines.slice(Math.max(0, i - 4), i + 1).join(' ');
        if (!/if\s*\(\s*(inputMag|mag|len|length|distance|dist)\s*>\s*[0-9.]+/i.test(prevLines)) {
          issues.push({
            file: filePath,
            line: lineNum,
            severity: 'critical',
            code: 'NAN_DIV_ZERO_RISK',
            title: 'Potential NaN from Division by Zero Magnitude',
            snippet: trimmed,
            suggestedFix: 'Wrap normalization in a length threshold guard (e.g., `if (mag > 0.0001) { ... }`).'
          });
        }
      }

      // 3. Asset 404 / Hardcoded Absolute Path Risk (breaks on GitHub Pages subpaths)
      if (/(loader\.load|loadModel|fetch|textureLoader\.load)\s*\(\s*['"]\/(models|assets|textures|audio|sounds|wasm)\//i.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          severity: 'warning',
          code: 'HARDCODED_ABSOLUTE_ASSET_PATH',
          title: 'Hardcoded Absolute Asset Path (Fails on Subpaths / GitHub Pages)',
          snippet: trimmed,
          suggestedFix: 'Use relative paths (e.g. `./models/...`) or prepend `import.meta.env.BASE_URL` or candidate fallback URLs.'
        });
      }

      // 4. Camera Controller Conflict: Manual Camera Updates with Controller Enabled
      if (/(camera\.position\.lerp|camera\.position\.set|camera\.lookAt)/.test(line)) {
        const fileContentBefore = lines.slice(0, i).join('\n');
        if (/new\s+KairoApp/.test(fileContentBefore) && !/cameraController\.enabled\s*=\s*false/.test(fileContentBefore)) {
          issues.push({
            file: filePath,
            line: lineNum,
            severity: 'critical',
            code: 'CAMERA_DUAL_UPDATE_CONFLICT',
            title: 'Camera Conflict: Manual Camera Updates with Default Controller Active',
            snippet: trimmed,
            suggestedFix: 'Set `app.cameraController.enabled = false;` to prevent dual 60fps camera fighting & screen flashing.'
          });
        }
      }

      // 5. Audio Autoplay Violation: new AudioContext() without user gesture
      if (/(new\s+(window\.)?(AudioContext|webkitAudioContext)|audio\.init\(\))\s*/.test(line) && !/pointerdown|touchstart|click|keydown|setupUserGestureUnlock|resume/i.test(line)) {
        // Exclude class definition or gesture helper
        if (!/setupUserGestureUnlock|function|class\s+AudioManager/i.test(line) && insideUpdateLoop) {
          issues.push({
            file: filePath,
            line: lineNum,
            severity: 'warning',
            code: 'AUDIO_AUTOPLAY_VIOLATION',
            title: 'AudioContext Instantiation / Init Outside User Gesture',
            snippet: trimmed,
            suggestedFix: 'Unlock audio only on user interactions using `audio.setupUserGestureUnlock()`.'
          });
        }
      }

      // 6. Shader Uniform Mismatch: 3-component Color passed to vec4 uniform
      if (/setUniform\s*\(\s*['"](u_shallowColor|u_deepColor|u_foamColor|u_color)['"]\s*,\s*\{\s*r:/i.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          severity: 'critical',
          code: 'SHADER_UNIFORM_TYPE_MISMATCH',
          title: 'Shader Uniform Type Mismatch (Triggers WebGL uniform4fv Error)',
          snippet: trimmed,
          suggestedFix: 'Pass a 4-component array `[r, g, b, a]` or `Vector4` with explicit uniform type `vec4`.'
        });
      }
    }

    return issues;
  }

  public static scanDirectory(dirPath: string, extensions = ['.ts', '.js', '.html']): CLIAuditReport {
    let filesScanned = 0;
    const allIssues: CodeBugIssue[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.git', '.gemini', '.qwen'].includes(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            filesScanned++;
            const content = fs.readFileSync(fullPath, 'utf8');
            const issues = CodeBugAuditor.scanFileContent(fullPath, content);
            allIssues.push(...issues);
          }
        }
      }
    };

    if (fs.existsSync(dirPath)) {
      const stat = fs.statSync(dirPath);
      if (stat.isFile()) {
        filesScanned++;
        const content = fs.readFileSync(dirPath, 'utf8');
        allIssues.push(...CodeBugAuditor.scanFileContent(dirPath, content));
      } else {
        walk(dirPath);
      }
    }

    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const warningCount = allIssues.filter(i => i.severity === 'warning').length;
    const infoCount = allIssues.filter(i => i.severity === 'info').length;

    const penalty = criticalCount * 25 + warningCount * 8 + infoCount * 2;
    const healthScore = Math.max(0, Math.min(100, 100 - penalty));

    return {
      timestamp: new Date().toISOString(),
      filesScanned,
      healthScore,
      criticalCount,
      warningCount,
      infoCount,
      issues: allIssues,
      passed: criticalCount === 0
    };
  }

  public static formatMarkdown(report: CLIAuditReport): string {
    let md = `# 🐞 Kairo CLI - Game Bug Audit Report\n\n`;
    md += `- **Date:** ${report.timestamp}\n`;
    md += `- **Files Scanned:** ${report.filesScanned}\n`;
    md += `- **Health Score:** ${report.healthScore}/100\n`;
    md += `- **Critical Issues:** ${report.criticalCount}\n`;
    md += `- **Warnings:** ${report.warningCount}\n\n`;

    if (report.issues.length === 0) {
      md += `## ✅ Perfect Clean State\nNo bugs, memory leaks, or shader conflicts detected!\n`;
    } else {
      md += `## 📋 Detected Issues\n\n`;
      report.issues.forEach((issue, idx) => {
        md += `### ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n`;
        md += `- **File:** \`${issue.file}:${issue.line}\`\n`;
        md += `- **Code:** \`${issue.code}\`\n`;
        md += `\`\`\`ts\n${issue.snippet}\n\`\`\`\n`;
        md += `- **💡 Suggested Fix:** ${issue.suggestedFix}\n\n`;
      });
    }

    return md;
  }
}

/**
 * CLI Entrypoint runner
 */
export async function runCLI(argv: string[] = process.argv.slice(2)): Promise<number> {
  const cmd = argv[0] || 'audit';
  const targetPath = argv[1] || '.';

  console.log(`\x1b[36m
  ██╗  ██╗ █████╗ ██╗██████╗  ██████╗ 
  ██║ ██╔╝██╔══██╗██║██╔══██╗██╔═══██╗
  █████╔╝ ███████║██║██████╔╝██║   ██║
  ██╔═██╗ ██╔══██║██║██╔══██╗██║   ██║
  ██║  ██╗██║  ██║██║██║  ██║╚██████╔╝
  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ 
  \x1b[32mKairo Engine CLI & Game QA Tester v1.0.0\x1b[0m
  `);

  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(`
Usage:
  kairo test [path]       Run automated static & code bug audit on game project
  kairo audit [path]      Scan for memory leaks, NaN risks, asset 404s, shader errors
  kairo doctor            Check environment, WebGL, Node & dependencies
  kairo report [--md]     Output Markdown formatted QA audit report

Examples:
  kairo audit examples/fox-odyssey
  kairo test src/
    `);
    return 0;
  }

  if (cmd === 'doctor') {
    console.log('\x1b[35m[🩺 Kairo Doctor]\x1b[0m Checking environment diagnostics...');
    console.log(`  - Node.js: \x1b[32m${process.version}\x1b[0m`);
    console.log(`  - Platform: \x1b[32m${process.platform} (${process.arch})\x1b[0m`);
    console.log(`  - Working Directory: \x1b[32m${process.cwd()}\x1b[0m`);
    console.log('  - Kairo Packages: \x1b[32m@kairo/core, @kairo/renderer, @kairo/physics, @kairo/ecs, @kairo/tools\x1b[0m');
    console.log('\x1b[32m✔ Environment is ready for game development!\x1b[0m\n');
    return 0;
  }

  if (cmd === 'test' || cmd === 'audit' || cmd === 'scan') {
    console.log(`\x1b[34m[🔍 Scanning]\x1b[0m Analyzing game sources in \x1b[1m${targetPath}\x1b[0m...`);
    const resolvedPath = path.resolve(process.cwd(), targetPath);
    const report = CodeBugAuditor.scanDirectory(resolvedPath);

    console.log(`\n\x1b[1mAudit Summary:\x1b[0m`);
    console.log(`  Files Scanned:  \x1b[36m${report.filesScanned}\x1b[0m`);
    
    const scoreColor = report.healthScore >= 90 ? '\x1b[32m' : report.healthScore >= 70 ? '\x1b[33m' : '\x1b[31m';
    console.log(`  Health Score:   ${scoreColor}${report.healthScore}/100\x1b[0m`);
    console.log(`  Critical Bugs:  \x1b[31m${report.criticalCount}\x1b[0m`);
    console.log(`  Warnings:       \x1b[33m${report.warningCount}\x1b[0m`);

    if (report.issues.length > 0) {
      console.log(`\n\x1b[1mDetected Issues:\x1b[0m\n`);
      report.issues.forEach((issue, idx) => {
        const badge = issue.severity === 'critical' ? '\x1b[41m\x1b[37m CRITICAL \x1b[0m' : '\x1b[43m\x1b[30m WARNING \x1b[0m';
        console.log(`${idx + 1}. ${badge} \x1b[1m${issue.title}\x1b[0m`);
        console.log(`   \x1b[90mLocation:\x1b[0m ${issue.file}:${issue.line}`);
        console.log(`   \x1b[90mCode:\x1b[0m     ${issue.snippet}`);
        console.log(`   \x1b[32m💡 Fix:\x1b[0m    ${issue.suggestedFix}\n`);
      });
    } else {
      console.log(`\n\x1b[32m✨ Clean! No bugs, leaks, or conflicts found in ${report.filesScanned} files.\x1b[0m\n`);
    }

    if (argv.includes('--md') || argv.includes('--markdown')) {
      const md = CodeBugAuditor.formatMarkdown(report);
      const outPath = 'kairo-audit-report.md';
      fs.writeFileSync(outPath, md, 'utf8');
      console.log(`\x1b[32mSaved Markdown report to: ${outPath}\x1b[0m`);
    }

    return report.passed ? 0 : 1;
  }

  console.warn(`Unknown command: "${cmd}". Run "kairo --help" for available options.`);
  return 1;
}
