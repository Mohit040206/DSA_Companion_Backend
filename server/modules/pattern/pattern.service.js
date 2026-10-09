const Pattern = require("./pattern.model");
const aiProvider = require("../ai/aiProvider.service");

// Slug helper
const toSlug = (str) => {
  return (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

// Curated beginner-friendly knowledge for standard patterns to guarantee instant, high-quality seeds
const STANDARD_PATTERNS = [
  {
    name: "Linked List Traversal",
    family: "Sequential Node Rewiring",
    subtitle: "Navigating and rewiring sequential pointer chains safely in memory",
    beginnerIntuition: "Think of a linked list like a treasure hunt where each clue (node) only tells you where the next clue is. If you accidentally erase a clue before reading it, you lose the rest of the trail forever! That is why we use temporary pointers to guard the trail.",
    nodes: [
      {
        id: "sentinel",
        title: "Sentinel / Dummy Head",
        badge: "Setup",
        color: "#6366f1",
        role: "Edge-Case Shield",
        desc: "A fake node created before the real head. It acts as an anchor so you never have to write special 'if head is deleted' logic.",
        invariant: "dummy.next always points to the true start of the modified linked list.",
        pitfall: "Forgetting to return dummy.next at the end, returning the dummy node itself."
      },
      {
        id: "pointer_triad",
        title: "Pointer Triad (prev, curr, next)",
        badge: "Loop State",
        color: "#3b82f6",
        role: "Boundary Tracking",
        desc: "Maintains 3 pointers: 'prev' (the already finished nodes), 'curr' (the node being worked on), and 'next' (saved before changing pointers so you don't lose the list).",
        invariant: "next = curr.next always safely preserves the unvisited nodes before curr is rewired.",
        pitfall: "Rewiring curr.next = prev before saving curr.next, which permanently deletes the remaining list from memory."
      },
      {
        id: "rewire",
        title: "Pointer Splicing & Reversal",
        badge: "Core Op",
        color: "#10b981",
        role: "Local Direction Flip",
        desc: "Points curr.next backwards to prev. Now this single node is reversed without allocating any new memory.",
        invariant: "The sublist ending at curr forms a valid, cycle-free chain.",
        pitfall: "Creating an infinite cycle by failing to null-terminate the original head node."
      },
      {
        id: "advance",
        title: "Step Advance & Null Exit",
        badge: "Exit",
        color: "#ec4899",
        role: "Iterative Step",
        desc: "Moves prev to curr, and curr to next. When curr reaches null, all nodes have been reversed and prev is the new head.",
        invariant: "Loop halts when curr is null. prev points to the complete reversed list.",
        pitfall: "Testing curr.next !== null instead of curr !== null, which skips the final node."
      }
    ],
    invariants: {
      core: "At step k, the sublist ending at prev contains the first k-1 processed nodes in their reversed order, curr points to node k, and next holds nodes k+1..N safe in memory.",
      initialization: "prev = null, curr = head. The processed list is initially empty, and all original nodes are intact.",
      maintenance: "nextTemp saves curr.next; curr.next points to prev; prev becomes curr; curr becomes nextTemp. 1 node is reversed cleanly per step.",
      termination: "When curr becomes null, every node has been visited and rewired; prev is the new valid head.",
      timeComplexity: "O(N) — single pass through nodes",
      spaceComplexity: "O(1) auxiliary — only 3 reference pointers"
    },
    blueprint: `// Canonical Pattern Blueprint: Linked List In-Place Traversal / Reversal
function reverseList(head) {
  // 1. Setup pointers: prev tracks finished chain, curr tracks active node
  let prev = null;
  let curr = head;

  while (curr !== null) {
    // 2. SAVE: Keep the unvisited chain safe before rewiring
    const nextTemp = curr.next;

    // 3. REWIRE: Point active node backwards
    curr.next = prev;

    // 4. ADVANCE: Move boundaries forward by 1 node
    prev = curr;
    curr = nextTemp;
  }

  // 5. TERMINATION: prev is the new head of the reversed list
  return prev;
}`
  },

  {
    name: "Two Pointers",
    family: "Linear Search Space Pruning",
    subtitle: "Opposite-direction boundary compression leveraging sorted order",
    beginnerIntuition: "Imagine two people walking toward each other from opposite ends of a sorted street. If their combined score is too small, the left person steps forward. If too large, the right person steps backward. You eliminate half the street with every single step!",
    nodes: [
      {
        id: "left_bound",
        title: "Left Boundary (left = 0)",
        badge: "Setup",
        color: "#3b82f6",
        role: "Minimum Candidate",
        desc: "Anchors the left end of the sorted array. Incrementing left strictly increases the candidate sum.",
        invariant: "left only moves forward, never backward.",
        pitfall: "Incrementing left past right when searching for distinct pairs."
      },
      {
        id: "right_bound",
        title: "Right Boundary (right = n - 1)",
        badge: "Setup",
        color: "#8b5cf6",
        role: "Maximum Candidate",
        desc: "Anchors the right end of the sorted array. Decrementing right strictly decreases the candidate sum.",
        invariant: "right only moves backward, never forward.",
        pitfall: "Starting right at nums.length instead of nums.length - 1 (out of bounds error)."
      },
      {
        id: "prune_step",
        title: "Monotonic Pruning Decision",
        badge: "Core Op",
        color: "#10b981",
        role: "Space Elimination",
        desc: "Checks nums[left] + nums[right]. If sum < target, left++ eliminates all pairs with current left in one shot. If sum > target, right-- eliminates all pairs with current right.",
        invariant: "All discarded pairs are proven impossible, avoiding nested O(N²) loops.",
        pitfall: "Trying to use two pointers on an unsorted array without sorting first."
      },
      {
        id: "convergence",
        title: "Convergence Exit (left < right)",
        badge: "Exit",
        color: "#ec4899",
        role: "Safe Stop",
        desc: "The loop terminates when pointers meet. Every viable pair has been tested in linear O(N) time.",
        invariant: "Search space is fully searched in at most N steps.",
        pitfall: "Using <= when the problem requires two distinct elements."
      }
    ],
    invariants: {
      core: "At any step, if a valid target pair exists, it must reside strictly within [left, right]. Discarding left or right never removes a valid solution.",
      initialization: "left = 0, right = n - 1. Search interval covers the entire array.",
      maintenance: "If sum < target, no pairing with nums[left] can reach target (since array is sorted), so left++ is provably safe. Same for right-- when sum > target.",
      termination: "When left >= right, the interval is exhausted. If no match was found, no pair exists.",
      timeComplexity: "O(N) (or O(N log N) if sorting is required)",
      spaceComplexity: "O(1) auxiliary"
    },
    blueprint: `// Canonical Pattern Blueprint: Two Pointers (Target Sum on Sorted Array)
function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const currentSum = numbers[left] + numbers[right];

    if (currentSum === target) {
      return [left + 1, right + 1]; // Found match (1-indexed)
    } else if (currentSum < target) {
      left++; // Sum too small: move left pointer forward
    } else {
      right--; // Sum too large: move right pointer backward
    }
  }

  return []; // No valid pair
}`
  },

  {
    name: "Sliding Window",
    family: "Contiguous Subarray Scanning",
    subtitle: "Amortized linear scan maintaining a valid contiguous range",
    beginnerIntuition: "Imagine looking through a magnifying glass that can stretch and shrink across a conveyor belt. You stretch the right edge to swallow items, and if it gets too heavy, you slide the left edge in to make it lighter!",
    nodes: [
      {
        id: "expand_right",
        title: "Right Boundary Expander",
        badge: "Intake",
        color: "#3b82f6",
        role: "Window Growth",
        desc: "Moves right forward to absorb new elements into the window's state (frequency count, sum).",
        invariant: "Every element enters the window exactly once through the right pointer.",
        pitfall: "Updating max answer before checking if the window violates constraints."
      },
      {
        id: "validity_check",
        title: "Constraint Invariant Check",
        badge: "Condition",
        color: "#eab308",
        role: "Rule Monitor",
        desc: "Checks if the window [left, right] broke the rule (e.g., duplicate character found, sum exceeded).",
        invariant: "If the window is invalid, the violation was triggered solely by the newest element at right.",
        pitfall: "Using an if statement instead of while when multiple left items must be evicted."
      },
      {
        id: "shrink_left",
        title: "Left Boundary Contractor",
        badge: "Restore",
        color: "#ef4444",
        role: "Validity Recovery",
        desc: "Advances left forward, removing elements from state until window is 100% legal again.",
        invariant: "Each element is evicted at most once, guaranteeing amortized O(N) runtime.",
        pitfall: "Decreasing character count without deleting the key when it drops to zero."
      },
      {
        id: "record_ans",
        title: "Optimal Subsegment Record",
        badge: "Answer",
        color: "#10b981",
        role: "Best Window Capture",
        desc: "Updates answer: maxLen = Math.max(maxLen, right - left + 1).",
        invariant: "right - left + 1 accurately measures current valid window length.",
        pitfall: "Using right - left instead of right - left + 1 (off-by-one error)."
      }
    ],
    invariants: {
      core: "At the end of every right iteration, the window [left, right] satisfies all rules, and is the largest valid window ending at right.",
      initialization: "left = 0, right = 0. Window state is initially empty.",
      maintenance: "Right absorbs element. While invalid, left contracts. Once valid, record answer.",
      termination: "Right finishes scanning array. Total left and right moves are at most 2N = O(N).",
      timeComplexity: "O(N) amortized linear scan",
      spaceComplexity: "O(K) where K is number of unique items in state"
    },
    blueprint: `// Canonical Pattern Blueprint: Sliding Window (Longest Substring Without Repeating)
function lengthOfLongestSubstring(s) {
  let left = 0;
  let maxLen = 0;
  const seen = new Map();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    // If duplicate is inside current window, jump left past it
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }

    // Save latest index of character
    seen.set(char, right);

    // Invariant: [left, right] has no duplicates
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}`
  },

  {
    name: "Binary Search",
    family: "Logarithmic Search Space Halving",
    subtitle: "Eliminating 50% of candidate solutions with every single comparison",
    beginnerIntuition: "Like guessing a number between 1 and 100 where someone says 'Too high' or 'Too low'. You always guess the exact middle (50). Within 7 guesses, you are guaranteed to find any number out of 100!",
    nodes: [
      {
        id: "bounds",
        title: "Search Range [low, high]",
        badge: "Setup",
        color: "#3b82f6",
        role: "Candidate Bracket",
        desc: "Defines the interval known to contain the answer. low = 0, high = n - 1.",
        invariant: "If the target exists, it is strictly inside [low, high].",
        pitfall: "Setting high to n instead of n - 1 causing index out of bounds."
      },
      {
        id: "mid",
        title: "Safe Midpoint Calculation",
        badge: "Pivot",
        color: "#8b5cf6",
        role: "Center Probe",
        desc: "Calculates mid = low + Math.floor((high - low) / 2) to safely prevent integer overflow.",
        invariant: "low <= mid <= high holds true on every pass.",
        pitfall: "Using (low + high) / 2 which overflows 32-bit integers in many languages."
      },
      {
        id: "discard",
        title: "Half-Space Elimination",
        badge: "Core Op",
        color: "#10b981",
        role: "Logarithmic Pruning",
        desc: "If nums[mid] < target, target cannot be in [low, mid], so set low = mid + 1. If nums[mid] > target, set high = mid - 1.",
        invariant: "Remaining candidate count is halved every iteration.",
        pitfall: "Setting low = mid or high = mid causing infinite loops."
      },
      {
        id: "exit",
        title: "Convergence Exit (low > high)",
        badge: "Exit",
        color: "#ec4899",
        role: "Result Found or Not",
        desc: "Stops when target is found or when bounds cross, proving the element does not exist.",
        invariant: "Guaranteed to stop within ceil(log2(N)) steps.",
        pitfall: "Using low < high instead of low <= high, which misses single-element matches."
      }
    ],
    invariants: {
      core: "At step k, target is in [low, high]. The midpoint splits the range; one half is discarded with 100% certainty.",
      initialization: "low = 0, high = n - 1. Target is initially within [0, n - 1].",
      maintenance: "Based on sorted comparison, the non-viable half is discarded. The target remains in the new [low, high].",
      termination: "low > high. Space size is 0. Element definitely does not exist.",
      timeComplexity: "O(log N) logarithmic time",
      spaceComplexity: "O(1) auxiliary space"
    },
    blueprint: `// Canonical Pattern Blueprint: Binary Search
function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    // Safe midpoint avoiding integer overflow
    const mid = low + Math.floor((high - low) / 2);

    if (nums[mid] === target) {
      return mid; // Found target index
    } else if (nums[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }

  return -1; // Target not in array
}`
  }
];

/**
 * Get or dynamically create a pattern deep dive
 */
const getPatternBySlugOrName = async (identifier) => {
  if (!identifier) return null;
  const slug = toSlug(identifier);

  // 1. Check MongoDB first
  let pattern = await Pattern.findOne({
    $or: [
      { slug },
      { name: new RegExp(`^${identifier.trim()}$`, "i") },
      { slug: new RegExp(`^${slug}`, "i") }
    ]
  }).lean();

  if (pattern) {
    return pattern;
  }

  // 2. Check if it's one of the curated standard patterns
  const matchingStandard = STANDARD_PATTERNS.find(p =>
    toSlug(p.name) === slug ||
    toSlug(p.name).includes(slug) ||
    slug.includes(toSlug(p.name))
  );

  if (matchingStandard) {
    pattern = await Pattern.create({
      slug: toSlug(matchingStandard.name),
      name: matchingStandard.name,
      family: matchingStandard.family,
      subtitle: matchingStandard.subtitle,
      beginnerIntuition: matchingStandard.beginnerIntuition,
      nodes: matchingStandard.nodes,
      invariants: matchingStandard.invariants,
      blueprint: matchingStandard.blueprint,
      createdBy: "system"
    });
    return pattern.toObject ? pattern.toObject() : pattern;
  }

  // 3. Not found anywhere -> Call Groq AI to generate it dynamically!
  console.log(`🤖 Auto-generating AI pattern knowledge for new pattern: "${identifier}"...`);
  const aiData = await aiProvider.generatePatternKnowledge(identifier);

  pattern = await Pattern.create({
    slug,
    name: aiData.name || identifier,
    family: aiData.family || "Algorithmic Pattern",
    subtitle: aiData.subtitle || `Core mental model and invariants for ${identifier}`,
    beginnerIntuition: aiData.beginnerIntuition || "",
    nodes: aiData.nodes || [],
    invariants: aiData.invariants || {},
    blueprint: aiData.blueprint || "",
    createdBy: "ai"
  });

  console.log(`✅ Saved AI-generated pattern "${pattern.name}" into MongoDB!`);
  return pattern.toObject ? pattern.toObject() : pattern;
};

/**
 * Ensure pattern is registered in DB (called when a problem with a new pattern is created)
 */
const ensurePatternExists = async (patternName) => {
  if (!patternName || typeof patternName !== 'string') return;
  const trimmed = patternName.trim();
  if (!trimmed || trimmed.toLowerCase() === 'all') return;

  try {
    const slug = toSlug(trimmed);
    const existing = await Pattern.findOne({
      $or: [{ slug }, { name: new RegExp(`^${trimmed}$`, 'i') }]
    });
    if (!existing) {
      await getPatternBySlugOrName(trimmed);
    }
  } catch (err) {
    console.warn(`Could not auto-register pattern "${patternName}":`, err.message);
  }
};

/**
 * Get all patterns from MongoDB
 */
const getAllPatterns = async () => {
  return await Pattern.find({}).sort({ name: 1 }).lean();
};

/**
 * Pre-seed standard patterns into DB if empty
 */
const seedStandardPatterns = async () => {
  for (const p of STANDARD_PATTERNS) {
    const slug = toSlug(p.name);
    const exists = await Pattern.findOne({ slug });
    if (!exists) {
      await Pattern.create({
        ...p,
        slug,
        createdBy: "system"
      });
    }
  }
};

module.exports = {
  getPatternBySlugOrName,
  ensurePatternExists,
  getAllPatterns,
  seedStandardPatterns,
  toSlug
};
