const fetch = globalThis.fetch || require("node-fetch");

/**
 * AI Provider Service
 * Abstraction layer for static LLM evaluation.
 * Supports Groq API (GROQ_API_KEY) with OpenAI-compatible JSON mode,
 * and falls back gracefully to a deterministic heuristic static evaluator.
 */

const SYSTEM_PROMPT = `
You are Ancora's expert Software Engineering Coach and the candidate's supportive, encouraging "Big Brother" Mentor.
Your role is to statically analyze a candidate's DSA problem submission (solution code, language, outcome, confidence, key insight) against the target Problem specifications and their historical learning trajectory on this pattern.

You are NOT a cold, robotic grader. Hints are a normal, healthy part of learning!
CRITICAL RULE: NEVER flag hint usage as a defect, code error, or "MISUNDERSTOOD_PROBLEM". Hints belong in coachFeedback and encouragement.
Only flag genuine algorithmic bugs, time/space complexity bottlenecks, or missed boundary conditions in issues.

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
  "retryFocus": "What to focus on if retrying (e.g. Revise this variation twice to master edge cases)",
  "confidenceAdjustment": "Guidance on confidence level",
  "coachFeedback": "A 2-4 sentence warm, supportive Big Brother coaching note tailored to their past pattern streak and current hints."
}
`;

const evaluateAttempt = async ({ problem, attempt, patternContext }) => {
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
      keyInsight,
      hintsUsed: attempt.hintsUsed || attempt.hints || 0
    },
    patternHistory: patternContext || {}
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
  return fallbackHeuristicEvaluation(problem, attempt, patternContext);
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
    confidenceAdjustment: String(res.confidenceAdjustment || "Maintain current confidence level."),
    coachFeedback: String(res.coachFeedback || "")
  };
};

