"""
Step 5 — Statistical analysis and figure generation for the Paper 4 study.

Addresses all four research questions:
  RQ1: Mann-Whitney U + Cohen's d — readability: correct vs incorrect
  RQ2: Logistic regression AUC + Spearman ρ — readability predicts correctness?
  RQ3: Kruskal-Wallis + Dunn post-hoc — DRI@Model across LLMs
  RQ4: Feature importance from logistic regression — which of 10 params drive DRI?

Usage:
    python analyze.py --input data/dri_dataset.csv --output results/

Outputs:
    results/figure1_readability_distribution.png
    results/figure2_dri_per_model.png
    results/figure3_feature_importance.png
    results/figure4_dri_distribution.png
    results/table1_rq1_rq2.txt
    results/table2_rq3_dri_model.txt
    results/table3_rq4_feature_importance.txt
    results/summary.txt
"""

from __future__ import annotations

import argparse
import warnings
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats
from scipy.stats import mannwhitneyu, kruskal, spearmanr
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

FEATURE_COLS = ["feat_MC", "feat_NC", "feat_OL", "feat_DR", "feat_PR",
                "feat_LF", "feat_CC", "feat_SA", "feat_CLS", "feat_PRED"]
FEATURE_LABELS = ["MC", "NC", "OL", "DR", "PR", "LF", "CC", "SA", "CLS", "PRED"]

PALETTE = {
    "correct":   "#34d399",   # emerald
    "incorrect": "#f87171",   # rose
    "dri":       "#818cf8",   # indigo
}
MODEL_COLORS = ["#38bdf8", "#a78bfa", "#fb923c", "#4ade80", "#f472b6"]


# ── helpers ────────────────────────────────────────────────────────────────

def cohens_d(a: pd.Series, b: pd.Series) -> float:
    na, nb = len(a), len(b)
    pooled_std = np.sqrt(((na - 1) * a.std() ** 2 + (nb - 1) * b.std() ** 2) /
                         (na + nb - 2))
    return (a.mean() - b.mean()) / (pooled_std + 1e-9)


def dunn_posthoc(df: pd.DataFrame, group_col: str, value_col: str) -> pd.DataFrame:
    """Pairwise Mann-Whitney U with Bonferroni correction."""
    groups = df[group_col].unique()
    results = []
    pairs = [(a, b) for i, a in enumerate(groups) for b in groups[i+1:]]
    for a, b in pairs:
        x = df[df[group_col] == a][value_col]
        y = df[df[group_col] == b][value_col]
        _, p = mannwhitneyu(x, y, alternative="two-sided")
        results.append({"group_a": a, "group_b": b, "p_raw": p})
    res_df = pd.DataFrame(results)
    # Bonferroni correction
    res_df["p_bonferroni"] = np.minimum(res_df["p_raw"] * len(pairs), 1.0)
    res_df["significant"] = res_df["p_bonferroni"] < 0.05
    return res_df


def apply_style() -> None:
    plt.rcParams.update({
        "figure.facecolor": "#0f172a",
        "axes.facecolor":   "#1e293b",
        "axes.edgecolor":   "#334155",
        "axes.labelcolor":  "#cbd5e1",
        "text.color":       "#cbd5e1",
        "xtick.color":      "#64748b",
        "ytick.color":      "#64748b",
        "grid.color":       "#334155",
        "grid.linestyle":   "--",
        "grid.alpha":       0.4,
        "font.family":      "monospace",
        "axes.spines.top":  False,
        "axes.spines.right": False,
    })


# ── RQ1 ────────────────────────────────────────────────────────────────────

def rq1_readability_distribution(df: pd.DataFrame, out_dir: Path) -> str:
    correct   = df[df["correct"]]["p_high"]
    incorrect = df[~df["correct"]]["p_high"]

    u_stat, p_val = mannwhitneyu(incorrect, correct, alternative="two-sided")
    d = cohens_d(incorrect, correct)
    n_incorrect_high = (df[~df["correct"]]["readability_label"] == "High").sum()
    pct_incorrect_high = n_incorrect_high / max((~df["correct"]).sum(), 1) * 100

    # Figure
    apply_style()
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor("#0f172a")

    for i, (ax, model) in enumerate(zip(axes, ["All models", None])):
        data = df if model is None else df[df["model"] == model]
        correct_data   = data[data["correct"]]["p_high"]
        incorrect_data = data[~data["correct"]]["p_high"]
        parts = ax.violinplot([correct_data, incorrect_data],
                               positions=[0, 1], showmedians=True)
        colors = [PALETTE["correct"], PALETTE["incorrect"]]
        for j, pc in enumerate(parts["bodies"]):
            pc.set_facecolor(colors[j]); pc.set_alpha(0.6)
        for comp in ["cmedians", "cbars", "cmaxes", "cmins"]:
            parts[comp].set_color("#94a3b8")
        ax.set_xticks([0, 1])
        ax.set_xticklabels(["Correct", "Incorrect"])
        ax.set_ylabel("P(High readability)")
        ax.set_title("RQ1: Readability Distribution")
        ax.yaxis.grid(True); ax.set_axisbelow(True)

    plt.tight_layout()
    path = out_dir / "figure1_readability_distribution.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()

    result = (
        f"RQ1 — Mann-Whitney U Test\n"
        f"{'─'*50}\n"
        f"U statistic        : {u_stat:.1f}\n"
        f"p-value            : {p_val:.4e}\n"
        f"Cohen's d          : {d:.4f}\n"
        f"Correct   P_High   : {correct.mean():.4f} ± {correct.std():.4f}\n"
        f"Incorrect P_High   : {incorrect.mean():.4f} ± {incorrect.std():.4f}\n"
        f"Incorrect w/ High  : {n_incorrect_high}/{(~df['correct']).sum()} ({pct_incorrect_high:.1f}%)\n"
        f"Significant (α=0.05): {'YES' if p_val < 0.05 else 'NO'}\n"
    )
    return result


