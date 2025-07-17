import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# 1. Load the dataset
df = pd.read_csv('readability/scoring/dataset/my_gibberish.csv', encoding='latin1')  # Adjust the filename
X = df['Response']                 # Or whatever the column name is
y = df['Label']                    # 0 = gibberish, 1 = not gibberish

# 2. Train classifier
vectorizer = TfidfVectorizer(ngram_range=(1,2), min_df=2, max_features=10000)
X_vec = vectorizer.fit_transform(X)
clf = LogisticRegression(max_iter=500)
clf.fit(X_vec, y)

# 3. To use on new identifier:
def gibberish_prob(identifier):
    X_new = vectorizer.transform([identifier])
    return 1 - clf.predict_proba(X_new)[0][1]  # High value = gibberish

# 4. Example:
print(gibberish_prob('GJDJHDJLD'))  # Should be high for gibberish
print(gibberish_prob('getUserData'))  # Should be low for non-gibberish
