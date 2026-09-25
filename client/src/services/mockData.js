/* ============================================================
   STUB MOCK DATA & PERSISTENCE HELPERS
   ============================================================ */

export const INITIAL_USER = {
  name: "Mohit Gupta",
  first: "Mohit",
  role: "Software Engineer",
  company: "Razorpay",
  experience: "3 yrs experience",
  bio: "Backend-leaning full-stack engineer prepping for a jump to a bigger systems role. Learns best by writing down what went wrong, not just what passed.",
  techStack: ["Node.js", "TypeScript", "PostgreSQL", "React", "AWS"],
  targetCompanies: ["Meta", "Stripe", "Google"],
  targetRole: "SDE-2 / Backend",
  preferredLanguage: "JavaScript",
  careerStage: "Mid-level, targeting senior",
  interviewDate: "2026-10-07",
  daysRemaining: 18,
  dailyGoal: 1,
  weeklyGoal: 5,
  studyStyle: "Deep focus, few problems, full reflection",
  initials: "MG",
  email: "mohit@example.com"
};

export const INITIAL_PATTERNS = [
  { id:"hashmap", name:"HashMap", attempted:14, solved:11, avgConfidence:3.9, revisions:1, status:"Strong" },
  { id:"sliding-window", name:"Sliding Window", attempted:9, solved:6, avgConfidence:3.4, revisions:1, status:"Practicing" },
  { id:"two-pointers", name:"Two Pointers", attempted:10, solved:8, avgConfidence:3.6, revisions:0, status:"Strong" },
  { id:"prefix-sum", name:"Prefix Sum", attempted:6, solved:4, avgConfidence:3.1, revisions:1, status:"Practicing" },
  { id:"binary-search", name:"Binary Search", attempted:7, solved:5, avgConfidence:3.3, revisions:0, status:"Practicing" },
  { id:"graphs", name:"Graphs", attempted:5, solved:2, avgConfidence:2.1, revisions:2, status:"Needs attention" },
  { id:"dynamic-programming", name:"Dynamic Programming", attempted:4, solved:1, avgConfidence:1.8, revisions:2, status:"Needs attention" },
  { id:"stack", name:"Stack", attempted:5, solved:4, avgConfidence:3.5, revisions:0, status:"Practicing" },
  { id:"intervals", name:"Intervals", attempted:3, solved:1, avgConfidence:2.4, revisions:0, status:"Developing" },
];