// Deterministic fallback static evaluator when API key is missing or unavailable
const fallbackHeuristicEvaluation = (problem, attempt, patternContext) => {
  const code = (attempt.code || "").trim();
  const outcome = attempt.outcome || "Solved";
  const confidence = attempt.confidence || 3;
  const primaryPattern = (patternContext?.primaryPattern) || ((problem.patterns && problem.patterns[0]) ? problem.patterns[0] : "Algorithmic Pattern");

  const isCleanSolved = outcome === "Solved" || outcome === "SolvedClean";
  const isSolvedWithHints = outcome === "SolvedWithHints" || outcome === "Solved with hints" || ((attempt.hintsUsed || attempt.hints || 0) > 0 && outcome !== "CouldNotSolve" && outcome !== "NeedSolution");
  const isSolved = isCleanSolved || isSolvedWithHints;
  const isHighConf = (confidence >= 4);

  const currentHints = patternContext?.currentHints ?? (attempt.hintsUsed || attempt.hints || 0);
  const totalSolved = patternContext?.totalPatternSolved ?? 0;
  const isSpike = Boolean(patternContext?.isHintSpike);

  // Big Brother Coach Feedback generation
  let coachFeedback = "";
  if (isSpike) {
    coachFeedback = `Did this one feel tough? You've smoothly cleared ${totalSolved} ${primaryPattern} problems before this with barely any hints, so don't get discouraged at all! Every pattern has tricky variations with subtle edge cases. Let's make sure to revise this specific variation at least twice so it locks into your muscle memory!`;
  } else if (isSolved && currentHints === 0) {
    coachFeedback = `Awesome work! You cleared this ${primaryPattern} problem cleanly without needing any hints. Your pattern recognition here is dialed in!`;
  } else if (isSolved && currentHints > 0) {
    coachFeedback = `Great effort working through this ${primaryPattern} problem! Taking ${currentHints} hint${currentHints > 1 ? "s" : ""} to unlock the solution is exactly how we learn new variations. Keep up the solid momentum!`;
  } else {
    coachFeedback = `Hey, tough problems happen to everyone—the important thing is you gave it an honest try. Take a quick breather, review the pattern breakdown below, and let's tackle it again fresh!`;
  }

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
      issues: [],
      whatWasDoneWell: ["Explored initial pattern direction"],
      whatNeedsFixing: ["Implement a working code solution", "Handle edge boundary conditions"],
      keyLearning: `Focus on mastering the core mechanism of ${primaryPattern}.`,
      retryRecommended: true,
      retryFocus: `Write a clean implementation using ${primaryPattern}.`,
      confidenceAdjustment: "Retry the problem to build genuine solution confidence.",
      coachFeedback
    };
  }

  const whatWasDoneWell = [
    `Applied ${primaryPattern} approach`,
    "Clean solution structure"
  ];
  if (currentHints > 0) {
    whatWasDoneWell.push(`Used ${currentHints} hint(s) effectively to unblock the approach`);
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
      ? [] // Hints are NOT an issue!
      : [
          {
            type: "EDGE_CASE",
            description: "Verify boundary conditions (empty input, duplicates, extreme values).",
            severity: "MEDIUM"
          }
        ],
    whatWasDoneWell,
    whatNeedsFixing: isSolved ? [] : ["Refine edge case handling"],
    keyLearning: attempt.keyInsight || `Reinforced ${primaryPattern} intuition for ${problem.title}.`,
    retryRecommended: !isSolved || isSpike,
    retryFocus: isSpike
      ? `Revise this tricky variation twice to master edge cases.`
      : (!isSolved ? "Fix edge cases and retry the problem implementation." : ""),
    confidenceAdjustment: isSpike
      ? `You have a strong streak of ${totalSolved} solved on this pattern. Revising twice will ensure total mastery.`
      : (isSolved ? "High confidence validated." : "Targeted retry will reinforce confidence."),
    coachFeedback
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

/**
 * Generate Beginner-Friendly Algorithmic Pattern Deep-Dive Knowledge via AI
 */
const generatePatternKnowledge = async (patternName) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  const PATTERN_PROMPT = `
You are Ancora's world-class DSA mentor and computer science educator.
Generate an exceptionally clear, highly intuitive, and beginner-friendly deep-dive specification for the algorithmic pattern "${patternName}".

Your explanation must be so crystal-clear that a complete beginner learning DSA can instantly grasp:
1. What this pattern is and the real-world mental model behind it.
2. The step-by-step pipeline (4 to 5 discrete stages).
3. The "Loop Invariant" (the rule that stays true at every single step so the algorithm never fails).
4. The common traps / edge-case bugs beginners always make.
5. A clean, beautiful, well-commented canonical code template in JavaScript.

Respond STRICTLY with valid JSON matching this exact structure:
{
  "name": "${patternName}",
  "family": "e.g. Sequential Traversal / State Reduction",
  "subtitle": "A concise 1-sentence intuitive summary of what this pattern accomplishes",
  "beginnerIntuition": "A 2-3 sentence plain-English mental model or real-life analogy explaining the core intuition for beginners.",
  "nodes": [
    {
      "id": "step_1_id",
      "title": "Clear Stage Title (e.g. Setup & Sentinel)",
      "badge": "Setup",
      "color": "#6366f1",
      "role": "Short functional purpose (e.g. Edge-case shield)",
      "desc": "2-3 sentences explaining exactly what happens in this stage in plain English.",
      "invariant": "The specific condition or property that must remain true here.",
      "pitfall": "The classic mistake/bug beginners make at this stage."
    }
  ],
  "invariants": {
    "core": "The master mathematical rule that must remain true throughout every step.",
    "initialization": "What is verified before the loop starts (Base Case).",
    "maintenance": "Why each loop iteration preserves the invariant (Induction Step).",
    "termination": "Why the invariant guarantees a 100% correct answer when the loop finishes.",
    "timeComplexity": "e.g. O(N)",
    "spaceComplexity": "e.g. O(1)"
  },
  "blueprint": "// Canonical well-commented JavaScript code implementation\\nfunction solve(input) { ... }"
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
            { role: "system", content: "You are a master DSA curriculum architect and educator. Output strictly valid JSON." },
            { role: "user", content: PATTERN_PROMPT }
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
          if (parsed.nodes && parsed.invariants && parsed.blueprint) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("Groq AI pattern generation failed, using fallback:", err.message);
    }
  }

  // Deterministic fallback if API is unavailable
  return {
    name: patternName,
    family: "Algorithmic Pattern",
    subtitle: `Core algorithmic technique and operational invariants for ${patternName}`,
    beginnerIntuition: `Mastering ${patternName} allows you to systematically decompose complex problems into verifiable iterative states.`,
    nodes: [
      {
        id: "setup",
        title: "Initial State & Guard Conditions",
        badge: "Setup",
        color: "#6366f1",
        role: "Boundary Setup",
        desc: "Initializes tracking variables, pointers, or auxiliary data structures and handles empty or base inputs.",
        invariant: "State variables correctly reflect an empty or initial input configuration.",
        pitfall: "Failing to check null, empty, or single-element boundary cases."
      },
      {
        id: "step",
        title: "State Transition & Invariant Step",
        badge: "Core Op",
        color: "#10b981",
        role: "Incremental Processing",
        desc: "Advances loop pointer or recursion level while strictly preserving operational invariants.",
        invariant: "All elements processed so far satisfy the pattern requirements.",
        pitfall: "Accidental infinite loop or off-by-one boundary overshoot."
      },
      {
        id: "termination",
        title: "Termination & Result Aggregation",
        badge: "Exit",
        color: "#ec4899",
        role: "Result Extraction",
        desc: "Concludes traversal and returns optimal calculated answer or restructured data.",
        invariant: "Final state guarantees a cycle-free, complete output.",
        pitfall: "Returning intermediate state instead of final aggregated result."
      }
    ],
    invariants: {
      core: `At each step of ${patternName}, all previously processed elements satisfy the required invariant conditions.`,
      initialization: "State is initialized correctly for 0 processed elements.",
      maintenance: "Each step incorporates 1 new element while maintaining the invariant.",
      termination: "When input is exhausted, the invariant proves the final result is 100% correct.",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)"
    },
    blueprint: `// Canonical Pattern Blueprint: ${patternName}
function solveWith${patternName.replace(/[^a-zA-Z0-9]/g, '')}(input) {
  // 1. Setup initial state and boundaries
  let result = null;

  // 2. Execute pattern traversal
  for (let i = 0; i < input.length; i++) {
    // Maintain invariant at step i
  }

  // 3. Return final result
  return result;
}`
  };
};

module.exports = {
  evaluateAttempt,
  generateAIHint,
  generatePatternKnowledge
};