# ── RQ2 ────────────────────────────────────────────────────────────────────

def rq2_readability_predicts_correctness(df: pd.DataFrame) -> str:
    rho, p_spear = spearmanr(df["p_high"], df["correct"].astype(int))

    X = df[["p_high"]].values
    y = df["correct"].astype(int).values
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X, y)
    proba = lr.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, proba)

    result = (
        f"\nRQ2 — Readability as Correctness Predictor\n"
        f"{'─'*50}\n"
        f"Spearman ρ (P_High vs correct) : {rho:.4f}\n"
        f"Spearman p-value               : {p_spear:.4e}\n"
        f"Logistic Regression AUC        : {auc:.4f}\n"
        f"Interpretation: {'Poor predictor (AUC < 0.65)' if auc < 0.65 else 'Some predictive power'}\n"
    )
    return result


# ── RQ3 ────────────────────────────────────────────────────────────────────

def rq3_dri_per_model(df: pd.DataFrame, out_dir: Path) -> str:
    model_stats = df.groupby("model")["dri"].agg(
        DRI_mean="mean", DRI_std="std", DRI_median="median",
        High_DRI=lambda x: (x >= 0.6).sum(),
        N="count"
    ).reset_index()
    model_stats["High_DRI_pct"] = model_stats["High_DRI"] / model_stats["N"] * 100
    model_stats = model_stats.sort_values("DRI_mean", ascending=False)

    # Kruskal-Wallis
    groups = [df[df["model"] == m]["dri"].values for m in model_stats["model"]]
    if len(groups) > 1:
        h_stat, p_kw = kruskal(*groups)
    else:
        h_stat, p_kw = 0.0, 1.0

    dunn = dunn_posthoc(df, "model", "dri")

    # Figure
    apply_style()
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor("#0f172a")

    models = model_stats["model"].tolist()
    # Bar chart
    bars = axes[0].bar(range(len(models)), model_stats["DRI_mean"],
                       yerr=model_stats["DRI_std"], capsize=4,
                       color=MODEL_COLORS[:len(models)], alpha=0.8,
                       error_kw={"ecolor": "#64748b", "elinewidth": 1})
    axes[0].set_xticks(range(len(models)))
    axes[0].set_xticklabels([m.split("-")[0] for m in models], rotation=30, ha="right")
    axes[0].set_ylabel("DRI@Model (mean ± std)")
    axes[0].set_title("RQ3: DRI per LLM")
    axes[0].yaxis.grid(True); axes[0].set_axisbelow(True)

    # Box plot
    data_for_box = [df[df["model"] == m]["dri"].values for m in models]
    bp = axes[1].boxplot(data_for_box, patch_artist=True, medianprops={"color": "white"})
    for patch, color in zip(bp["boxes"], MODEL_COLORS[:len(models)]):
        patch.set_facecolor(color); patch.set_alpha(0.7)
    axes[1].set_xticklabels([m.split("-")[0] for m in models], rotation=30, ha="right")
    axes[1].set_ylabel("DRI distribution")
    axes[1].set_title("RQ3: DRI distributions")
    axes[1].yaxis.grid(True); axes[1].set_axisbelow(True)

    plt.tight_layout()
    path = out_dir / "figure2_dri_per_model.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()

    table_str = model_stats.to_string(index=False, float_format="%.4f")
    result = (
        f"\nRQ3 — DRI@Model Comparison\n"
        f"{'─'*50}\n"
        f"{table_str}\n\n"
        f"Kruskal-Wallis H : {h_stat:.4f}  p = {p_kw:.4e}\n"
        f"Significant      : {'YES' if p_kw < 0.05 else 'NO'}\n\n"
        f"Dunn post-hoc (Bonferroni):\n"
        f"{dunn[['group_a','group_b','p_bonferroni','significant']].to_string(index=False)}\n"
    )
    return result


# ── RQ4 ────────────────────────────────────────────────────────────────────

