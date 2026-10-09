// Algorithmic Pattern Knowledge Base
// Provides curated concept maps, node invariants, and canonical blueprints for all pattern categories.

export const PATTERN_FAMILIES = {
  LINKED_LIST: 'linked_list',
  TWO_POINTERS: 'two_pointers',
  SLIDING_WINDOW: 'sliding_window',
  BINARY_SEARCH: 'binary_search',
  HASH_MAP: 'hash_map',
  TREES: 'trees',
  DYNAMIC_PROGRAMMING: 'dynamic_programming',
  STACK: 'stack',
  HEAP: 'heap',
  GRAPH: 'graph',
  BACKTRACKING: 'backtracking',
  INTERVALS: 'intervals',
  TRIE: 'trie',
  BIT_MANIPULATION: 'bit_manipulation'
};

export function getPatternFamily(patternName = '', patternId = '') {
  const s = `${patternName} ${patternId}`.toLowerCase();
  if (s.includes('linked') || s.includes('list traversal') || s.includes('fast & slow pointer')) return PATTERN_FAMILIES.LINKED_LIST;
  if (s.includes('two pointer') || s.includes('opposite direction') || s.includes('two-pointer')) return PATTERN_FAMILIES.TWO_POINTERS;
  if (s.includes('sliding') || s.includes('window')) return PATTERN_FAMILIES.SLIDING_WINDOW;
  if (s.includes('binary search')) return PATTERN_FAMILIES.BINARY_SEARCH;
  if (s.includes('tree') || s.includes('bst') || s.includes('level order')) return PATTERN_FAMILIES.TREES;
  if (s.includes('dp') || s.includes('dynamic programming') || s.includes('knapsack') || s.includes('lcs')) return PATTERN_FAMILIES.DYNAMIC_PROGRAMMING;
  if (s.includes('stack') || s.includes('monotonic stack')) return PATTERN_FAMILIES.STACK;
  if (s.includes('heap') || s.includes('priority queue')) return PATTERN_FAMILIES.HEAP;
  if (s.includes('graph') || s.includes('topological') || s.includes('union find') || s.includes('dijkstra')) return PATTERN_FAMILIES.GRAPH;
  if (s.includes('backtrack') || s.includes('subset') || s.includes('permutation') || s.includes('combination')) return PATTERN_FAMILIES.BACKTRACKING;
  if (s.includes('interval')) return PATTERN_FAMILIES.INTERVALS;
  if (s.includes('trie') || s.includes('prefix tree')) return PATTERN_FAMILIES.TRIE;
  if (s.includes('bit') || s.includes('manipulation')) return PATTERN_FAMILIES.BIT_MANIPULATION;
  return PATTERN_FAMILIES.HASH_MAP;
}

