import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../components/common/SectionHeader";
import { GlassCard } from "../components/common/GlassCard";

const HIGH: { title: string; description: string; code: string }[] = [
  {
    title: "Discount Calculator",
    description: "Clear function and variable names. Short, single-purpose.",
    code: `def calculate_discount(original_price, discount_rate, tax_rate):
    discount_amount = original_price * discount_rate
    discounted_price = original_price - discount_amount
    tax_amount = discounted_price * tax_rate
    return discounted_price + tax_amount`,
  },
  {
    title: "Anagram Check",
    description: "Descriptive parameter names. One-liner logic.",
    code: `class Solution:
    def isAnagram(self, first_string, second_string):
        return sorted(first_string) == sorted(second_string)`,
  },
  {
    title: "Palindrome Check",
    description: "Meaningful intermediate variable. Easy to follow.",
    code: `class Solution:
    def isPalindrome(self, input_string):
        cleaned = ''.join(c.lower() for c in input_string if c.isalnum())
        return cleaned == cleaned[::-1]`,
  },
  {
    title: "Maximum Value Finder",
    description: "Verbose but clear. Every variable is self-explaining.",
    code: `def find_maximum_value(number_list):
    maximum_value = number_list[0]
    for current_number in number_list:
        if current_number > maximum_value:
            maximum_value = current_number
    return maximum_value`,
  },
  {
    title: "Temperature Converter",
    description: "Clear function names. No ambiguous abbreviations.",
    code: `def celsius_to_fahrenheit(celsius_temperature):
    return celsius_temperature * 9 / 5 + 32

def fahrenheit_to_celsius(fahrenheit_temperature):
    return (fahrenheit_temperature - 32) * 5 / 9`,
  },
  {
    title: "Password Validator",
    description: "Each boolean variable is a complete English sentence.",
    code: `def validate_password(password, minimum_length=8):
    has_uppercase = any(char.isupper() for char in password)
    has_lowercase = any(char.islower() for char in password)
    has_digit = any(char.isdigit() for char in password)
    is_long_enough = len(password) >= minimum_length
    return has_uppercase and has_lowercase and has_digit and is_long_enough`,
  },
  {
    title: "User Age Validator",
    description: "Domain-readable identifiers. Instant comprehension.",
    code: `def is_eligible_to_vote(birth_year, current_year, voting_age=18):
    age = current_year - birth_year
    return age >= voting_age`,
  },
  {
    title: "String Reversal",
    description: "Short but names explain the transformation.",
    code: `class Solution:
    def reverseString(self, input_characters):
        reversed_characters = input_characters[::-1]
        return reversed_characters`,
  },
  {
    title: "Sum of Two Numbers",
    description: "Typed parameters. Single clear return.",
    code: `class Solution:
    def getSum(self, first_number: int, second_number: int) -> int:
        return first_number + second_number`,
  },
  {
    title: "Fibonacci Number",
    description: "Named recursion. The function name is the algorithm.",
    code: `def calculate_fibonacci(position):
    if position <= 1:
        return position
    return calculate_fibonacci(position - 1) + calculate_fibonacci(position - 2)`,
  },
];