def rq4_feature_importance(df: pd.DataFrame, out_dir: Path) -> str:
    feat_df = df.dropna(subset=FEATURE_COLS)
    deceptive = ((feat_df["dri"] >= 0.3)).astype(int)

    X = feat_df[FEATURE_COLS].values
    y = deceptive.values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_scaled, y)
    importances = np.abs(lr.coef_[0])
    importances = importances / importances.sum()

    # Spearman correlations with DRI
    corrs = []
    for col in FEATURE_COLS:
        rho, _ = spearmanr(feat_df[col], feat_df["dri"])
        corrs.append(round(rho, 4))

    order = np.argsort(importances)[::-1]
    sorted_labels = [FEATURE_LABELS[i] for i in order]
    sorted_imp    = importances[order]
    sorted_corrs  = [corrs[i] for i in order]

    # Figure
    apply_style()
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor("#0f172a")

    bar_colors = ["#34d399" if c > 0 else "#f87171" for c in sorted_corrs]
    axes[0].barh(sorted_labels[::-1], sorted_imp[::-1], color=bar_colors[::-1], alpha=0.8)
    axes[0].set_xlabel("Normalized importance")
    axes[0].set_title("RQ4: Feature Importance for Deceptive Readability")
    axes[0].xaxis.grid(True); axes[0].set_axisbelow(True)

    # Correlation bar
    corr_colors = ["#34d399" if c > 0 else "#f87171" for c in sorted_corrs[::-1]]
    axes[1].barh(sorted_labels[::-1], sorted_corrs[::-1], color=corr_colors, alpha=0.8)
    axes[1].axvline(0, color="#64748b", linewidth=1)
    axes[1].set_xlabel("Spearman ρ with DRI")
    axes[1].set_title("RQ4: Feature–DRI Correlation")
    axes[1].xaxis.grid(True); axes[1].set_axisbelow(True)

    plt.tight_layout()
    path = out_dir / "figure3_feature_importance.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()

    rows = [{"Feature": FEATURE_LABELS[i],
             "Importance": round(importances[i], 4),
             "Spearman_rho": corrs[i]}
            for i in order]
    result = (
        f"\nRQ4 — Parameter-Level Attribution\n"
        f"{'─'*50}\n"
        f"{pd.DataFrame(rows).to_string(index=False)}\n"
    )
    return result


# ── DRI distribution figure ────────────────────────────────────────────────

def figure_dri_distribution(df: pd.DataFrame, out_dir: Path) -> None:
    apply_style()
    fig, ax = plt.subplots(figsize=(10, 5))
    fig.patch.set_facecolor("#0f172a")

    correct_dri   = df[df["correct"]]["dri"]
    incorrect_dri = df[~df["correct"]]["dri"]

    bins = np.linspace(0, 1, 30)
    ax.hist(correct_dri,   bins=bins, alpha=0.6, color=PALETTE["correct"],
            label="Correct",   edgecolor="none")
    ax.hist(incorrect_dri, bins=bins, alpha=0.6, color=PALETTE["incorrect"],
            label="Incorrect", edgecolor="none")

    # Shade critical zone
    ax.axvspan(0.6, 1.0, alpha=0.08, color="#f87171", label="Critical DRI zone (≥0.6)")
    ax.axvline(0.6, color="#f87171", linewidth=1.2, linestyle="--")

    ax.set_xlabel("Deceptive Readability Index (DRI)")
    ax.set_ylabel("Sample count")
    ax.set_title("DRI Distribution: Correct vs Incorrect LLM-Generated Code")
    ax.legend(framealpha=0.2)
    ax.yaxis.grid(True); ax.set_axisbelow(True)

    plt.tight_layout()
    path = out_dir / "figure4_dri_distribution.png"
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()


# ── main ───────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Paper 4 analysis and figures")
    parser.add_argument("--input",  default="data/dri_dataset.csv")
    parser.add_argument("--output", default="results")
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(args.input)
    # Expand JSON-serialised feature dicts if present as strings
    if "features" in df.columns and df["features"].dtype == object:
        import ast
        feat_expanded = df["features"].apply(
            lambda x: ast.literal_eval(x) if isinstance(x, str) else x
        )
        for col in FEATURE_COLS:
            key = col.replace("feat_", "")
            if col not in df.columns:
                df[col] = feat_expanded.apply(lambda d: d.get(key, np.nan)
                                               if isinstance(d, dict) else np.nan)

    print(f"Dataset: {len(df)} records, {df['model'].nunique()} models\n")

    summary = []
    summary.append(f"Paper 4 Analysis — {len(df)} samples, {df['model'].nunique()} models\n")
    summary.append("=" * 60 + "\n")

    summary.append(rq1_readability_distribution(df, out_dir))
    summary.append(rq2_readability_predicts_correctness(df))
    summary.append(rq3_dri_per_model(df, out_dir))
    summary.append(rq4_feature_importance(df, out_dir))

    figure_dri_distribution(df, out_dir)

    report = "\n".join(summary)
    print(report)

    summary_path = out_dir / "summary.txt"
    summary_path.write_text(report, encoding="utf-8")
    print(f"\nAll results saved to: {out_dir}/")


if __name__ == "__main__":
    main()
