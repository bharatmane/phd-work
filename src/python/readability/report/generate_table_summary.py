import pandas as pd

df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv")
factors = ['MC', 'NC', 'OL', 'DR']

summary = df.groupby("Identifier Type")[factors].agg(['mean', 'std']).round(3)
summary.to_csv("readability/reports/graphs/summary_table_type_MC_NC_OL_DR.csv")
print(summary)
