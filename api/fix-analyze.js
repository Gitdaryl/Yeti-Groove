// Emergency Fix Agent - Phase 1: Analyze & Generate Fix
// Fetches a file from GitHub, sends it + the instruction to Claude,
// returns the fixed content + a unified diff for mobile review.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repo, filePath, branch = 'main', instruction, token } = req.body || {};

  if (!token || token !== process.env.FIX_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!repo || !filePath || !instruction) {
    return res.status(400).json({ error: 'repo, filePath, and instruction are required' });
  }

  try {
    // 1. Fetch the file from GitHub REST API
    const ghRes = await fetch(
      `https://api.github.com/repos/Gitdaryl/${encodeURIComponent(repo)}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'YetiGroove-EmergencyFix/1.0'
        }
      }
    );

    if (!ghRes.ok) {
      const err = await ghRes.json();
      return res.status(404).json({ error: `GitHub: ${err.message}` });
    }

    const ghData = await ghRes.json();
    const originalContent = Buffer.from(ghData.content, 'base64').toString('utf8');

    // 2. First pass: Haiku (fast + cheap)
    let result = await callClaude('claude-haiku-4-5-20251001', originalContent, filePath, instruction);
    let modelUsed = 'haiku';

    // 3. Escalate to Sonnet if Haiku flags complexity
    if (result.complexity === 'complex') {
      console.log('[fix-analyze] Escalating to Sonnet (complexity flagged)');
      result = await callClaude('claude-sonnet-4-6', originalContent, filePath, instruction);
      modelUsed = 'sonnet';
    }

    const diff = generateDiff(originalContent, result.fixedContent, filePath);

    return res.json({
      diff,
      fixedContent: result.fixedContent,
      complexity: result.complexity,
      explanation: result.explanation,
      modelUsed,
      repo,
      filePath,
      branch
    });

  } catch (err) {
    console.error('[fix-analyze]', err);
    return res.status(500).json({ error: err.message });
  }
};

async function callClaude(model, fileContent, filePath, instruction) {
  const prompt = `You are an emergency code fix agent. A solo developer is away from their IDE and needs a targeted fix applied to a source file remotely.

FILE PATH: ${filePath}
FIX INSTRUCTION: ${instruction}

CURRENT FILE CONTENT:
\`\`\`
${fileContent}
\`\`\`

Apply the fix described in the instruction. Make only the minimal change required - do not refactor, reformat, or touch anything outside what the instruction requires.

Respond with ONLY a JSON object (no markdown fences, no preamble, no explanation outside the JSON):
{
  "fixedContent": "<complete corrected file content - the FULL file, not a snippet>",
  "complexity": "simple",
  "explanation": "<one sentence: exactly what you changed and why>"
}

Set complexity to "complex" ONLY if: (a) this fix requires changes to OTHER files beyond ${filePath}, (b) it requires new environment variables to be configured, or (c) you are genuinely uncertain the fix is complete. For most targeted fixes, use "simple".`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Anthropic API error ${response.status}: ${err.error?.message || 'unknown'}`);
  }

  const data = await response.json();
  const text = (data.content[0].text || '').trim();

  // Strip markdown fences if the model wraps it anyway
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error(`Claude returned invalid JSON. Raw response: ${text.slice(0, 300)}`);
  }
}

// Diff using common-prefix / common-suffix approach.
// Clean and correct for the most common emergency fix pattern:
// one contiguous block of lines changed/replaced in place.
function generateDiff(original, fixed, filePath) {
  const a   = original.split('\n');
  const b   = fixed.split('\n');
  const out = [`--- a/${filePath}`, `+++ b/${filePath}`];

  // Walk from start to find first differing line
  let lo = 0;
  while (lo < a.length && lo < b.length && a[lo] === b[lo]) lo++;

  // Walk from end to find last differing line
  let hiA = a.length - 1;
  let hiB = b.length - 1;
  while (hiA > lo && hiB > lo && a[hiA] === b[hiB]) { hiA--; hiB--; }

  // Files are identical
  if (lo > hiA && lo > hiB) {
    out.push('(no differences detected - file may already be correct)');
    return out.join('\n');
  }

  const CTX      = 3;
  const ctxStart = Math.max(0, lo - CTX);
  const ctxEndA  = Math.min(a.length - 1, hiA + CTX);
  const aCount   = ctxEndA - ctxStart + 1;
  const bCount   = aCount - (hiA - lo + 1) + (hiB - lo + 1);

  out.push(`@@ -${ctxStart + 1},${aCount} +${ctxStart + 1},${Math.max(0, bCount)} @@`);

  for (let i = ctxStart; i < lo; i++)       out.push(' ' + a[i]);
  for (let i = lo; i <= hiA; i++)           out.push('-' + a[i]);
  for (let i = lo; i <= hiB; i++)           out.push('+' + b[i]);
  for (let i = hiA + 1; i <= ctxEndA; i++) out.push(' ' + a[i]);

  return out.join('\n');
}
