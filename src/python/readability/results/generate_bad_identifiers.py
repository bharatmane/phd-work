import pandas as pd
import random
import string
from tqdm import tqdm

bad_words = [
    'foo', 'bar', 'baz', 'qux', 'tmp', 'val', 'data', 'asdf', 'q', 'x', 'i', 'j', 'n', 'aa', 'zz',
    'test', 'thing', 'obj', 'stuff', 'something', 'it', 'this', 'my', 'var', 'v', 'r', 'one', 'two', 'three',
     "foo", "bar", "baz", "tmp", "temp", "var", "test", "obj", "item", "data",
    "flag", "i", "j", "k", "l", "m", "n", "p", "q", "v", "result", "res", "lst",
    "str", "num", "val", "ptr", "main", "ch", "node", "thing", "obj1", "obj2",
    "arr", "func", "run", "calc", "out", "exec", "t", "s", "buf", "util", "map",
    "helper", "case", "ref", "output", "input", "aa", "bb", "cc", "dd", "ee",
    "zzz", "xxx", "yyy", "zzz", "zz", "xy", "foo1", "foo2", "bar1", "bar2",
    "data1", "data2", "var1", "var2", "val1", "val2", "temp1", "temp2",
    "result1", "result2", "node1", "node2", "flag1", "flag2", "a", "b", "c", "d"
]

def random_bad_name():
    patterns = [
        lambda: ''.join(random.choices(string.ascii_lowercase, k=random.choice([1,2,3]))),
        lambda: ''.join(random.choices(string.ascii_uppercase, k=random.choice([1,2,3]))),
        lambda: random.choice(bad_words),
        lambda: ''.join(random.choices('asdfghjklqwertyuiopzxcvbnm', k=random.randint(4, 10))),
        lambda: ''.join(random.choices('xyzabc', k=random.randint(3, 6))),
        lambda: ''.join([random.choice(['a', '4', 'e', '3', 'o', '0', 'i', '1', 's', '5']) for _ in range(random.randint(3, 8))]),
        lambda: random.choice(['count', 'list', 'string', 'map', 'set', 'obj', 'temp']),
        lambda: random.choice(['item', 'element', 'data', 'info', 'stuff', 'user', 'field', 'var']),
        lambda: ''.join(random.choices(string.ascii_uppercase, k=random.randint(4, 12))),
        lambda: ''.join(random.choices(string.ascii_letters, k=random.randint(6, 16)))
    ]
    return random.choice(patterns)()

def random_type():
    return random.choice(['variable', 'function', 'class'])

def random_language():
    return random.choice(['Java', 'Python', 'C#', 'JavaScript'])

data = []
for _ in tqdm(range(100_000), desc="Generating bad identifiers"):
    name = random_bad_name()
    id_type = random_type()
    lang = random_language()
    row = {
        'Project': 'synthetic-bad',
        'Language': lang,
        'Identifier Type': id_type,
        'Identifier Name': name,
        'Length': len(name)
    }
    data.append(row)

df = pd.DataFrame(data)
df.to_csv("readability/scoring/dataset/bad_identifiers_100k.csv", index=False)
print("Bad identifier CSV saved as readability/scoring/dataset/bad_identifiers_100k.csv")
