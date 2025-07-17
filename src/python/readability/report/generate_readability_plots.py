import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ---- SETTINGS ----
input_csv = "readability/scoring/dataset/bad_identifiers_100k_MC_NC_OL_DR.csv"
output_dir = "readability/reports/graphs_bad_identifiers"
os.makedirs(output_dir, exist_ok=True)

# ---- Load data ----
df = pd.read_csv(input_csv)
df.columns = [c.strip() for c in df.columns]
factors = ['MC', 'NC', 'OL', 'DR']

# ---- Check columns ----
missing = [f for f in factors if f not in df.columns]
if missing:
    raise ValueError(f"Missing columns: {missing}")

# ---- Assign weights and compute composite ----
w_mc, w_nc, w_ol, w_dr = 0.4, 0.25, 0.15, 0.2
df["R"] = w_mc * df["MC"] + w_nc * df["NC"] + w_ol * df["OL"] + w_dr * df["DR"]

# ---- 1. Panel Histogram: MC, NC, OL, DR ----
sns.set(style="whitegrid", palette="pastel", font_scale=1.2)
titles = [
    "Meaningful Clarity (MC)", "Naming Conformance (NC)",
    "Optimal Length (OL)", "Domain Relevance (DR)"
]
colors = ['#4DB6AC', '#FFD54F', '#9575CD', '#FF8A65']

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
plt.savefig(f"{output_dir}/histogram_MC_NC_OL_DR.png", dpi=200)
plt.close()

# ---- 2. Boxplots of MC, NC, OL, DR by Language ----
if "Language" in df.columns:
    plt.figure(figsize=(14, 8))
    for i, factor in enumerate(factors, 1):
        plt.subplot(2, 2, i)
        sns.boxplot(data=df, x='Language', y=factor, palette='Set2')
        plt.title(f'Boxplot of {factor} by Language')
        plt.xlabel('Language')
        plt.ylabel(factor)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/boxplot_language_MC_NC_OL_DR.png")
    plt.close()

# ---- 3. Boxplots and Violin Plots for All Factors & Composite ----
plt.figure(figsize=(10, 6))
sns.boxplot(data=df[["MC", "NC", "OL", "DR", "R"]], palette="Set2")
plt.title("Boxplot of Readability Factors and Composite Score")
plt.ylabel("Score")
plt.savefig(f"{output_dir}/boxplot_factors_composite.png")
plt.close()

plt.figure(figsize=(10, 6))
sns.violinplot(data=df[["MC", "NC", "OL", "DR", "R"]], palette="Set3")
plt.title("Violin Plot of Readability Factors and Composite Score")
plt.ylabel("Score")
plt.savefig(f"{output_dir}/violinplot_factors_composite.png")
plt.close()

# ---- 4. Histogram of Composite Score ----
plt.figure(figsize=(8, 5))
sns.histplot(df["R"], kde=True, color='mediumvioletred')
plt.title("Histogram of Weighted Composite Readability Score (R)")
plt.xlabel("Composite Score (R)")
plt.ylabel("Frequency")
plt.savefig(f"{output_dir}/composite_score_hist.png")
plt.close()

# ---- 5. Pairwise relationships between all 4 factors and R ----
sns.pairplot(df[factors + ["R"]], corner=True, plot_kws={'alpha':0.5}, diag_kind="kde")
plt.suptitle("Pairwise Scatter/KDE of Factor Scores", fontsize=14, y=1.02)
plt.tight_layout()
plt.savefig(f"{output_dir}/pairplot_factors.png")
plt.close()

# ---- 6. Correlation heatmap of the factors ----
plt.figure(figsize=(6,5))
corr = df[factors + ["R"]].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0)
plt.title("Correlation Heatmap: MC, NC, OL, DR, R")
plt.tight_layout()
plt.savefig(f"{output_dir}/correlation_heatmap.png")
plt.close()

print(f"All composite visualizations saved in {output_dir}/")
