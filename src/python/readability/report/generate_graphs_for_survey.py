import pandas as pd
import matplotlib.pyplot as plt

# Read CSV (replace path if needed)
df = pd.read_csv("readability/scoring/dataset/Survey_Readability.csv")

# Compute the mean, ignoring NaNs
df['MeanHuman'] = df.mean(axis=1, skipna=True)

# Drop rows where MeanHuman could not be calculated (all-NaN row)
df = df.dropna(subset=['MeanHuman'])

# Check if any row still has all NaN
print("Any row with all NaN?", df.isnull().all(axis=1).any())

# Plot histogram of mean human ratings
plt.figure(figsize=(8,5))
plt.hist(df["MeanHuman"], bins=20, color="skyblue", edgecolor="k")
plt.title("Histogram of Mean Human Ratings")
plt.xlabel("Mean Human Rating")
plt.ylabel("Frequency")
plt.tight_layout()
plt.savefig("readability/reports/graphs/histogram_mean_human_rating.png")
plt.show()