export const INITIAL_PROBLEMS = [
  {
    id:"two-sum", title:"Two Sum", difficulty:"Easy", platform:"LeetCode",
    patterns:["hashmap"], concepts:["Hash lookups","Complement search"],
    estimatedTime:"15–20 min", status:"Needs Revision", lastConfidence:2,
    learningObjectives:"Recognize when a single pass with a hash map beats the O(n²) brute force.",
    url:"https://leetcode.com/problems/two-sum/",
    codeSnippet: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
  },
  {
    id:"subarray-sum-equals-k", title:"Subarray Sum Equals K", difficulty:"Medium", platform:"LeetCode",
    patterns:["prefix-sum","hashmap"], concepts:["Running sum","Complement counting"],
    estimatedTime:"25–30 min", status:"Solved", lastConfidence:3,
    learningObjectives:"Use a prefix-sum + hashmap combo to count subarrays in one pass.",
    url:"https://leetcode.com/problems/subarray-sum-equals-k/",
    codeSnippet: `function subarraySum(nums, k) {
  let count = 0, sum = 0;
  const map = new Map();
  map.set(0, 1);
  for (let n of nums) {
    sum += n;
    if (map.has(sum - k)) count += map.get(sum - k);
    map.set(sum, (map.get(sum) || 0) + 1);
  }
  return count;
}`
  },
  {
    id:"longest-substring", title:"Longest Substring Without Repeating Characters", difficulty:"Medium", platform:"LeetCode",
    patterns:["sliding-window"], concepts:["Window expansion/contraction","Character indexing"],
    estimatedTime:"25 min", status:"Solved", lastConfidence:4,
    learningObjectives:"Maintain a dynamic window with a map of last-seen character positions.",
    url:"https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    codeSnippet: `function lengthOfLongestSubstring(s) {
  let map = new Map(), maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
  },
  {
    id:"course-schedule", title:"Course Schedule", difficulty:"Medium", platform:"LeetCode",
    patterns:["graphs"], concepts:["Topological sort","Cycle detection"],
    estimatedTime:"35–40 min", status:"Needs Revision", lastConfidence:2,
    learningObjectives:"Detect cycles in a directed graph using DFS states or Kahn's algorithm.",
    url:"https://leetcode.com/problems/course-schedule/",
    codeSnippet: `function canFinish(numCourses, prerequisites) {
  const adj = Array.from({length: numCourses}, () => []);
  for (const [u, v] of prerequisites) adj[v].push(u);
  const visited = new Array(numCourses).fill(0);
  function dfs(node) {
    if (visited[node] === 1) return true;
    if (visited[node] === 2) return false;
    visited[node] = 1;
    for (const neighbor of adj[node]) {
      if (dfs(neighbor)) return true;
    }
    visited[node] = 2;
    return false;
  }
  for (let i = 0; i < numCourses; i++) {
    if (dfs(i)) return false;
  }
  return true;
}`
  },
  {
    id:"binary-search-basic", title:"Binary Search", difficulty:"Easy", platform:"LeetCode",
    patterns:["binary-search"], concepts:["Invariant maintenance","Boundary handling"],
    estimatedTime:"10–15 min", status:"Solved", lastConfidence:5,
    learningObjectives:"Keep loop invariants precise enough to avoid off-by-one errors.",
    url:"https://leetcode.com/problems/binary-search/",
    codeSnippet: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
  },
  {
    id:"maximum-subarray", title:"Maximum Subarray", difficulty:"Medium", platform:"LeetCode",
    patterns:["dynamic-programming"], concepts:["Kadane's algorithm","Local vs global optimum"],
    estimatedTime:"20 min", status:"Needs Revision", lastConfidence:1,
    learningObjectives:"Track the best subarray ending at each index rather than recomputing sums.",
    url:"https://leetcode.com/problems/maximum-subarray/",
    codeSnippet: `function maxSubArray(nums) {
  let current = nums[0], max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    max = Math.max(max, current);
  }
  return max;
}`
  },
  {
    id:"k-radius-averages", title:"K Radius Subarray Averages", difficulty:"Medium", platform:"LeetCode",
    patterns:["prefix-sum"], concepts:["Sliding sum","Integer overflow care"],
    estimatedTime:"20–25 min", status:"Not Attempted", lastConfidence:null,
    learningObjectives:"Precompute prefix sums to answer fixed-radius range queries in O(1).",
    url:"https://leetcode.com/problems/k-radius-subarray-averages/",
    codeSnippet: `function getAverages(nums, k) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  if (k === 0) return nums;
  const len = 2 * k + 1;
  if (len > n) return res;
  let sum = 0;
  for (let i = 0; i < len; i++) sum += nums[i];
  res[k] = Math.floor(sum / len);
  for (let i = k + 1; i < n - k; i++) {
    sum = sum - nums[i - k - 1] + nums[i + k];
    res[i] = Math.floor(sum / len);
  }
  return res;
}`
  },
  {
    id:"merge-intervals", title:"Merge Intervals", difficulty:"Medium", platform:"LeetCode",
    patterns:["intervals"], concepts:["Sorting by start time","Linear merge"],
    estimatedTime:"20–25 min", status:"In Progress", lastConfidence:null,
    learningObjectives:"Sort first, then merge in one linear pass by comparing each interval to the last merged one.",
    url:"https://leetcode.com/problems/merge-intervals/",
    codeSnippet: `function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const curr = intervals[i];
    const last = res[res.length - 1];
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      res.push(curr);
    }
  }
  return res;
}`
  },
];

