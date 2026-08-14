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
export declare class CodeBugAuditor {
    static scanFileContent(filePath: string, content: string): CodeBugIssue[];
    static scanDirectory(dirPath: string, extensions?: string[]): CLIAuditReport;
    static formatMarkdown(report: CLIAuditReport): string;
}
/**
 * CLI Entrypoint runner
 */
export declare function runCLI(argv?: string[]): Promise<number>;
