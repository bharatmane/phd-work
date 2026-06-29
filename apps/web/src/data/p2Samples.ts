export type P2Sample = {
  level: "High" | "Medium" | "Low";
  name: string;
  code: string;
  features: {
    num_of_lines_norm: number;
    code_length_norm: number;
    cyclomatic_complexity_norm: number;
    indents_norm: number;
    loop_count_norm: number;
    line_length_norm: number;
    identifiers_norm: number;
  };
};

// Real samples pulled from the actual Kaggle "Code Snippets: Insights and Readability"
// dataset used to train/evaluate ECRVR-MVEL (kaggle_augmented.csv, 1,564 Python solutions).
// Ground-truth labels and structural features below are the dataset's recorded values —
// not live ensemble model output (the GCN+DBN+BiTCN ensemble itself isn't deployed here).
export const p2Samples: P2Sample[] = [
  {
    level: "High",
    name: "maxDistance",
    code: `class Solution:
    def maxDistance(self, colors: List[int]) -> int:
        n = len(colors)
        for i in range(n - 1, 0, -1):
            for j in range(n - i):
                if colors[j] != colors[j + i]:
                    return i`,
    features: {
      num_of_lines_norm: 0.06,
      code_length_norm: 0.047,
      cyclomatic_complexity_norm: 0.368,
      indents_norm: 0.286,
      loop_count_norm: 0.115,
      line_length_norm: 0.276,
      identifiers_norm: 0.109,
    },
  },
  {
    level: "High",
    name: "getIntersectionNode",
    code: `class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        Set=set()
        curr= headA
        while curr:
            Set.add(curr)
            curr=curr.next
        curr=headB
        while curr:
            if curr in Set:
                return curr
            curr=curr.next
        return None`,
    features: {
      num_of_lines_norm: 0.149,
      code_length_norm: 0.083,
      cyclomatic_complexity_norm: 0.316,
      indents_norm: 0.286,
      loop_count_norm: 0.115,
      line_length_norm: 0.139,
      identifiers_norm: 0.156,
    },
  },
  {
    level: "Medium",
    name: "canVisitAllRooms",
    code: `class Solution:
    def canVisitAllRooms(self, rooms: List[List[int]]) -> bool:
        A, B = [0], []
        visited_room_set = set()
        while A:
            B = set([k for r in A for k in rooms[r] if k not in visited_room_set])
            visited_room_set.update(A)
            A, B = B, []

        return len(visited_room_set) == len(rooms)`,
    features: {
      num_of_lines_norm: 0.104,
      code_length_norm: 0.084,
      cyclomatic_complexity_norm: 0.263,
      indents_norm: 0.286,
      loop_count_norm: 0.154,
      line_length_norm: 0.278,
      identifiers_norm: 0.188,
    },
  },
  {
    level: "Medium",
    name: "checkValid",
    code: `class Solution:
    def checkValid(self, matrix: List[List[int]]) -> bool:
        n=len(matrix)

        return all(len(set(row))==n for row in matrix) and all(len(set(col))==n for col in zip(*matrix))`,
    features: {
      num_of_lines_norm: 0.03,
      code_length_norm: 0.038,
      cyclomatic_complexity_norm: 0.211,
      indents_norm: 0.143,
      loop_count_norm: 0.077,
      line_length_norm: 0.441,
      identifiers_norm: 0.109,
    },
  },
  {
    level: "Low",
    name: "relativeSortArray",
    code: `class Solution:
    def relativeSortArray(self, arr1: List[int], arr2: List[int]) -> List[int]:
        return sorted(arr1, key=lambda x: (arr2.index(x) if x in arr2 else math.inf, x))`,
    features: {
      num_of_lines_norm: 0.0,
      code_length_norm: 0.03,
      cyclomatic_complexity_norm: 0.211,
      indents_norm: 0.143,
      loop_count_norm: 0.038,
      line_length_norm: 0.969,
      identifiers_norm: 0.094,
    },
  },
  {
    level: "Low",
    name: "isPowerOfThree",
    code: `class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        return n > 0 and math.isclose(round(math.log(n, 3)), math.log(n, 3), rel_tol = 0.000000000000001)`,
    features: {
      num_of_lines_norm: 0.0,
      code_length_norm: 0.025,
      cyclomatic_complexity_norm: 0.211,
      indents_norm: 0.143,
      loop_count_norm: 0.0,
      line_length_norm: 0.855,
      identifiers_norm: 0.094,
    },
  },
];