export const INITIAL_ATTEMPTS = [
  {
    id:"a-201", problemId:"subarray-sum-equals-k", attemptNumber:1, date:"2026-09-19", when:"Today",
    outcome:"Solved with hints", hints:3, confidence:3, durationMin:34, language:"JavaScript",
    approach:"Started brute force, switched to prefix-sum + hashmap after the second hint.",
    algorithm:"Prefix sum with running-count hashmap.",
    keyInsight:"The complement (currentSum - k) is the thing to look up, not the raw sum.",
    mistakes:"Forgot to seed the map with {0: 1}, undercounted subarrays starting at index 0.",
    complexity:"O(n) time, O(n) space.",
    reflection:"needs-follow-up",
    reflectionNote:"Comfortable with the pattern now, but only after a nudge. Worth one more cold attempt.",
    startedAt:"10:12 AM", completedAt:"10:46 AM"
  },
  {
    id:"a-200", problemId:"longest-substring", attemptNumber:2, date:"2026-09-18", when:"Yesterday",
    outcome:"Solved", hints:0, confidence:4, durationMin:41, language:"JavaScript",
    approach:"Two-pointer sliding window with a map of last-seen indices.",
    algorithm:"Sliding window, O(n) single pass.",
    keyInsight:"Jump the left pointer directly to (lastSeen + 1) instead of incrementing one step at a time.",
    mistakes:"None significant — one early off-by-one caught by a test case.",
    complexity:"O(n) time, O(min(n, charset)) space.",
    reflection:"clean",
    reflectionNote:"This one finally clicked. Faster and more confident than the first attempt three weeks ago.",
    startedAt:"7:20 PM", completedAt:"8:01 PM"
  },
  {
    id:"a-199", problemId:"merge-intervals", attemptNumber:1, date:"2026-09-17", when:"2 days ago",
    outcome:"Paused", hints:0, confidence:null, durationMin:18, language:"JavaScript",
    approach:"Sorted intervals by start time, was about to write the merge loop.",
    algorithm:"Sort + linear merge (planned).",
    keyInsight:"—",
    mistakes:"—",
    complexity:"—",
    reflection:"in-progress",
    reflectionNote:"Ran out of time before the merge logic. Picking this back up tomorrow.",
    startedAt:"9:40 PM", completedAt:null
  },
  {
    id:"a-198", problemId:"two-sum", attemptNumber:2, date:"2026-09-15", when:"4 days ago",
    outcome:"Solved with hints", hints:3, confidence:2, durationMin:22, language:"JavaScript",
    approach:"Tried brute force first, needed hints to move to a hashmap.",
    algorithm:"Single-pass hashmap of value → index.",
    keyInsight:"Store the complement lookup before inserting the current number, not after.",
    mistakes:"Inserted into the map before checking for the complement, would have double-counted a self-pair.",
    complexity:"O(n) time, O(n) space.",
    reflection:"needs-follow-up",
    reflectionNote:"The approach still isn't automatic. Flagging for a cold revisit.",
    startedAt:"6:05 PM", completedAt:"6:27 PM"
  },
  {
    id:"a-197", problemId:"course-schedule", attemptNumber:1, date:"2026-09-12", when:"7 days ago",
    outcome:"Could not solve", hints:2, confidence:1, durationMin:38, language:"JavaScript",
    approach:"Attempted DFS but didn't track visiting-vs-visited states correctly.",
    algorithm:"DFS cycle detection (incomplete).",
    keyInsight:"A node in the current recursion stack (not just \"seen\") is what signals a cycle.",
    mistakes:"Used a single visited set, couldn't distinguish 'currently exploring' from 'fully explored'.",
    complexity:"Target: O(V + E).",
    reflection:"needs-follow-up",
    reflectionNote:"Graphs are the pattern to spend real time on before the interview.",
    startedAt:"8:15 PM", completedAt:"8:53 PM"
  },
  {
    id:"a-196", problemId:"maximum-subarray", attemptNumber:1, date:"2026-09-10", when:"9 days ago",
    outcome:"Could not solve", hints:3, confidence:1, durationMin:29, language:"JavaScript",
    approach:"Tried nested loops, ran out of time to convert to Kadane's.",
    algorithm:"Brute force (incomplete).",
    keyInsight:"Reset the running sum to 0 whenever it goes negative — don't carry a losing streak forward.",
    mistakes:"Didn't reset the running sum after it went negative.",
    complexity:"Brute force was O(n²); Kadane's is O(n).",
    reflection:"needs-follow-up",
    reflectionNote:"Dynamic programming intuition isn't there yet. Needs deliberate practice, not just more problems.",
    startedAt:"7:00 PM", completedAt:"7:29 PM"
  },
  {
    id:"a-195", problemId:"binary-search-basic", attemptNumber:1, date:"2026-09-08", when:"11 days ago",
    outcome:"Solved", hints:0, confidence:5, durationMin:9, language:"JavaScript",
    approach:"Standard iterative binary search with inclusive bounds.",
    algorithm:"Binary search, O(log n).",
    keyInsight:"—",
    mistakes:"—",
    complexity:"O(log n) time, O(1) space.",
    reflection:"clean",
    reflectionNote:"Comfortable — this pattern is internalized.",
    startedAt:"6:40 PM", completedAt:"6:49 PM"
  },
];

export const INITIAL_REVISIONS = [
  {
    id:"r-1", problemId:"course-schedule", sourceAttemptId:"a-197",
    reason:"Repeated mistake", focus:"Topological sort — track visiting vs. visited states explicitly this time.",
    status:"overdue", scheduledFor:"2026-09-17", overdueByDays:2
  },
  {
    id:"r-2", problemId:"two-sum", sourceAttemptId:"a-198",
    reason:"Low confidence, needed hints", focus:"HashMap approach, without opening the earlier solution.",
    status:"today", scheduledFor:"2026-09-19", overdueByDays:0
  },
  {
    id:"r-3", problemId:"maximum-subarray", sourceAttemptId:"a-196",
    reason:"Could not solve independently", focus:"Kadane's algorithm — reset the running sum on negative, from a blank editor.",
    status:"tomorrow", scheduledFor:"2026-09-20", overdueByDays:0
  },
];

export const CONFIDENCE_TREND = [2, 2, 3, 2, 4, 3];
export const HINTS_TREND = [3, 2, 2, 1, 0, 3];
export const SOLVED_PER_WEEK = [2, 4, 3, 5, 3];
export const OUTCOME_DISTRIBUTION = [
  { label:"Solved clean", value:34, color:"var(--success)" },
  { label:"Solved with hints", value:22, color:"var(--warning)" },
  { label:"Could not solve", value:9, color:"var(--danger)" },
  { label:"Paused / in progress", value:5, color:"var(--text-muted)" },
];

/* Persistence helpers for local stub mode */
export function getStoredData(key, initial) {
  try {
    const val = localStorage.getItem(`dsa_${key}`);
    return val ? JSON.parse(val) : initial;
  } catch (e) {
    return initial;
  }
}

export function setStoredData(key, value) {
  try {
    localStorage.setItem(`dsa_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to store data', key, e);
  }
}