const LOW: { title: string; description: string; code: string }[] = [
  {
    title: "Mystery Array Operation",
    description: "Single-letter names. No indication of intent.",
    code: `def f(a, b, c):
    x = 0
    for i in range(len(a)):
        for j in range(len(b)):
            if a[i] > b[j] and c != 0:
                x += a[i] * b[j] // c
            elif a[i] == b[j]:
                x -= 1
    return x`,
  },
  {
    title: "Obfuscated Parser",
    description: "One-letter variables. Unclear purpose throughout.",
    code: `def p(s, d=','):
    r, t, e = [], '', False
    for c in s:
        if c == '"':
            e = not e
        elif c == d and not e:
            r.append(t.strip())
            t = ''
        else:
            t += c
    if t:
        r.append(t.strip())
    return r`,
  },
  {
    title: "Cryptic Sort (Quicksort)",
    description: "Function named 's'. All identifiers are one character.",
    code: `def s(arr, lo, hi):
    if lo < hi:
        p = arr[hi]
        i = lo - 1
        for j in range(lo, hi):
            if arr[j] <= p:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
        arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
        m = i + 1
        s(arr, lo, m - 1)
        s(arr, m + 1, hi)
    return arr`,
  },
  {
    title: "Distance Limited Paths",
    description: "Multi-level nesting. All inputs named with single letters.",
    code: `class Solution:
    def distanceLimitedPathsExist(self, n, A, B):
        p = list(range(n))
        def find(x):
            while p[x] != x:
                p[x] = p[p[x]]
                x = p[x]
            return x
        def union(x, y):
            p[find(x)] = find(y)
        A.sort(key=lambda x: x[2])
        B = sorted(enumerate(B), key=lambda x: x[1][2])
        res = [False] * len(B)
        i = 0
        for j, (idx, (u, v, w)) in enumerate(B):
            while i < len(A) and A[i][2] < w:
                union(A[i][0], A[i][1])
                i += 1
            res[idx] = find(u) == find(v)
        return res`,
  },
  {
    title: "Unreadable String Processor",
    description: "Chained operations on single-char variables.",
    code: `def proc(s):
    r = ''
    for i in range(len(s)):
        c = s[i]
        if i % 2 == 0:
            r += c.upper()
        else:
            r += c.lower()
    return r`,
  },
  {
    title: "Opaque Number Cruncher",
    description: "Unclear what the function computes or why.",
    code: `def calc(n, m, k):
    res = 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if (i * j) % k == 0:
                res += i * j
            elif i + j > k:
                res -= i
    return res % (10 ** 9 + 7)`,
  },
  {
    title: "Terse Matrix Traversal",
    description: "Nested loops with no context on what rows/cols mean.",
    code: `def tr(m, r, c):
    v = [[False]*c for _ in range(r)]
    def dfs(x, y):
        if x < 0 or y < 0 or x >= r or y >= c or v[x][y] or m[x][y] == 0:
            return 0
        v[x][y] = True
        return 1+dfs(x+1,y)+dfs(x-1,y)+dfs(x,y+1)+dfs(x,y-1)
    return max(dfs(i,j) for i in range(r) for j in range(c))`,
  },
  {
    title: "Single-Letter Heap",
    description: "u, v, w, d, pq — no semantic meaning.",
    code: `def sp(g, s):
    import heapq
    d = [float('inf')] * len(g)
    d[s] = 0
    pq = [(0, s)]
    while pq:
        w, u = heapq.heappop(pq)
        for v, c in g[u]:
            if d[u] + c < d[v]:
                d[v] = d[u] + c
                heapq.heappush(pq, (d[v], v))
    return d`,
  },
  {
    title: "Bit Manipulation Puzzle",
    description: "No names explain the bit-manipulation intent.",
    code: `def bm(n):
    r = 0
    for i in range(32):
        r = (r << 1) | (n & 1)
        n >>= 1
    return r`,
  },
  {
    title: "Confusing Two-Pointer",
    description: "l, r, m — classic but unexplained in context.",
    code: `def bs(arr, t):
    l, r = 0, len(arr) - 1
    while l <= r:
        m = (l + r) // 2
        if arr[m] == t:
            return m
        elif arr[m] < t:
            l = m + 1
        else:
            r = m - 1
    return -1`,
  },
];

function CodeCard({
  item,
  tag,
  onTryDemo,
}: {
  item: { title: string; description: string; code: string };
  tag: "High" | "Low";
  onTryDemo: (code: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = tag === "High"
    ? { border: "border-emerald-400/20", badge: "bg-emerald-500/20 text-emerald-300" }
    : { border: "border-rose-400/20",    badge: "bg-rose-500/20    text-rose-300"    };

  return (
    <div className={`rounded-2xl border ${colors.border} bg-white/5 p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold mb-1 ${colors.badge}`}>
            {tag} Readability
          </span>
          <h4 className="font-semibold text-white text-sm">{item.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
        </div>
        <button
          onClick={() => onTryDemo(item.code)}
          className="shrink-0 rounded-full bg-cyan-400/20 border border-cyan-400/40
                     px-3 py-1 text-xs font-semibold text-cyan-300
                     hover:bg-cyan-400/30 transition-colors whitespace-nowrap"
        >
          Try in Demo
        </button>
      </div>
      <div className="mt-3">
        <pre
          className={`rounded-xl bg-black/40 p-3 text-xs text-slate-300 font-mono
                     overflow-x-auto transition-all ${expanded ? "" : "max-h-24 overflow-hidden"}`}
        >
          {item.code}
        </pre>
        {item.code.split("\n").length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? "▲ Collapse" : "▼ Show full code"}
          </button>
        )}
      </div>
    </div>
  );
}

export function SamplesPage() {
  const navigate = useNavigate();

  const handleTryDemo = (code: string) => {
    sessionStorage.setItem("demo_prefill", code);
    navigate("/demo");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Code Samples"
        title="10 High · 10 Low readability examples"
        description='Each sample can be sent directly to the live demo. "High" samples have clear, descriptive identifier names. "Low" samples use cryptic abbreviations, single-letter variables, or obfuscated logic.'
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* High */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display text-2xl text-emerald-300">High Readability</h2>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30
                             px-3 py-1 text-xs font-semibold text-emerald-300">
              10 samples
            </span>
          </div>
          <div className="space-y-4">
            {HIGH.map((item, i) => (
              <CodeCard key={i} item={item} tag="High" onTryDemo={handleTryDemo} />
            ))}
          </div>
        </div>

        {/* Low */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-display text-2xl text-rose-300">Low Readability</h2>
            <span className="rounded-full bg-rose-500/20 border border-rose-400/30
                             px-3 py-1 text-xs font-semibold text-rose-300">
              10 samples
            </span>
          </div>
          <div className="space-y-4">
            {LOW.map((item, i) => (
              <CodeCard key={i} item={item} tag="Low" onTryDemo={handleTryDemo} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
