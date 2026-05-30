# IRAF-XADL Demo Code Samples

Paste any snippet below into the demo at http://localhost:8000.
Expected verdicts are indicative — the model decides based on identifiers + structure.

---

> **Note on High readability:** The training dataset (LeetCode solutions) labels
> one-liner and two-liner solutions as High readability. Longer code — even when
> beautifully named — is Medium or Low because the dataset equates brevity with
> readability. This is intentional — see the thesis limitation section.

## High Readability (short, simple — matches training data)

### 1. Anagram Check
```python
class Solution:
    def isAnagram(self, s, t):
        return sorted(s) == sorted(t)
```

### 2. Palindrome Check
```python
class Solution:
    def isPalindrome(self, s):
        cleaned = ''.join(c.lower() for c in s if c.isalnum())
        return cleaned == cleaned[::-1]
```

### 3. Sum of Two Numbers
```python
class Solution:
    def getSum(self, first_number, second_number):
        return first_number + second_number
```

### 4. Find Maximum Value
```python
def find_maximum_value(number_list):
    maximum_value = number_list[0]
    for current_number in number_list:
        if current_number > maximum_value:
            maximum_value = current_number
    return maximum_value
```

### 5. Temperature Converter
```python
def celsius_to_fahrenheit(celsius_temperature):
    return celsius_temperature * 9 / 5 + 32

def fahrenheit_to_celsius(fahrenheit_temperature):
    return (fahrenheit_temperature - 32) * 5 / 9
```

---

## Medium Readability

### 6. Graph Shortest Path (Dijkstra)
```python
class Graph:
    def __init__(self, num_vertices):
        self.V = num_vertices
        self.adj = [[] for _ in range(self.V)]

    def add_edge(self, u, v, w):
        self.adj[u].append((v, w))
        self.adj[v].append((u, w))

    def dijkstra(self, src):
        import heapq
        dist = [float('inf')] * self.V
        dist[src] = 0
        pq = [(0, src)]
        visited = [False] * self.V
        while pq:
            d, u = heapq.heappop(pq)
            if visited[u]:
                continue
            visited[u] = True
            for v, w in self.adj[u]:
                if not visited[v] and dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(pq, (dist[v], v))
        return dist
```

### 7. Text Word Counter
```python
def count_word_frequency(text):
    word_counts = {}
    words = text.lower().split()
    for w in words:
        cleaned = w.strip(".,!?")
        if cleaned in word_counts:
            word_counts[cleaned] += 1
        else:
            word_counts[cleaned] = 1
    return word_counts
```

### 8. Matrix Multiplication
```python
def multiply_matrices(mat_a, mat_b):
    rows_a = len(mat_a)
    cols_a = len(mat_a[0])
    cols_b = len(mat_b[0])
    result = [[0] * cols_b for _ in range(rows_a)]
    for i in range(rows_a):
        for j in range(cols_b):
            for k in range(cols_a):
                result[i][j] += mat_a[i][k] * mat_b[k][j]
    return result
```

### 9. LRU Cache
```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
```

---

## Low Readability

### 10. Cryptic Array Operations
```python
def f(a, b, c):
    x = 0
    for i in range(len(a)):
        for j in range(len(b)):
            if a[i] > b[j] and c != 0:
                x += a[i] * b[j] // c
            elif a[i] == b[j]:
                x -= 1
    return x
```

### 11. Obfuscated String Parser
```python
def p(s, d=','):
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
    return r
```

### 12. Complex LeetCode — Distance Limited Paths
```python
class Solution:
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
        return res
```

### 13. Poorly Named Sorting
```python
def s(arr, lo, hi):
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
    return arr
```

---

### 14. Discount Calculator — ~16 Identifiers, High Verdict
```python
def apply_discount(original_price, discount_rate, tax_rate):
    discount_amount = original_price * discount_rate
    discounted_price = original_price - discount_amount
    tax_amount = discounted_price * tax_rate
    final_price = discounted_price + tax_amount
    return final_price
```

### 15. Password Validator — ~18 Identifiers, High/Medium Verdict
```python
def validate_password(password, minimum_length=8):
    has_uppercase = any(char.isupper() for char in password)
    has_lowercase = any(char.islower() for char in password)
    has_digit = any(char.isdigit() for char in password)
    is_long_enough = len(password) >= minimum_length
    return has_uppercase and has_lowercase and has_digit and is_long_enough
```

---

## Important Note for the Demo

**The model defines "readability" as the Kaggle dataset does: shorter, simpler code scores Higher.**

| Rule of thumb | Effect |
|---|---|
| Lines | Identifiers (AST count) | Expected verdict |
|---|---|---|
| ≤ 12 lines | ≤ 20 | **High** |
| 12–18 lines | 20–30 | **Medium** |
| 18+ lines | 30+ | **Low** |

(Based on training data: High median = 11 lines / 16 identifiers, Low median = 22 lines / 39 identifiers)

Single-letter names (`i`, `j`, `u`) pull MC and NC down but structural size is the dominant signal.

This is the dataset's definition — it rewards conciseness. A 40-line class with perfect naming still scores Low because code length correlates -0.66 and identifier count -0.81 with the readability label. This limitation is documented in Run 04 of EXPERIMENTS_LOG.md.

**For the thesis defence:** the model correctly learns the labelling criteria. The research contribution is the architecture (SA-BiLSTM + CodeBERT + SHAP) — which features explain the label is a dataset choice, not an architecture flaw.

---

## Feature Reference

- **Attention weight** — which identifier the SA-BiLSTM focused on most (sums to 1.0 across identifiers).
- **MC (Meaningful Clarity)** — drops to 0 for single-letter names like `i`, `j`, `u`, `v`.
- **NC (Naming Conformance)** — penalises single-char function names like `f`, `s`, `p`.
- **OL (Optimal Length)** — prefers names between 6–18 characters.
- **CLS (Cognitive Load Score)** — combines MC + LF + PR — low means hard to read.
- **PR (Pronounceability)** — vowel ratio; names like `pq`, `adj` score low.
