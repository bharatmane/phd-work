import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Read your data
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv")

# Set style for prettier plots
sns.set(style="whitegrid", palette="pastel", font_scale=1.2)

factors = ['MC', 'NC', 'OL', 'DR']
titles = [
    "Meaningful Clarity (MC)",
    "Naming Conformance (NC)",
    "Optimal Length (OL)",
    "Domain Relevance (DR)"
]
colors = ['#4DB6AC', '#FFD54F', '#9575CD', '#FF8A65']  # Teal, Yellow, Purple, Orange

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
axes = axes.flatten()

for i, factor in enumerate(factors):
    sns.histplot(
        df[factor], bins=30, kde=True, ax=axes[i], color=colors[i], edgecolor='k'
    )
    axes[i].set_title(titles[i])
    axes[i].set_xlim(0, 1)
    axes[i].set_xlabel("Score")
    axes[i].set_ylabel("Frequency")

fig.suptitle("Distribution of Readability Factor Scores (MC, NC, OL, DR)", fontsize=18, y=1.02)
plt.tight_layout(rect=[0, 0, 1, 0.97])

plt.savefig("readability/reports/graphs/histogram_MC_NC_OL_DR.png", dpi=200)
plt.close()
print("Histogram panel for MC, NC, OL, DR saved as readability/reports/graphs/histogram_MC_NC_OL_DR.png")
