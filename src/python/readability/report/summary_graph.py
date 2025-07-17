import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Load your data
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv")

# Assign weights
w_mc = 0.4
w_nc = 0.25
w_ol = 0.15
w_dr = 0.2

# Calculate weighted composite score
df["R"] = w_mc * df["MC"] + w_nc * df["NC"] + w_ol * df["OL"] + w_dr * df["DR"]

# Create output folder if not exists
os.makedirs("readability/reports/graphs/", exist_ok=True)

# 1. Histogram of Composite Score R
plt.figure(figsize=(8, 5))
sns.histplot(df["R"], kde=True, color='mediumvioletred')
plt.title("Histogram of Weighted Composite Readability Score (R)")
plt.xlabel("Composite Score (R)")
plt.ylabel("Frequency")
plt.savefig("readability/reports/graphs/composite_score_hist.png")
plt.close()

# 2. Boxplots for All Factors and Composite Score
plt.figure(figsize=(10, 6))
sns.boxplot(data=df[["MC", "NC", "OL", "DR", "R"]], palette="Set2")
plt.title("Boxplot of Readability Factors and Composite Score")
plt.ylabel("Score")
plt.savefig("readability/reports/graphs/boxplot_factors_composite.png")
plt.close()

# 3. (Optional) Violin plot for more detail
plt.figure(figsize=(10, 6))
sns.violinplot(data=df[["MC", "NC", "OL", "DR", "R"]], palette="Set3")
plt.title("Violin Plot of Readability Factors and Composite Score")
plt.ylabel("Score")
plt.savefig("readability/reports/graphs/violinplot_factors_composite.png")
plt.close()

print("Composite score and plots saved in readability/reports/graphs/")