export const PATTERN_DETAILS = {
  [PATTERN_FAMILIES.LINKED_LIST]: {
    name: 'Linked List Traversal & Pointer Manipulation',
    family: 'Sequential Reference Management',
    subtitle: 'Safe single-pass node rewiring and runner pointer mechanics',
    beginnerIntuition: 'Think of a linked list like a treasure hunt where each clue (node) only tells you where the next clue is. If you accidentally erase a clue before reading it, you lose the rest of the trail forever! That is why we use temporary pointers to guard the trail.',
    nodes: [
      {
        id: 'sentinel',
        title: 'Sentinel / Dummy Head',
        badge: 'Setup',
        color: '#6366f1',
        role: 'Edge-Case Shield',
        desc: 'Allocates a dummy node pointing to head (`dummy.next = head`). Eliminates edge cases when deleting, inserting, or reversing the original head node.',
        invariant: '`dummy.next` always points to the true start of the modified linked list.',
        pitfall: 'Forgetting to return `dummy.next` instead of `head` when the head pointer was modified.'
      },
      {
        id: 'pointers',
        title: 'Pointer Triad (prev, curr, next)',
        badge: 'Loop State',
        color: '#3b82f6',
        role: 'Boundary Tracking',
        desc: 'Maintains three explicit references: `prev` (already reversed/processed), `curr` (active node), and `next` (temporary holder for remaining unvisited list).',
        invariant: 'Before rewiring, `next = curr.next` preserves the unvisited suffix so the chain is never lost.',
        pitfall: 'Rewiring `curr.next = prev` before storing `curr.next`, creating a dangling memory leak.'
      },
      {
        id: 'runner',
        title: 'Fast & Slow Runner',
        badge: 'Technique',
        color: '#8b5cf6',
        role: 'Cycle & Midpoint Detection',
        desc: 'Slow pointer moves 1 step; Fast pointer moves 2 steps. When fast reaches end, slow sits exactly at the middle. Inside a cycle, relative distance decreases by 1 each turn.',
        invariant: 'At step t, `fast` is at position 2t and `slow` is at position t.',
        pitfall: 'Only checking `fast.next !== null` without checking `fast !== null`, leading to null pointer exceptions on even-length lists.'
      },
      {
        id: 'rewire',
        title: 'Pointer Rewire & Splice',
        badge: 'Core Op',
        color: '#10b981',
        role: 'Local Transformation',
        desc: 'Executes pointer assignment (`curr.next = prev` or `curr.next = next.next`) to restructure node topology in O(1) auxiliary space.',
        invariant: 'The sublist ending at `curr` forms a valid, cycle-free linked structure at the end of each iteration.',
        pitfall: 'Creating circular references by failing to sever old forward links.'
      },
      {
        id: 'termination',
        title: 'Null Guard Termination',
        badge: 'Exit',
        color: '#ec4899',
        role: 'Safe Boundary Exit',
        desc: 'Loop concludes cleanly when `curr === null` or `fast === null || fast.next === null`.',
        invariant: 'Every reachable node has been visited exactly once without index-out-of-bounds.',
        pitfall: 'Off-by-one errors on terminating conditions for odd vs even node lengths.'
      }
    ],
    invariants: {
      core: 'At the start of step k, the sublist ending at prev contains the first k-1 processed nodes in their final desired order, curr points to the active node k, and the remaining nodes k+1..N remain intact and reachable.',
      initialization: 'prev = null, curr = head. The processed sublist is empty (valid), and head contains all N unvisited nodes.',
      maintenance: 'Temporary variable next holds curr.next. curr is spliced or rewired to prev. prev advances to curr, and curr advances to next. The processed sublist grows by 1 node while maintaining valid topology.',
      termination: 'curr reaches null. All N nodes have been transferred to the processed sublist, and prev points to the new valid list head.',
      timeComplexity: 'O(N) — single pass traversal',
      spaceComplexity: 'O(1) auxiliary — in-place pointer updates'
    },
    blueprint: `// Canonical Pattern Template: Linked List Traversal & In-Place Reversal
function reverseLinkedList(head) {
  // 1. Setup loop invariant state: prev holds reversed prefix, curr holds active node
  let prev = null;
  let curr = head;

  while (curr !== null) {
    // 2. Preserve unvisited suffix before overwriting pointer
    const nextNode = curr.next;

    // 3. Rewire active pointer backwards
    curr.next = prev;

    // 4. Advance invariant boundary: prev becomes current reversed head
    prev = curr;
    curr = nextNode;
  }

  // 5. Termination: curr is null, prev points to new reversed head
  return prev;
}`
  },

  [PATTERN_FAMILIES.TWO_POINTERS]: {
    name: 'Two Pointers (Inward & Outward Convergence)',
    family: 'Linear Search Space Pruning',
    subtitle: 'Opposite-direction boundary compression leveraging sorted order',
    beginnerIntuition: 'Imagine two people walking toward each other from opposite ends of a sorted street. If their combined score is too small, the left person steps forward. If too large, the right person steps backward. You eliminate half the street with every single step!',
    nodes: [
      {
        id: 'left_bound',
        title: 'Left Boundary (left = 0)',
        badge: 'Setup',
        color: '#3b82f6',
        role: 'Minimum Candidate',
        desc: 'Anchors the lower bound of the search space. Increments to strictly increase sum or evaluate next candidate.',
        invariant: '`left` monotonically increases, never backtracking.',
        pitfall: 'Incrementing left past right when search bounds overlap.'
      },
      {
        id: 'right_bound',
        title: 'Right Boundary (right = n-1)',
        badge: 'Setup',
        color: '#8b5cf6',
        role: 'Maximum Candidate',
        desc: 'Anchors the upper bound of the search space. Decrements to strictly decrease sum or reduce search window.',
        invariant: '`right` monotonically decreases, never backtracking.',
        pitfall: 'Initial index set to `n` instead of `n - 1`.'
      },
      {
        id: 'eval_condition',
        title: 'Decision Invariant',
        badge: 'Core Op',
        color: '#10b981',
        role: 'Search Space Pruning',
        desc: 'Compares `nums[left] + nums[right]` against target. If sum < target, no pairing with nums[left] can reach target, so left must increment. If sum > target, right must decrement.',
        invariant: 'All discarded pairs are mathematically proven to be non-viable, eliminating O(N²) checks.',
        pitfall: 'Applying two-pointer convergence to an unsorted array without sorting first.'
      },
      {
        id: 'convergence',
        title: 'Convergence Exit (left < right)',
        badge: 'Exit',
        color: '#ec4899',
        role: 'Termination',
        desc: 'Terminates when pointers meet, having explored all optimal candidate pairs in O(N) time.',
        invariant: 'Search space is partitioned and exhausted without redundancy.',
        pitfall: 'Using `<=` when problem requires distinct elements (e.g., pairs).'
      }
    ],
    invariants: {
      core: 'At any step, the optimal answer (or target pair) lies strictly within the closed interval [left, right]. Discarding left or right eliminates rows/columns of the 2D search matrix that cannot satisfy the condition.',
      initialization: 'left = 0, right = nums.length - 1. The interval [0, n-1] covers the entire input space.',
      maintenance: 'If nums[left] + nums[right] < target, then for all j <= right, nums[left] + nums[j] < target. Hence left can be safely discarded (left++). Symmetrically for right > target.',
      termination: 'left >= right. The search interval shrinks to empty; if no target was found, no valid pair exists.',
      timeComplexity: 'O(N) (or O(N log N) if sorting is required)',
      spaceComplexity: 'O(1) auxiliary'
    },
    blueprint: `// Canonical Pattern Template: Two Pointers (Target Sum on Sorted Array)
function twoSumSorted(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) {
      return [left, right]; // Found target pair
    } else if (sum < target) {
      left++; // Sum too small: discard left candidate
    } else {
      right--; // Sum too large: discard right candidate
    }
  }

  return []; // No valid pair found
}`
  },

  [PATTERN_FAMILIES.SLIDING_WINDOW]: {
    name: 'Sliding Window (Dynamic & Fixed Window)',
    family: 'Subarray State Maintenance',
    subtitle: 'Amortized linear scan maintaining a valid contiguous range',
    beginnerIntuition: 'Imagine looking through a magnifying glass that can stretch and shrink across a conveyor belt. You stretch the right edge to swallow items, and if it gets too heavy, you slide the left edge in to make it lighter!',
    nodes: [
      {
        id: 'expand',
        title: 'Right Pointer Expander',
        badge: 'Expansion',
        color: '#3b82f6',
        role: 'Intake Step',
        desc: 'Expands the window forward (`right++`) by absorbing elements and incorporating them into window state (hashmap frequency, running sum, character count).',
        invariant: 'Every element enters the window exactly once through the right pointer.',
        pitfall: 'Updating result before verifying window constraint validity.'
      },
      {
        id: 'validate',
        title: 'Validity Invariant Check',
        badge: 'Condition',
        color: '#eab308',
        role: 'Constraint Monitor',
        desc: 'Checks whether the current window `[left, right]` violates the problem constraints (e.g. character count exceeds allowed frequency, sum exceeds limit).',
        invariant: 'If window is invalid, the violation was caused exclusively by the newest element at `right`.',
        pitfall: 'Using `if` instead of `while` for multi-step contractions.'
      },
      {
        id: 'contract',
        title: 'Left Pointer Contractor',
        badge: 'Contraction',
        color: '#ef4444',
        role: 'Restoration Step',
        desc: 'Advances `left++` and evicts elements from the window state until the window returns to a valid legal state.',
        invariant: 'Every element is evicted by the left pointer at most once, guaranteeing amortized O(N) runtime.',
        pitfall: 'Decreasing element count in frequency map without removing key when count reaches zero.'
      },
      {
        id: 'record',
        title: 'Optimal Subsegment Record',
        badge: 'Result',
        color: '#10b981',
        role: 'Answer Extraction',
        desc: 'When window is valid, updates answer (`maxLen = max(maxLen, right - left + 1)` or min length).',
        invariant: '`right - left + 1` accurately represents the contiguous subarray length.',
        pitfall: 'Off-by-one error using `right - left` instead of `right - left + 1`.'
      }
    ],
    invariants: {
      core: 'At the end of each iteration, the window [left, right] satisfies the constraint, and all valid windows ending at right have been evaluated.',
      initialization: 'left = 0, right = 0, window state is initialized empty.',
      maintenance: 'Right expands by 1. While constraint is violated, left advances and evicts state. Once restored, the maximal valid window ending at right is captured.',
      termination: 'Right reaches array length N. Both left and right traverse at most N steps, yielding O(2N) = O(N) total operations.',
      timeComplexity: 'O(N) amortized linear scan',
      spaceComplexity: 'O(K) where K is distinct character/element count'
    },
    blueprint: `// Canonical Pattern Template: Sliding Window (Longest Valid Subarray)
function longestValidSubarray(s) {
  let left = 0;
  let maxLen = 0;
  const state = new Map();

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    state.set(char, (state.get(char) || 0) + 1);

    // Shrink window from the left while constraint is violated
    while (state.get(char) > 1) {
      const leftChar = s[left];
      state.set(leftChar, state.get(leftChar) - 1);
      left++;
    }

    // Invariant holds: window [left, right] is completely valid
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}`
  },

  [PATTERN_FAMILIES.BINARY_SEARCH]: {
    name: 'Binary Search & Monotonic Space Reduction',
    family: 'Logarithmic Divide & Conquer',
    subtitle: 'Halving monotonic search spaces on discrete indices or continuous answer ranges',
    beginnerIntuition: 'Like guessing a number between 1 and 100 where someone says "Too high" or "Too low". You always guess the exact middle (50). Within 7 guesses, you are guaranteed to find any number out of 100!',
    nodes: [
      {
        id: 'bounds',
        title: 'Search Range [low, high]',
        badge: 'Setup',
        color: '#3b82f6',
        role: 'Boundary Anchor',
        desc: 'Defines the search space. Can be array indices `[0, n-1]` or feasible values `[1, max(nums)]` for Binary Search on Answer.',
        invariant: 'The optimal target value is guaranteed to exist within `[low, high]` if it exists at all.',
        pitfall: 'Setting initial high bound too small on answer-space search problems.'
      },
      {
        id: 'mid',
        title: 'Overflow-Safe Midpoint',
        badge: 'Pivot',
        color: '#8b5cf6',
        role: 'Center Pivot',
        desc: 'Calculates midpoint using `low + Math.floor((high - low) / 2)` to avoid integer 32-bit overflow.',
        invariant: '`low <= mid <= high` strictly holds on every iteration.',
        pitfall: 'Using `(low + high) / 2` which can overflow in languages with fixed-width integers.'
      },
      {
        id: 'predicate',
        title: 'Feasibility Predicate P(mid)',
        badge: 'Condition',
        color: '#eab308',
        role: 'Decision Oracle',
        desc: 'Evaluates monotonic property: `isFeasible(mid)`. Returns boolean indicating if candidate is acceptable.',
        invariant: 'The property P(x) is monotonic: if P(k) is true, then P(k+1) is also true (or vice-versa).',
        pitfall: 'Applying binary search on a non-monotonic function.'
      },
      {
        id: 'discard',
        title: 'Half-Space Discard',
        badge: 'Pruning',
        color: '#10b981',
        role: 'Logarithmic Halving',
        desc: 'If `nums[mid] < target`, discard `[low, mid]` by setting `low = mid + 1`. Else discard `[mid, high]` by setting `high = mid - 1`.',
        invariant: 'The search space size decreases by at least half each iteration: `size_k <= size_{k-1} / 2`.',
        pitfall: 'Infinite loop caused by setting `low = mid` without floor/ceil alignment.'
      }
    ],
    invariants: {
      core: 'At step k, the target lies in [low, high]. The midpoint divides the space into two halves; the non-viable half is discarded in O(1) or O(N), ensuring logarithmic termination.',
      initialization: 'low = 0, high = n - 1. The target is initially known to be in [0, n - 1].',
      maintenance: 'Midpoint is evaluated. Based on monotonicity, one half is proven not to contain the target and discarded. The remaining interval [low, high] retains the target.',
      termination: 'low > high. Search space has shrunk to zero elements. Target not found, or bounds converged to optimal boundary.',
      timeComplexity: 'O(log N) operations',
      spaceComplexity: 'O(1) auxiliary'
    },
    blueprint: `// Canonical Pattern Template: Binary Search (Discrete Monotonic Space)
function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    // Safe midpoint calculation avoiding integer overflow
    const mid = low + Math.floor((high - low) / 2);

    if (nums[mid] === target) {
      return mid; // Exact match found
    } else if (nums[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }

  return -1; // Target not found
}`
  },

  [PATTERN_FAMILIES.DYNAMIC_PROGRAMMING]: {
    name: 'Dynamic Programming (State Transitions & Memoization)',
    family: 'Optimal Substructure & Overlapping Subproblems',
    subtitle: 'Breaking complex problems into topologically sorted recurrence relations',
    beginnerIntuition: 'Like climbing a staircase: instead of re-counting every possible footstep from the bottom each time, you write down the answer for step 1, 2, and 3 on a notepad. To find step 4, you simply look at steps 2 and 3 on your notepad!',
    nodes: [
      {
        id: 'state_def',
        title: 'State Definition dp[i]',
        badge: 'Foundation',
        color: '#6366f1',
        role: 'Subproblem Schema',
        desc: 'Explicitly defines what `dp[i]` represents (e.g. minimum cost to reach step i, or maximum profit with i items).',
        invariant: 'Every unique state vector unambiguously identifies a subproblem.',
        pitfall: 'Vague state definitions that omit necessary dimensions like remaining capacity or turn.'
      },
      {
        id: 'base_case',
        title: 'Base Case Boundaries',
        badge: 'Setup',
        color: '#3b82f6',
        role: 'Trivial Anchors',
        desc: 'Initializes base states: `dp[0] = 0` or base boundary conditions. Provides seeds for bottom-up computation.',
        invariant: 'Base cases require zero lookbacks and are strictly mathematically correct.',
        pitfall: 'Incorrect base case initialization (e.g. setting 0 instead of Infinity for minimization).'
      },
      {
        id: 'recurrence',
        title: 'State Transition Equation',
        badge: 'Core Formula',
        color: '#10b981',
        role: 'Optimal Relation',
        desc: 'Calculates `dp[i] = min/max(dp[i - 1], dp[i - 2] + cost)`. Derives current state from previously solved smaller states.',
        invariant: 'Subproblems form a Directed Acyclic Graph (DAG) with no cyclic dependencies.',
        pitfall: 'Order of nested loops violating dependency topological order.'
      },
      {
        id: 'space_opt',
        title: 'Rolling Space Optimization',
        badge: 'Optimization',
        color: '#ec4899',
        role: 'Memory Compression',
        desc: 'If `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, replace the O(N) array with two variables `prev1`, `prev2` to achieve O(1) space.',
        invariant: 'At step i, `prev1` represents `dp[i-1]` and `prev2` represents `dp[i-2]`.',
        pitfall: 'Overwriting `prev1` before computing the next state.'
      }
    ],
    invariants: {
      core: 'At step i, for all j < i, dp[j] holds the provably optimal solution to subproblem j. dp[i] is computed directly from optimal subproblem combinations without recomputing.',
      initialization: 'Base cases dp[0..k] are explicitly known and seeded.',
      maintenance: 'State transition evaluates all valid choices for state i and selects the optimal one based on verified subproblems.',
      termination: 'Table reaches target state dp[N], which contains the global optimal solution.',
      timeComplexity: 'O(N) (or O(N * M) for 2D states)',
      spaceComplexity: 'O(N) table or O(1) rolling space'
    },
    blueprint: `// Canonical Pattern Template: Dynamic Programming (Bottom-Up Tabulation)
function solveDP(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  // 1. Base cases
  let prev2 = nums[0];
  let prev1 = Math.max(nums[0], nums[1]);

  // 2. Topological state transitions
  for (let i = 2; i < nums.length; i++) {
    const current = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = current;
  }

  // 3. Final state represents global optimum
  return prev1;
}`
  },

  [PATTERN_FAMILIES.TREES]: {
    name: 'Tree Traversal (DFS & BFS Level Order)',
    family: 'Hierarchical Node Traversal',
    subtitle: 'Recursive divide-and-conquer and queue-based breadth exploration',
    beginnerIntuition: 'Think of a family tree or folder hierarchy on your computer. To find the largest file, you check your current folder, then ask each subfolder to report its largest file, combining their answers at the root.',
    nodes: [
      {
        id: 'null_guard',
        title: 'Base Case Null Guard',
        badge: 'Base Case',
        color: '#3b82f6',
        role: 'Leaf Termination',
        desc: 'Immediately checks `if (root === null) return 0` (or null). Prevents null pointer dereferences on child lookups.',
        invariant: 'Null pointers represent empty subtrees with trivial known results.',
        pitfall: 'Forgetting to return base value, returning undefined instead.'
      },
      {
        id: 'divide',
        title: 'Subtree Divide & Conquer',
        badge: 'Recursion',
        color: '#8b5cf6',
        role: 'Subtree Delegation',
        desc: 'Recursively invokes DFS on `root.left` and `root.right` to solve identical subproblems on smaller subtrees.',
        invariant: 'Each tree node is visited at most once; subtrees do not share overlapping non-null nodes.',
        pitfall: 'Exceeding recursion call stack limit on deeply skewed linear trees.'
      },
      {
        id: 'combine',
        title: 'Post-Order Synthesis',
        badge: 'Combine',
        color: '#10b981',
        role: 'Result Aggregation',
        desc: 'Synthesizes return value using current node value and left/right subtree returns: `1 + Math.max(leftHeight, rightHeight)`.',
        invariant: 'A parent node is computed only after both its children have completed evaluation.',
        pitfall: 'Confusing pre-order with post-order data dependency.'
      },
      {
        id: 'bfs_queue',
        title: 'FIFO Level Snapshot (BFS)',
        badge: 'Breadth',
        color: '#ec4899',
        role: 'Layer-by-Layer Scan',
        desc: 'Snaps `const levelSize = queue.length` before processing each layer. Ensures nodes are strictly grouped by tree depth.',
        invariant: 'All nodes currently in the queue share the exact same depth.',
        pitfall: 'Calling `queue.length` inside the loop condition as the queue dynamically changes.'
      }
    ],
    invariants: {
      core: 'In DFS, at node u, all nodes in subtree(u.left) and subtree(u.right) are fully processed before u returns. In BFS, all nodes at depth d are processed before any node at depth d+1.',
      initialization: 'Queue contains [root] for BFS, or root node enters call stack for DFS.',
      maintenance: 'Children of valid nodes are enqueued/visited. No cycles exist in standard trees.',
      termination: 'Queue is empty (BFS) or call stack empties (DFS). All N nodes evaluated exactly once.',
      timeComplexity: 'O(N) where N is number of tree nodes',
      spaceComplexity: 'O(H) recursion stack height or O(W) maximum level width'
    },
    blueprint: `// Canonical Pattern Template: Tree Depth-First Search (DFS)
function maxDepth(root) {
  // 1. Base case null guard
  if (root === null) return 0;

  // 2. Divide and conquer on left and right subtrees
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);

  // 3. Synthesize post-order result for parent node
  return 1 + Math.max(leftDepth, rightDepth);
}`
  },

  [PATTERN_FAMILIES.STACK]: {
    name: 'Stack & Monotonic Stack',
    family: 'LIFO & Nearest Greater/Smaller Element',
    subtitle: 'Maintaining strictly increasing or decreasing candidates to solve O(N²) in O(N)',
    beginnerIntuition: 'Like a stack of cafeteria plates: you can only add to the top or take from the top (Last In, First Out). A Monotonic Stack keeps plates ordered by size so you can instantly see which plate is bigger than the current one.',
    nodes: [
      {
        id: 'stack_holder',
        title: 'LIFO Index Stack',
        badge: 'Container',
        color: '#3b82f6',
        role: 'Candidate Storage',
        desc: 'Stores unresolved indices waiting for their next greater or smaller element in the stream.',
        invariant: 'Elements in stack are arranged in monotonic order (e.g. descending values from bottom to top).',
        pitfall: 'Storing values instead of indices when distances or positions are required.'
      },
      {
        id: 'monotone_check',
        title: 'Monotonicity Violation Test',
        badge: 'Condition',
        color: '#eab308',
        role: 'Resolution Trigger',
        desc: 'While `stack.length > 0 && nums[i] > nums[stack.peek()]`, the incoming element is the "next greater" for the top element.',
        invariant: 'Top of stack is always the closest candidate to the current element.',
        pitfall: 'Using `>=` instead of `>` leading to duplicate resolution errors.'
      },
      {
        id: 'resolve_pop',
        title: 'Pop & Resolution',
        badge: 'Core Op',
        color: '#10b981',
        role: 'Answer Assignment',
        desc: 'Pops resolved index `idx` and assigns `result[idx] = nums[i]`. Every index is pushed and popped at most once.',
        invariant: 'Every popped element has found its true first greater element to its right.',
        pitfall: 'Failing to initialize result array with default -1 or 0 for unresolved elements.'
      },
      {
        id: 'push_active',
        title: 'Push Current Candidate',
        badge: 'Invariant Hold',
        color: '#ec4899',
        role: 'Queueing',
        desc: 'Pushes current index `i` onto the stack. Monotonic order is restored.',
        invariant: 'After pushing i, the stack strictly maintains its monotonic property.',
        pitfall: 'Forgetting to push current index after popping all smaller elements.'
      }
    ],
    invariants: {
      core: 'At index i, the stack contains a monotonically decreasing sequence of indices whose next greater element has not yet appeared.',
      initialization: 'Stack is empty. Result array initialized to default values.',
      maintenance: 'Incoming element i pops all smaller elements from stack, resolving them. When popping finishes, element i is pushed, preserving monotonicity.',
      termination: 'Array scan concludes. Any indices remaining in stack have no greater element to their right.',
      timeComplexity: 'O(N) amortized — each index is pushed and popped at most once',
      spaceComplexity: 'O(N) auxiliary stack memory'
    },
    blueprint: `// Canonical Pattern Template: Monotonic Decreasing Stack (Next Greater Element)
function nextGreaterElement(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = []; // Stores indices

  for (let i = 0; i < nums.length; i++) {
    // Resolve all indices smaller than current incoming element
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      result[prevIdx] = nums[i]; // Found next greater element
    }
    stack.push(i); // Maintain monotonic invariant
  }

  return result;
}`
  },

  [PATTERN_FAMILIES.HASH_MAP]: {
    name: 'HashMap Lookup & State Frequency',
    family: 'Constant-Time Invariant Lookup',
    subtitle: 'Exchanging space for O(1) average-time complement and frequency queries',
    beginnerIntuition: 'Like an organized coat check: instead of searching every coat in the closet to find yours (O(N)), you hand them a numbered ticket and they hand you your coat in 1 second flat (O(1)).',
    nodes: [
      {
        id: 'hash_state',
        title: 'Lookup State Map',
        badge: 'Setup',
        color: '#6366f1',
        role: 'History Tracker',
        desc: 'Maintains seen elements, frequencies, or prefix states with O(1) average lookup and insertion time.',
        invariant: 'Map contains a complete record of all processed elements up to index i-1.',
        pitfall: 'Not accounting for duplicate values when storing indices as map values.'
      },
      {
        id: 'complement',
        title: 'Complement Query (target - x)',
        badge: 'Core Op',
        color: '#3b82f6',
        role: 'Instant Match',
        desc: 'Checks if `map.has(target - nums[i])`. Replaces nested O(N²) search with a single O(1) hash table lookup.',
        invariant: 'If a matching pair exists ending at index i, its counterpart is already in the map.',
        pitfall: 'Adding current element to map before querying complement, accidentally matching the element with itself.'
      },
      {
        id: 'state_update',
        title: 'State Ingestion',
        badge: 'Maintenance',
        color: '#10b981',
        role: 'Memory Ingestion',
        desc: 'Stores `map.set(nums[i], i)` or increments frequency count after query evaluation.',
        invariant: 'Map size never exceeds array length N.',
        pitfall: 'Failing to handle hash collisions or large key numbers properly.'
      },
      {
        id: 'return_result',
        title: 'O(1) Result Return',
        badge: 'Exit',
        color: '#ec4899',
        role: 'Immediate Return',
        desc: 'Returns matching indices `[map.get(complement), i]` as soon as pair condition is satisfied.',
        invariant: 'First valid pair or aggregate frequency is captured in a single pass.',
        pitfall: 'Returning 1-indexed values when problem requires 0-indexed values.'
      }
    ],
    invariants: {
      core: 'At step i, the map contains all elements seen in [0, i-1]. If a valid complement exists with an earlier element, it is found in O(1) time.',
      initialization: 'Map is initialized empty. If prefix sum is used, map.set(0, 1) seeds the empty prefix.',
      maintenance: 'Check map for complement. If found, result is recorded. Current element is then inserted into map.',
      termination: 'Array finishes or pair is found. Maximum N iterations with O(1) work per element.',
      timeComplexity: 'O(N) linear time',
      spaceComplexity: 'O(N) hash table capacity'
    },
    blueprint: `// Canonical Pattern Template: HashMap Complement Lookup (Two Sum)
function twoSum(nums, target) {
  const map = new Map(); // Stores value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Check if complement was observed earlier in O(1) time
    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    // Record current element after check to prevent self-pairing
    map.set(nums[i], i);
  }

  return [];
}`
  }
};

export function getPatternKnowledge(patternName = '', patternId = '') {
  const fam = getPatternFamily(patternName, patternId);
  return PATTERN_DETAILS[fam] || PATTERN_DETAILS[PATTERN_FAMILIES.HASH_MAP];
}
