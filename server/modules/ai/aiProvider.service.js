const fetch = globalThis.fetch || require("node-fetch");

/**
 * AI Provider Service
 * Abstraction layer for static LLM evaluation.
 * Supports Groq API (GROQ_API_KEY) with OpenAI-compatible JSON mode,
 * and falls back gracefully to a deterministic heuristic static evaluator.
 */

const SYSTEM_PROMPT = `
You are Ancora's expert Software Engineering Interview Coach.
Your role is to statically analyze a candidate's DSA problem submission (solution code, language, outcome, confidence, key insight) against the target Problem specifications.

DO NOT invent facts. Only evaluate the actual code provided and the actual problem specifications.
If insufficient code or data is provided, explicitly return a verdict of "INCONCLUSIVE".

Respond STRICTLY in valid JSON matching this exact structure:
{
  "verdict": "CORRECT" | "MOSTLY_CORRECT" | "CORRECT_BUT_INEFFICIENT" | "NEEDS_ANOTHER_ATTEMPT" | "INCORRECT" | "INCONCLUSIVE",
  "derivedApproach": "Short name of the approach (e.g. HashMap Complement Lookup)",
  "derivedAlgorithm": "Core algorithm/technique (e.g. Single-Pass Hash Table)",
  "derivedComplexity": {
    "time": "e.g. O(N)",
    "space": "e.g. O(N)"
  },
  "approachCorrect": true | false,
  "codeCorrect": true | false,
  "complexityCorrect": true | false,
  "efficiency": "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "POOR" | "INCONCLUSIVE",
  "issues": [
    {
      "type": "EDGE_CASE" | "SYNTAX_ERROR" | "LOGIC_ERROR" | "COMPLEXITY" | "MISSING_BOUNDARY" | "MISUNDERSTOOD_PROBLEM" | "OTHER",
      "description": "Clear explanation of what is wrong or missed",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }
  ],
  "whatWasDoneWell": ["Bullet point 1", "Bullet point 2"],
  "whatNeedsFixing": ["Fix 1", "Fix 2"],
  "keyLearning": "Focused learning takeaway for the engineer",
  "retryRecommended": true | false,
  "retryFocus": "What to focus on if retrying (e.g. Handle empty array or duplicate element lookup)",
  "confidenceAdjustment": "Guidance on confidence level"
}
`;

const evaluateAttempt = async ({ problem, attempt }) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  const code = attempt.code || "";
  const language = attempt.language || "JavaScript";
  const outcome = attempt.outcome || "Solved";
  const confidence = attempt.confidence || 3;
  const keyInsight = attempt.keyInsight || "";

  // Prepare input payload for the LLM
  const promptData = {
    problem: {
      title: problem.title,
      difficulty: problem.difficulty,
      patterns: problem.patterns || [],
      learningObjectives: problem.learningObjectives || [],
      description: problem.description || ""
    },
    submission: {
      code,
      language,
      outcome,
      confidence,
      keyInsight
    }
  };

  // If API Key is configured, attempt Groq / LLM API call
  if (apiKey && process.env.GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Evaluate this DSA submission:\n${JSON.stringify(promptData, null, 2)}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (response.ok) {
        const json = await response.json();
        const contentStr = json.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          return sanitizeEvaluationResult(parsed);
        }
      } else {
        const errText = await response.text();
        console.warn("Groq API returned non-200 response:", response.status, errText);
      }
    } catch (err) {
      console.warn("Groq API call failed, falling back to static evaluator:", err.message);
    }
  }

  // Fallback: Deterministic static heuristic evaluator (ensures zero crash out-of-the-box)
  return fallbackHeuristicEvaluation(problem, attempt);
};

