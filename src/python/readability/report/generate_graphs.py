import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# SETTINGS
input_csv = "readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv"
output_dir = "readability/reports/graphs/bad_identifiers"
os.makedirs(output_dir, exist_ok=True)

# Load data
df = pd.read_csv(input_csv)

# Clean up column names if needed (strip whitespace)
df.columns = [c.strip() for c in df.columns]

factors = ["MC", "NC", "OL", "DR"]

# --- 1. Histograms for each factor
for factor in factors:
    plt.figure(figsize=(6,4))
    sns.histplot(df[factor], kde=True, color=sns.color_palette("crest", as_cmap=True)(0.7))
    plt.title(f"Histogram of {factor}")
    plt.xlabel(factor + " Score")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/hist_{factor}.png")
    plt.close()

# --- 2. Boxplots for each factor by Language and Identifier Type
for by in ["Language", "Identifier Type"]:
    for factor in factors:
        plt.figure(figsize=(8,4))
        sns.boxplot(x=by, y=factor, data=df, palette="viridis")
        plt.title(f"{factor} Boxplot by {by}")
        plt.xlabel(by)
        plt.ylabel(factor + " Score")
        plt.tight_layout()
        plt.savefig(f"{output_dir}/box_{factor}_by_{by.replace(' ', '_')}.png")
        plt.close()

# --- 3. Violin plots for more shape detail (optional)
for by in ["Language", "Identifier Type"]:
    for factor in factors:
        plt.figure(figsize=(8,4))
        sns.violinplot(x=by, y=factor, data=df, palette="pastel", inner="quartile")
        plt.title(f"{factor} Violin Plot by {by}")
        plt.xlabel(by)
        plt.ylabel(factor + " Score")
        plt.tight_layout()
        plt.savefig(f"{output_dir}/violin_{factor}_by_{by.replace(' ', '_')}.png")
        plt.close()

# --- 4. Pairwise relationships between all 4 factors
sns.pairplot(df[factors], corner=True, plot_kws={'alpha':0.5}, diag_kind="kde")
plt.suptitle("Pairwise Scatter/KDE of Factor Scores", fontsize=14, y=1.02)
plt.tight_layout()
plt.savefig(f"{output_dir}/pairplot_factors.png")
plt.close()

# --- 5. Correlation heatmap of the factors
plt.figure(figsize=(5,4))
corr = df[factors].corr()
sns.heatmap(corr, annot=True, cmap="coolwarm", center=0)
plt.title("Correlation Heatmap: MC, NC, OL, DR")
plt.tight_layout()
plt.savefig(f"{output_dir}/correlation_heatmap.png")
plt.close()

# --- 6. Final Score Histogram (if you add a column for composite score)
if "Final" in df.columns or "Composite" in df.columns:
    col = "Final" if "Final" in df.columns else "Composite"
    plt.figure(figsize=(6,4))
    sns.histplot(df[col], kde=True, color=sns.color_palette("flare", as_cmap=True)(0.7))
    plt.title(f"Histogram of {col} Score")
    plt.xlabel(col + " Score")
    plt.ylabel("Count")
    plt.tight_layout()
    plt.savefig(f"{output_dir}/hist_{col}.png")
    plt.close()

print(f"All graphs saved in {output_dir}/")
