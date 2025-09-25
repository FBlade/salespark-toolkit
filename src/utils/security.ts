/******************************************************
 * ##: Markdown Security Checker
 * Analyzes markdown text for potential security risks and XSS vulnerabilities.
 *
 * Detects dangerous HTML tags, JavaScript injection attempts, suspicious protocols,
 * and other security threats. Provides sanitized output with detailed risk assessment.
 * @param {string|null|undefined} markdownText Markdown content to analyze
 * @returns {{isValid: boolean, text: string, risks: Array}} Security analysis result
 * History:
 * 25-09-2025: Created
 ****************************************************/

export interface SecurityRisk {
  type: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityCheckResult {
  isValid: boolean;
  text: string;
  risks: SecurityRisk[];
  sanitized: boolean;
}

export const checkMarkdownSecurity = (
  markdownText: string | null | undefined
): SecurityCheckResult => {
  // Early return if no text is provided
  if (!markdownText || typeof markdownText !== 'string') {
    return { 
      isValid: true, 
      text: "", 
      risks: [],
      sanitized: false
    };
  }

  // Initialize security check result
  const securityCheck: SecurityCheckResult = {
    isValid: true,
    text: markdownText,
    risks: [],
    sanitized: false,
  };

  // Enhanced security patterns with severity levels
  const securityPatterns = {
    // Critical risks
    scriptTags: {
      pattern: /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
      severity: 'critical' as const,
      description: 'Script tags detected - high XSS risk',
    },
    eventHandlers: {
      pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
      severity: 'critical' as const,
      description: 'JavaScript event handlers detected',
    },
    javascriptUrls: {
      pattern: /javascript\s*:[^"'\s>]*/gi,
      severity: 'critical' as const,
      description: 'JavaScript URLs detected',
    },

    // High risks
    iframes: {
      pattern: /<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi,
      severity: 'high' as const,
      description: 'Iframe elements detected - potential embedding risk',
    },
    objectTags: {
      pattern: /<\s*object\b[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi,
      severity: 'high' as const,
      description: 'Object tags detected - potential code execution',
    },
    embedTags: {
      pattern: /<\s*embed\b[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi,
      severity: 'high' as const,
      description: 'Embed tags detected - potential code execution',
    },
    formTags: {
      pattern: /<\s*form\b[^>]*>[\s\S]*?<\s*\/\s*form\s*>/gi,
      severity: 'high' as const,
      description: 'Form elements detected - potential data submission risk',
    },

    // Medium risks
    dataUrls: {
      pattern: /data:\s*[^,\s]+,[^"'\s)>]*/gi,
      severity: 'medium' as const,
      description: 'Data URLs detected - potential data exfiltration',
    },
    baseTags: {
      pattern: /<\s*base\b[^>]*\/?>/gi,
      severity: 'medium' as const,
      description: 'Base tags detected - potential URL hijacking',
    },
    styleTags: {
      pattern: /<\s*style\b[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi,
      severity: 'medium' as const,
      description: 'Style tags detected - potential CSS injection',
    },
    linkTags: {
      pattern: /<\s*link\b[^>]*\/?>/gi,
      severity: 'medium' as const,
      description: 'Link tags detected - potential resource hijacking',
    },

    // Low risks
    metaTags: {
      pattern: /<\s*meta\b[^>]*\/?>/gi,
      severity: 'low' as const,
      description: 'Meta tags detected - potential information disclosure',
    },
  };

  // Additional security checks
  const additionalChecks = [
    {
      pattern: /(file|ftp|ws|wss|gopher|ldap|telnet):/gi,
      type: "suspiciousProtocol",
      description: "Suspicious URL protocol detected",
      severity: 'high' as const,
    },
    {
      pattern: /(contenteditable|autofocus|formaction|srcdoc|srclang)/gi,
      type: "dangerousAttributes",
      description: "Potentially dangerous HTML attributes detected",
      severity: 'medium' as const,
    },
    {
      pattern: /(expression|eval|setTimeout|setInterval|Function|constructor)/gi,
      type: "dangerousJavaScript",
      description: "Potentially dangerous JavaScript functions detected",
      severity: 'high' as const,
    },
    {
      pattern: /(vbscript|livescript|mocha):/gi,
      type: "dangerousScriptProtocol",
      description: "Dangerous scripting protocols detected",
      severity: 'critical' as const,
    },
    {
      pattern: /<!--[\s\S]*?-->/g,
      type: "htmlComments",
      description: "HTML comments detected - potential information leakage",
      severity: 'low' as const,
    },
  ];

  // Function to sanitize detected risks
  const sanitizeContent = (text: string, pattern: RegExp, replacement = ""): string => {
    return text.replace(pattern, replacement);
  };

  let contentWasSanitized = false;

  // Check for each security pattern
  Object.entries(securityPatterns).forEach(([riskType, config]) => {
    if (config.pattern.test(markdownText)) {
      securityCheck.isValid = false;
      securityCheck.risks.push({
        type: riskType,
        description: config.description,
        severity: config.severity,
      });

      // Sanitize the content
      securityCheck.text = sanitizeContent(securityCheck.text, config.pattern);
      contentWasSanitized = true;
    }
  });

  // Apply additional security checks
  additionalChecks.forEach((check) => {
    if (check.pattern.test(markdownText)) {
      securityCheck.isValid = false;
      securityCheck.risks.push({
        type: check.type,
        description: check.description,
        severity: check.severity,
      });
      securityCheck.text = sanitizeContent(securityCheck.text, check.pattern);
      contentWasSanitized = true;
    }
  });

  securityCheck.sanitized = contentWasSanitized;

  // Sort risks by severity (critical -> high -> medium -> low)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  securityCheck.risks.sort((a, b) => {
    const aSeverity = severityOrder[a.severity || 'low'];
    const bSeverity = severityOrder[b.severity || 'low'];
    return aSeverity - bSeverity;
  });

  return securityCheck;
};

/******************************************************
 * ##: HTML/Markdown Sanitizer
 * Removes potentially dangerous HTML elements and attributes from text.
 *
 * More aggressive sanitization for when security is paramount.
 * Strips all HTML tags and suspicious content.
 * @param {string|null|undefined} text Text to sanitize
 * @returns {string} Sanitized text with dangerous content removed
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const sanitizeMarkdown = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    return text
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove JavaScript protocols
      .replace(/javascript:/gi, '')
      // Remove data URLs
      .replace(/data:[^,]*,[^"'\s>)]*/gi, '')
      // Remove suspicious protocols
      .replace(/(file|ftp|ws|wss|vbscript|livescript|mocha):/gi, '')
      // Remove HTML entities that could be used for obfuscation
      .replace(/&[#\w]+;/g, '')
      // Remove potential CSS expressions
      .replace(/expression\s*\([^)]*\)/gi, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    /* c8 ignore start */
    // Defensive fallback
    return '';
    /* c8 ignore end */
  }
};

/******************************************************
 * ##: Security Risk Assessment
 * Provides a security risk score and recommendations based on detected risks.
 *
 * Calculates risk score and provides actionable security recommendations.
 * @param {SecurityRisk[]} risks Array of detected security risks
 * @returns {{score: number, level: string, recommendations: string[]}} Risk assessment
 * History:
 * 25-09-2025: Created
 ****************************************************/
export const assessSecurityRisks = (risks: SecurityRisk[]): {
  score: number;
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
} => {
  if (!risks || risks.length === 0) {
    return {
      score: 0,
      level: 'safe',
      recommendations: ['Content appears safe to use'],
    };
  }

  // Calculate risk score based on severity
  const severityScores = { critical: 100, high: 50, medium: 20, low: 5 };
  const score = risks.reduce((total, risk) => {
    return total + (severityScores[risk.severity || 'low'] || 5);
  }, 0);

  // Determine risk level
  let level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  if (score >= 100) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 20) level = 'medium';
  else if (score >= 5) level = 'low';
  else level = 'safe';

  // Generate recommendations
  const recommendations: string[] = [];
  const hasCritical = risks.some(r => r.severity === 'critical');
  const hasHigh = risks.some(r => r.severity === 'high');

  if (hasCritical) {
    recommendations.push('URGENT: Critical security risks detected - do not render this content');
    recommendations.push('Use aggressive sanitization before any processing');
  }

  if (hasHigh) {
    recommendations.push('High security risks detected - sanitization strongly recommended');
    recommendations.push('Consider rejecting this content or applying strict filtering');
  }

  if (level === 'medium') {
    recommendations.push('Medium security risks detected - apply sanitization');
    recommendations.push('Review content carefully before use');
  }

  if (level === 'low') {
    recommendations.push('Low security risks detected - basic sanitization recommended');
  }

  recommendations.push('Always validate content from untrusted sources');
  recommendations.push('Consider implementing Content Security Policy (CSP)');

  return { score, level, recommendations };
};