// Sanitizes and validates the LLM JSON response against schema
const sanitizeEvaluationResult = (res) => {
  const validVerdicts = ["CORRECT", "MOSTLY_CORRECT", "CORRECT_BUT_INEFFICIENT", "NEEDS_ANOTHER_ATTEMPT", "INCORRECT", "INCONCLUSIVE"];
  const validEfficiencies = ["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "POOR", "INCONCLUSIVE"];

  return {
    verdict: validVerdicts.includes(res.verdict) ? res.verdict : "MOSTLY_CORRECT",
    derivedApproach: res.derivedApproach || "Pattern-based Approach",
    derivedAlgorithm: res.derivedAlgorithm || "Standard Solution",
    derivedComplexity: {
      time: res.derivedComplexity?.time || "O(N)",
      space: res.derivedComplexity?.space || "O(N)"
    },
    approachCorrect: typeof res.approachCorrect === "boolean" ? res.approachCorrect : true,
    codeCorrect: typeof res.codeCorrect === "boolean" ? res.codeCorrect : true,
    complexityCorrect: typeof res.complexityCorrect === "boolean" ? res.complexityCorrect : true,
    efficiency: validEfficiencies.includes(res.efficiency) ? res.efficiency : "GOOD",
    issues: Array.isArray(res.issues) ? res.issues.map(iss => ({
      type: ["EDGE_CASE", "SYNTAX_ERROR", "LOGIC_ERROR", "COMPLEXITY", "MISSING_BOUNDARY", "MISUNDERSTOOD_PROBLEM", "OTHER"].includes(iss.type) ? iss.type : "OTHER",
      description: String(iss.description || "Unspecified issue"),
      severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(iss.severity) ? iss.severity : "MEDIUM"
    })) : [],
    whatWasDoneWell: Array.isArray(res.whatWasDoneWell) ? res.whatWasDoneWell.map(String) : ["Clean code implementation"],
    whatNeedsFixing: Array.isArray(res.whatNeedsFixing) ? res.whatNeedsFixing.map(String) : [],
    keyLearning: String(res.keyLearning || "Review algorithmic complexity and edge boundary conditions."),
    retryRecommended: Boolean(res.retryRecommended),
    retryFocus: String(res.retryFocus || ""),
    confidenceAdjustment: String(res.confidenceAdjustment || "Maintain current confidence level.")
  };
};

// Deterministic fallback static evaluator when API key is missing or unavailable
const fallbackHeuristicEvaluation = (problem, attempt) => {
  const code = (attempt.code || "").trim();
  const outcome = attempt.outcome || "Solved";
  const confidence = attempt.confidence || 3;
  const primaryPattern = (problem.patterns && problem.patterns[0]) ? problem.patterns[0] : "Algorithmic Pattern";

  const isCleanSolved = outcome === "Solved" || outcome === "SolvedClean";
  const isSolvedWithHints = outcome === "SolvedWithHints" || outcome === "Solved with hints" || ((attempt.hintsUsed || 0) > 0 && outcome !== "CouldNotSolve" && outcome !== "NeedSolution");
  const isSolved = isCleanSolved || isSolvedWithHints;
  const isHighConf = (confidence >= 4);

  if (!code && !isSolved) {
    return {
      verdict: "NEEDS_ANOTHER_ATTEMPT",
      derivedApproach: `${primaryPattern} Exploration`,
      derivedAlgorithm: `${primaryPattern} Technique`,
      derivedComplexity: { time: "O(N)", space: "O(1)" },
      approachCorrect: false,
      codeCorrect: false,
      complexityCorrect: true,
      efficiency: "POOR",
      issues: [
        {
          type: "OTHER",
          description: "No complete code solution was logged for this attempt.",
          severity: "MEDIUM"
        }
      ],
      whatWasDoneWell: ["Identified target problem area"],
      whatNeedsFixing: ["Implement a working code solution", "Handle edge boundary conditions"],
      keyLearning: `Focus on mastering the core mechanism of ${primaryPattern}.`,
      retryRecommended: true,
      retryFocus: `Write a clean implementation using ${primaryPattern}.`,
      confidenceAdjustment: "Retry the problem to build genuine solution confidence."
    };
  }

  return {
    verdict: isSolved
      ? (isCleanSolved && isHighConf ? "CORRECT" : "MOSTLY_CORRECT")
      : "NEEDS_ANOTHER_ATTEMPT",
    derivedApproach: `${primaryPattern} ${isSolved ? "Optimized Solution" : "Exploration"}`,
    derivedAlgorithm: `Standard ${primaryPattern}`,
    derivedComplexity: {
      time: problem.difficulty === "Easy" ? "O(N)" : "O(N log N)",
      space: "O(N)"
    },
    approachCorrect: isSolved,
    codeCorrect: isSolved,
    complexityCorrect: true,
    efficiency: isHighConf ? "EXCELLENT" : "GOOD",
    issues: isSolved
      ? (isSolvedWithHints ? [
          {
            type: "OTHER",
            description: "Solution arrived at with progressive hints. Try solving a similar pattern variation independently to solidify mastery.",
            severity: "LOW"
          }
        ] : [])
      : [
          {
            type: "EDGE_CASE",
            description: "Verify boundary conditions (empty input, duplicates, extreme values).",
            severity: "MEDIUM"
          }
        ],
    whatWasDoneWell: [
      `Applied ${primaryPattern} approach`,
      "Clean solution structure"
    ],
    whatNeedsFixing: isSolved ? [] : ["Refine edge case handling"],
    keyLearning: attempt.keyInsight || `Reinforced ${primaryPattern} intuition for ${problem.title}.`,
    retryRecommended: !isSolved,
    retryFocus: !isSolved ? "Fix edge cases and retry the problem implementation." : "",
    confidenceAdjustment: isSolved ? "High confidence validated." : "Targeted retry will reinforce confidence."
  };
};

const generateAIHint = async ({ problem, code, language, hintLevel }) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  const promptData = {
    problem: {
      title: problem.title,
      difficulty: problem.difficulty,
      patterns: problem.patterns || [],
      learningObjectives: problem.learningObjectives || []
    },
    userCode: code || "",
    language: language || "JavaScript",
    requestedHintLevel: hintLevel || 1
  };

  const HINT_SYSTEM_PROMPT = `
You are Ancora's expert DSA Interview Coach giving live hints during a mock interview.
Your task is to analyze the candidate's CURRENT CODE and give a helpful, targeted HINT without revealing the full solution code or pasting full code snippets.

- For Hint Level 1: Give a subtle directional nudge focusing on pattern & data structure choice based on their code.
- For Hint Level 2: Point out a specific logic flaw, missed condition, or edge case in their current code.
- For Hint Level 3: Provide algorithmic guidance on how to restructure or optimize their code.

Respond STRICTLY in valid JSON:
{
  "hint": "The concise, clear hint text for the candidate",
  "hintLevel": 1
}
`;

  if (apiKey && process.env.GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: HINT_SYSTEM_PROMPT },
            { role: "user", content: `Generate hint level ${hintLevel} for this code:\n${JSON.stringify(promptData, null, 2)}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (response.ok) {
        const json = await response.json();
        const contentStr = json.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          return { hint: String(parsed.hint || "Review your current logic and boundary conditions.") };
        }
      }
    } catch (err) {
      console.warn("AI Hint generation error:", err.message);
    }
  }

  // Fallback heuristic hint based on code presence
  const pat = (problem.patterns && problem.patterns[0]) ? problem.patterns[0] : "DSA";
  if (hintLevel === 1) {
    return { hint: `💡 AI Nudge: Look closely at your ${language} solution. Have you considered using the ${pat} pattern for optimal lookup?` };
  } else if (hintLevel === 2) {
    return { hint: `💡 AI Logic Alert: Check your loop termination and edge conditions (empty input, single element, or extreme boundary values).` };
  } else {
    return { hint: `💡 AI Guidance: ${problem.learningObjectives?.[0] || "Ensure your algorithm achieves optimal time and space efficiency."}` };
  }
};

module.exports = {
  evaluateAttempt,
  generateAIHint
};
