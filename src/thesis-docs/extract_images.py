"""
Extracts all images from the three paper docx files and saves them as PNG files
in Thesis/Figures/ folder, named by chapter and figure number.

Run: python extract_images.py
"""
import os, shutil
from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE as RT

PAPERS = {
    "Ch3_IRAF": r'C:\Users\bhara\OneDrive\Documents\Claude\Projects\Phd\Evaluating Identifier Readability Using CodeBERT.docx',
    "Ch4_ECRVR": r'C:\Users\bhara\OneDrive\Documents\Claude\Projects\Phd\Explainable Artificial Intelligence with Hybrid Ensemble Learning based Automated Code Comprehension Prediction.docx',
    "Ch5_EESQA": r'C:\Users\bhara\OneDrive\Documents\Claude\Projects\Phd\Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment.docx',
}

FIGURE_MAP = {
    "Ch3_IRAF": {
        0: "Fig3_01_IRAF_Framework_Architecture",
        1: "Fig3_02_Self_Attention_Mechanism",
        2: "Fig3_03_SA_BiLSTM_Model",
        3: "Fig3_04_Confusion_PR_ROC_Python",
        4: "Fig3_05_Accuracy_Curve_Python",
        5: "Fig3_06_Loss_Curve_Python",
        6: "Fig3_07_Confusion_PR_ROC_CPP",
        7: "Fig3_08_Classification_Results_CPP",
        8: "Fig3_09_Accuracy_Curve_CPP",
        9: "Fig3_10_Loss_Curve_CPP",
        10: "Fig3_11_SHAP_Python",
        11: "Fig3_12_SHAP_CPP",
    },
    "Ch4_ECRVR": {
        0: "Fig4_01_ECRVR_Framework_Overview",
        1: "Fig4_02_GCN_Structure",
        2: "Fig4_03_XAI_LIME_Architecture",
        3: "Fig4_04_Confusion_ROC_Python",
        4: "Fig4_05_Results_Python_70pct",
        5: "Fig4_06_Results_Python_30pct",
        6: "Fig4_07_Accuracy_Curve_Python",
        7: "Fig4_08_Loss_Curve_Python",
        8: "Fig4_09_Confusion_ROC_CPP",
        9: "Fig4_10_Results_CPP_70pct",
        10: "Fig4_11_Results_CPP_30pct",
        11: "Fig4_12_Accuracy_Curve_CPP",
        12: "Fig4_13_Loss_Curve_CPP",
        13: "Fig4_14_LIME_Python",
        14: "Fig4_15_LIME_CPP",
    },
    "Ch5_EESQA": {
        0: "Fig5_01_EESQA_Workflow",
        1: "Fig5_02_SSNN_Structure",
        2: "Fig5_03_Avg_Classification_Results",
        3: "Fig5_04_Accuracy_Curve",
        4: "Fig5_05_Loss_Curve",
        5: "Fig5_06_PR_Curve",
        6: "Fig5_07_ROC_Curve",
        7: "Fig5_08_Comparative_Accuracy",
        8: "Fig5_09_Execution_Time",
    },
}

OUT_DIR = r'C:\Users\bhara\OneDrive\Documents\Claude\Projects\Phd\Thesis\Figures'
os.makedirs(OUT_DIR, exist_ok=True)

EXT_MAP = {
    'image/png':  '.png',
    'image/jpeg': '.jpg',
    'image/jpg':  '.jpg',
    'image/bmp':  '.bmp',
    'image/gif':  '.gif',
    'image/tiff': '.tiff',
    'image/wmf':  '.wmf',
    'image/emf':  '.emf',
}

total = 0
for paper_key, docx_path in PAPERS.items():
    print(f"\n{'='*60}")
    print(f"Extracting from: {paper_key}")
    doc = Document(docx_path)
    img_count = 0
    fmap = FIGURE_MAP.get(paper_key, {})

    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            try:
                blob = rel.target_part.blob
                ctype = rel.target_part.content_type
                ext = EXT_MAP.get(ctype, '.png')
                name = fmap.get(img_count, f"{paper_key}_img{img_count:02d}")
                fname = f"{name}{ext}"
                fpath = os.path.join(OUT_DIR, fname)
                with open(fpath, 'wb') as f:
                    f.write(blob)
                print(f"  [{img_count:2d}] Saved: {fname}  ({len(blob)//1024} KB)")
                img_count += 1
                total += 1
            except Exception as e:
                print(f"  [{img_count:2d}] Error: {e}")
                img_count += 1

    print(f"  Total images extracted: {img_count}")

print(f"\n{'='*60}")
print(f"ALL DONE — {total} images saved to: {OUT_DIR}")
print(f"\nInsert into Word chapters:")
print(f"  Fig3_01 through Fig3_12 → Chapter 3 (IRAF-XADL)")
print(f"  Fig4_01 through Fig4_15 → Chapter 4 (ECRVR-MVEL)")
print(f"  Fig5_01 through Fig5_09 → Chapter 5 (EESQA-DELMOA)")
