import { describe, it, expect, vi } from 'vitest';
import { 
  checkMarkdownSecurity, 
  sanitizeMarkdown, 
  assessSecurityRisks,
  type SecurityRisk 
} from '../src/utils/security';

describe('Security utilities', () => {
  describe('checkMarkdownSecurity', () => {
    it('should return valid for safe markdown', () => {
      const result = checkMarkdownSecurity('# Hello World\n\nThis is **bold** text.');
      expect(result.isValid).toBe(true);
      expect(result.risks).toHaveLength(0);
      expect(result.sanitized).toBe(false);
    });

    it('should handle null/undefined/empty inputs', () => {
      expect(checkMarkdownSecurity(null)).toEqual({
        isValid: true,
        text: "",
        risks: [],
        sanitized: false
      });
      expect(checkMarkdownSecurity(undefined)).toEqual({
        isValid: true,
        text: "",
        risks: [],
        sanitized: false
      });
      expect(checkMarkdownSecurity("")).toEqual({
        isValid: true,
        text: "",
        risks: [],
        sanitized: false
      });
    });

    it('should detect script tags (critical risk)', () => {
      const malicious = '<script>alert("xss")</script>';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.sanitized).toBe(true);
      expect(result.risks).toHaveLength(1);
      expect(result.risks[0].type).toBe('scriptTags');
      expect(result.risks[0].severity).toBe('critical');
      expect(result.text).toBe(''); // Should be sanitized
    });

    it('should detect event handlers (critical risk)', () => {
      const malicious = '<div onclick="alert(\\"xss\\")">Click me</div>';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'eventHandlers')).toBe(true);
      expect(result.risks.find(r => r.type === 'eventHandlers')?.severity).toBe('critical');
    });

    it('should detect javascript URLs (critical risk)', () => {
      const malicious = '[Click here](javascript:alert("xss"))';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'javascriptUrls')).toBe(true);
    });

    it('should detect iframes (high risk)', () => {
      const malicious = '<iframe src="https://evil.com"></iframe>';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'iframes')).toBe(true);
      expect(result.risks.find(r => r.type === 'iframes')?.severity).toBe('high');
    });

    it('should detect data URLs (medium risk)', () => {
      const malicious = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'dataUrls')).toBe(true);
    });

    it('should detect suspicious protocols', () => {
      const malicious = '[Link](file:///etc/passwd)';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'suspiciousProtocol')).toBe(true);
    });

    it('should detect dangerous attributes', () => {
      const malicious = '<input autofocus contenteditable>';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'dangerousAttributes')).toBe(true);
    });

    it('should detect dangerous JavaScript functions', () => {
      const malicious = 'eval("alert(1)")';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'dangerousJavaScript')).toBe(true);
    });

    it('should detect HTML comments', () => {
      const malicious = '<!-- This might contain sensitive info -->';
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.some(r => r.type === 'htmlComments')).toBe(true);
      expect(result.risks.find(r => r.type === 'htmlComments')?.severity).toBe('low');
    });

    it('should sort risks by severity', () => {
      const malicious = `
        <!-- low risk comment -->
        <img src="data:text/html,test">
        <script>alert(1)</script>
      `;
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.risks.length).toBeGreaterThan(1);
      // First risk should be critical
      expect(result.risks[0].severity).toBe('critical');
      // Last risk should be lower severity
      expect(result.risks[result.risks.length - 1].severity).not.toBe('critical');
    });

    it('should handle multiple risks', () => {
      const malicious = `
        <script>alert("xss")</script>
        <iframe src="evil.com"></iframe>
        <div onclick="bad()">test</div>
      `;
      const result = checkMarkdownSecurity(malicious);
      
      expect(result.isValid).toBe(false);
      expect(result.risks.length).toBeGreaterThan(2);
      expect(result.sanitized).toBe(true);
    });

    it('should handle non-string inputs gracefully', () => {
      expect(checkMarkdownSecurity(123 as any).isValid).toBe(true);
      expect(checkMarkdownSecurity({} as any).isValid).toBe(true);
      expect(checkMarkdownSecurity([] as any).isValid).toBe(true);
    });
  });

  describe('sanitizeMarkdown', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<p>Hello <strong>World</strong></p>';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe('Hello World');
    });

    it('should remove JavaScript protocols', () => {
      const dirty = 'javascript:alert("xss")';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe('alert("xss")');
    });

    it('should remove data URLs', () => {
      const dirty = 'data:text/html,<script>alert(1)</script>';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe(')'); // Data URL and HTML tags removed, leaving only closing parenthesis
    });

    it('should remove suspicious protocols', () => {
      const dirty = 'file:///etc/passwd ftp://evil.com';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe('///etc/passwd //evil.com');
    });

    it('should remove HTML entities', () => {
      const dirty = '&lt;script&gt;alert()&lt;/script&gt;';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe('scriptalert()/script'); // Entities are removed, leaving the text content
    });

    it('should clean up whitespace', () => {
      const dirty = '  Multiple    spaces   and\nactual\t tabs  ';
      const clean = sanitizeMarkdown(dirty);
      expect(clean).toBe('Multiple spaces and actual tabs'); // Whitespace is normalized correctly
    });

    it('should handle null/undefined inputs', () => {
      expect(sanitizeMarkdown(null)).toBe('');
      expect(sanitizeMarkdown(undefined)).toBe('');
      expect(sanitizeMarkdown('')).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeMarkdown(123 as any)).toBe('');
      expect(sanitizeMarkdown({} as any)).toBe('');
    });

    it('should preserve safe text content', () => {
      const safe = 'Hello World! This is safe text with números 123.';
      const clean = sanitizeMarkdown(safe);
      expect(clean).toBe(safe);
    });
  });

  describe('assessSecurityRisks', () => {
    it('should return safe assessment for no risks', () => {
      const assessment = assessSecurityRisks([]);
      expect(assessment.score).toBe(0);
      expect(assessment.level).toBe('safe');
      expect(assessment.recommendations).toContain('Content appears safe to use');
    });

    it('should calculate correct score for critical risks', () => {
      const risks: SecurityRisk[] = [
        { type: 'scriptTags', description: 'Test', severity: 'critical' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(100);
      expect(assessment.level).toBe('critical');
      expect(assessment.recommendations.some(r => r.includes('URGENT'))).toBe(true);
    });

    it('should calculate correct score for high risks', () => {
      const risks: SecurityRisk[] = [
        { type: 'iframes', description: 'Test', severity: 'high' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(50);
      expect(assessment.level).toBe('high');
      expect(assessment.recommendations.some(r => r.includes('High security risks'))).toBe(true);
    });

    it('should calculate correct score for medium risks', () => {
      const risks: SecurityRisk[] = [
        { type: 'dataUrls', description: 'Test', severity: 'medium' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(20);
      expect(assessment.level).toBe('medium');
      expect(assessment.recommendations.some(r => r.includes('Medium security risks'))).toBe(true);
    });

    it('should calculate correct score for low risks', () => {
      const risks: SecurityRisk[] = [
        { type: 'htmlComments', description: 'Test', severity: 'low' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(5);
      expect(assessment.level).toBe('low');
      expect(assessment.recommendations.some(r => r.includes('Low security risks'))).toBe(true);
    });

    it('should handle multiple risks correctly', () => {
      const risks: SecurityRisk[] = [
        { type: 'scriptTags', description: 'Test', severity: 'critical' },
        { type: 'iframes', description: 'Test', severity: 'high' },
        { type: 'dataUrls', description: 'Test', severity: 'medium' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(170); // 100 + 50 + 20
      expect(assessment.level).toBe('critical');
    });

    it('should provide appropriate recommendations', () => {
      const risks: SecurityRisk[] = [
        { type: 'scriptTags', description: 'Test', severity: 'critical' }
      ];
      const assessment = assessSecurityRisks(risks);
      
      expect(assessment.recommendations).toContain('URGENT: Critical security risks detected - do not render this content');
      expect(assessment.recommendations).toContain('Always validate content from untrusted sources');
      expect(assessment.recommendations).toContain('Consider implementing Content Security Policy (CSP)');
    });

    it('should handle risks without severity', () => {
      const risks: SecurityRisk[] = [
        { type: 'unknown', description: 'Test' }
      ];
      const assessment = assessSecurityRisks(risks);
      expect(assessment.score).toBe(5); // Default to low severity
      expect(assessment.level).toBe('low');
    });

    it('should handle null/undefined risks', () => {
      expect(assessSecurityRisks(null as any).level).toBe('safe');
      expect(assessSecurityRisks(undefined as any).level).toBe('safe');
    });
  });
});