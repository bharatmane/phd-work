import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy.stats import pearsonr
import os

# --- CONFIG ---
CSV_PATH = "readability/scoring/dataset/survery_identifiers_rated_by_model_human.csv"
output_dir = "readability/reports/human_vs_mc"
os.makedirs(output_dir, exist_ok=True)

# --- LOAD DATA ---
df = pd.read_csv(CSV_PATH)

# --- 1. Correlation scatter plots for all factors ---
factors = ['MC', 'NC', 'DR', 'OL', 'R']
for col in factors:
    plt.figure(figsize=(5, 4))
    plt.scatter(df[col], df['HUMAN'], alpha=0.7)
    m, b = np.polyfit(df[col], df['HUMAN'], 1)
    plt.plot(df[col], m*df[col]+b, color='red', lw=1.5, label='Regression Line')
    r, _ = pearsonr(df[col], df['HUMAN'])
    plt.xlabel(f"{col} (Model)")
    plt.ylabel("Human Rating")
    plt.title(f"{col} vs. Human Ratings\n(Pearson r = {r:.2f})")
    plt.legend()
    plt.tight_layout()
    plt.grid(True)
    filename = os.path.join(output_dir, f"scatter_{col}_vs_human.png")
    plt.savefig(filename, dpi=300, bbox_inches="tight")
    plt.close()

# --- 2. Composite bar plot: R vs HUMAN (sorted) ---
df_sorted = df.sort_values('R')
plt.figure(figsize=(12, 6))
plt.bar(df_sorted['Identifier Name'], df_sorted['R'], alpha=0.6, label="Model R")
plt.bar(df_sorted['Identifier Name'], df_sorted['HUMAN'], alpha=0.6, label="Human", width=0.5)
plt.xticks(rotation=90, fontsize=8)
plt.ylabel("Score")
plt.title("Model Composite R vs. Human Rating (per Identifier)")
plt.legend()
plt.tight_layout()
filename = os.path.join(output_dir, "barplot_R_vs_HUMAN.png")
plt.savefig(filename, dpi=300, bbox_inches="tight")
plt.close()

# --- 3. Histogram of Human and Model R ---
plt.figure(figsize=(8, 5))
plt.hist(df['HUMAN'], bins=10, alpha=0.7, label='Human', color='skyblue')
plt.hist(df['R'], bins=10, alpha=0.7, label='Model R', color='orange')
plt.xlabel("Score")
plt.ylabel("Count")
plt.title("Distribution of Human vs. Model Composite Scores")
plt.legend()
filename = os.path.join(output_dir, "histogram_R_vs_HUMAN.png")
plt.savefig(filename, dpi=300, bbox_inches="tight")
plt.close()

# --- 4. Regression (R vs. HUMAN) ---
plt.figure(figsize=(6,5))
plt.scatter(df['R'], df['HUMAN'], alpha=0.7)
m, b = np.polyfit(df['R'], df['HUMAN'], 1)
plt.plot(df['R'], m*df['R']+b, color='red', lw=2, label='Regression Line')
r, _ = pearsonr(df['R'], df['HUMAN'])
plt.text(0.1, 0.9, f"Pearson r = {r:.2f}", transform=plt.gca().transAxes, fontsize=12)
plt.xlabel("Model Composite R")
plt.ylabel("Human Rating")
plt.title("Model vs. Human: Readability Alignment")
plt.legend()
plt.grid(True)
filename = os.path.join(output_dir, "regression_R_vs_HUMAN.png")
plt.savefig(filename, dpi=300, bbox_inches="tight")
plt.close()

# --- 5. Heatmap of Factor Correlations ---
corr = df[['MC', 'NC', 'DR', 'OL', 'R', 'HUMAN']].corr()
plt.figure(figsize=(7,6))
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title("Correlation Matrix: Model Factors & Human Rating")
plt.tight_layout()
filename = os.path.join(output_dir, "heatmap_correlation.png")
plt.savefig(filename, dpi=300, bbox_inches="tight")
plt.close()

print(f"All plots generated and saved in {output_dir}.")
