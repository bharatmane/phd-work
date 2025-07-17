import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv")
factors = ['MC', 'NC', 'OL', 'DR']
languages = df['Language'].unique()

plt.figure(figsize=(14, 8))
for i, factor in enumerate(factors, 1):
    plt.subplot(2, 2, i)
    sns.boxplot(data=df, x='Language', y=factor, palette='Set2')
    plt.title(f'Boxplot of {factor} by Language')
    plt.xlabel('Language')
    plt.ylabel(factor)
plt.tight_layout()
plt.savefig("readability/reports/graphs/boxplot_language_MC_NC_OL_DR.png")
plt.close()
