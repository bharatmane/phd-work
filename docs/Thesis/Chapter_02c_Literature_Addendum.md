# LITERATURE ADDENDUM: DETAILED REVIEW OF PRIMARY SOURCES

*This file supplements Chapter_02_Literature_Review_v2.md with detailed analysis of the primary source papers directly relevant to the three studies in this thesis. All papers cited here were reviewed as part of the systematic literature review conducted for this research.*

---

## L.1 Foundational Empirical Studies on Identifier Naming

### L.1.1 Buse and Weimer (2010): The Benchmark Standard

Raymond P.L. Buse and Westley R. Weimer's paper "Learning a Metric for Code Readability," published in *IEEE Transactions on Software Engineering* (Volume 36, Number 4, July/August 2010), is the most cited foundational work in automated code readability measurement. Its methodology — collecting human annotations, deriving features, training a classifier — established the template that essentially all subsequent readability prediction research has followed.

The paper collected annotations from 120 human subjects on 100 code snippets, using a two-choice rating (more or less readable than a reference snippet). From these annotations, a logistic regression model was trained on 16 features including identifier length, number of identifiers, presence of blank lines, nesting depth, and the percentage of unique words. The model achieved 80% accuracy in predicting which of two snippets was rated more readable — described by the authors as performing better than a naive human on average.

The most important finding, from the perspective of this thesis, is what Buse and Weimer did *not* find: their 16 features did not include any measure of whether identifier tokens were meaningful English words. Identifier length was included, but not identifier semantic content. This gap — treating identifiers as formal tokens rather than as natural language — is the gap that IRAF-XADL's ten-parameter feature set specifically addresses. The Meaningful Clarity (MC) and Lexical Familiarity (LF) features in IRAF-XADL are, in a sense, the missing features from Buse and Weimer's model.

The Buse-Weimer accuracy ceiling of approximately 80% (confirmed by Scalabrino et al.'s subsequent larger study at about 70%) is instructive for interpreting IRAF-XADL's 97.36% accuracy. The improvement from 80% to 97% does not represent a single breakthrough but the accumulation of three advances: deeper semantic features (the ten parameters), contextual embeddings (CodeBERT), and a more expressive classifier (SA-BiLSTM). Each advance contributes, as the ablation study in Section A3.1 demonstrates.

### L.1.2 Hofmeister, Siegmund, and Holt: The Naming Style Experiment

The paper "Shorter Identifier Names Take Longer to Comprehend" by Johannes Hofmeister, Janet Siegmund, and Daniel V. Holt (University of Passau and Heidelberg University) is the most rigorous experimental study of how identifier naming style affects developer performance. The paper reports a controlled experiment with 72 professional C# developers in a within-subjects design where each developer saw code with three different identifier naming styles: single letters (`x`, `y`), abbreviations (`initPt`), and full words (`initialPoint`). Developers were asked to find a seeded defect in each version.

The key quantitative finding — that words lead to 19% faster comprehension compared to letters and abbreviations — is widely cited in the naming literature and is the strongest evidence that the Meaningful Clarity feature captures something that genuinely matters for developer productivity. The 19% figure represents the difference in bug-finding time, not a self-reported preference: it was measured with a stopwatch on real debugging tasks by real professional developers.

Equally important is the null finding: there was no significant difference in comprehension speed between letters and abbreviations. This collapses two categories that prior literature sometimes treated as distinct into a single "bad naming" category. IRAF-XADL's MC feature reflects this: both `x` (letter, MC = 0) and `psgCnt` (abbreviation of non-standard words, MC ≈ 0) receive similarly low MC scores, reflecting the experimental finding that neither is meaningfully better than the other from a comprehension standpoint.

### L.1.3 Schankin, Berger, Holt, Hofmeister, Riedel, and Beigl (2018): Compound Names and Task Complexity

"Descriptive Compound Identifier Names Improve Source Code Comprehension" by Andrea Schankin, Annika Berger, Daniel V. Holt, Johannes C. Hofmeister, Till Riedel, and Michael Beigl was presented at the 2018 ACM/IEEE 26th International Conference on Program Comprehension (ICPC 2018). The paper investigates a more specific question than Hofmeister et al.'s earlier work: when do compound descriptive names (e.g., `maxNumberOfItems` as opposed to `maxNI`) improve comprehension, and for which types of tasks?

The finding that descriptive compound names improve semantic bug detection by 14% but make no difference for syntactic error detection is directly relevant to interpreting IRAF-XADL's use case. If identifier naming quality only matters for tasks that require semantic understanding — which is exactly the type of task that code review and maintenance represent — then a readability assessment tool focused on identifier naming (like IRAF-XADL) is most valuable precisely in the contexts where it matters most.

The paper also introduces the concept of a naming benefit that scales with task complexity: simple tasks (find a missing semicolon) do not benefit from better naming; complex tasks (understand what this function computes and identify where it might fail) benefit substantially. This scaling effect predicts that IRAF-XADL's utility increases with code complexity — it is most valuable for complex, algorithmically rich code where poor naming has the greatest cognitive cost.

### L.1.4 Butler, Wermelinger, Yu, and Sharp (2009): Naming Flaws and Quality

Simon Butler, Michel Wermelinger, Yijun Yu, and Helen Sharp, all at the Centre for Research in Computing at The Open University (UK), published "Relating Identifier Naming Flaws and Code Quality: An Empirical Study" at the 2009 16th Working Conference on Reverse Engineering. This paper differs from the previous three in its methodology: rather than a controlled experiment with human participants, it is a large-scale mining study on open-source Java projects.

The paper defines naming flaws — deviations from a set of rules adapted from Relf (2004) — and counts their frequency in twelve open-source projects. The key finding is a positive correlation between naming flaw density and code quality problems as measured by static analysis tool warnings: functions with more naming flaws have more static analysis warnings, suggesting that poor naming and other code quality problems co-occur.

This finding has an important methodological implication for this thesis: naming quality is not an independent dimension of code quality but correlates with other quality dimensions. This correlation means that a model trained to predict readability labels (which reflect multiple quality dimensions) will learn naming signals partly because naming quality predicts other quality signals. The SHAP analysis showing MC and NC as dominant features is consistent with this interpretation: naming quality is not just directly important for readability but is a proxy for broader quality.

### L.1.5 Posnett, Hindle, and Devanbu (2011): The Simpler Model

"A Simpler Model of Software Readability" by Daryl Posnett, Abram Hindle, and Premkumar Devanbu (University of California, Davis) appeared at the 8th Working Conference on Mining Software Repositories (MSR 2011). This paper challenges the complexity of the Buse-Weimer model by showing that a much simpler model — using only a handful of features — can achieve comparable performance.

The key finding most relevant to this thesis is the feature importance analysis. Using the Buse-Weimer annotation data, Posnett et al. found that identifier-related features (specifically, the average identifier length and the proportion of identifiers that are multi-word compound names) explain more variance in human readability ratings than all the structural features (blank lines, brackets, nesting depth) combined. This finding, which directly motivated the emphasis on identifier-level features in IRAF-XADL, is stated in the paper as: "Our analysis indicates that the proportion of identifiers that are recognizable English words accounts for a larger fraction of the variance than any other single feature."

That claim is the empirical foundation for IRAF-XADL's first feature (Meaningful Clarity, MC). The choice to weight MC heavily in the CLS composite score and to prioritise it in the feature set reflects this prior finding.

---

## L.2 Naming Conventions and Guidelines

### L.2.1 Feitelson et al. (2020): How Developers Actually Choose Names

"How Developers Choose Names" by Dror G. Feitelson, Ayelet Mizrahi, Nofar Noy, Aviad Ben Shabat, Or Eliyahu, and Roy Sheffer (The Hebrew University of Jerusalem) was published in *IEEE Transactions on Software Engineering* (DOI: 10.1109/TSE.2020.2976920). This paper takes a different methodological approach: instead of measuring comprehension or correlating names with quality, it studies the naming process itself. The central question is: given the same naming task, how consistently do developers choose the same name?

The study involved 334 developers who each provided names for 47 programming tasks (variables, functions, classes). The degree of agreement was measured using the naming agreement score — the probability that two randomly selected developers would choose the same name.

Three findings from this paper are relevant to IRAF-XADL:

First, agreement is higher than expected by chance but lower than perfect: the average naming agreement score is 0.47, meaning that in any given naming task, developers agree on the same name approximately 47% of the time. This implies that there is a "best" name for most programming tasks — one that most developers converge on — but that substantial individual variation exists. IRAF-XADL's features are calibrated to reward names that are closer to this consensus (high MC, high LF — frequent words that most developers would use) and penalise outliers.

Second, agreement increases with naming specificity: when a task's requirements constrain the name more tightly (e.g., "a variable that holds the maximum value of an array"), developers agree more often. General-purpose names (like `data` or `value`) show lower agreement because they are acceptable for many tasks, making any one choice seemingly arbitrary.

Third, the most common wrong choices (names that are semantically adjacent but not the most common choice) are instructive: developers tend to choose names at approximately the right semantic level but vary in their choice of specific word. `maxVal`, `maxValue`, and `maximumValue` all appeared as common choices for the same task — differing only in abbreviation level. IRAF-XADL's OL (Optimal Length) feature rewards the middle range of this spectrum, consistent with the finding that neither the shortest nor the longest form dominates agreement.

### L.2.2 Siegmund (2016): Program Comprehension Past, Present, and Future

Janet Siegmund's paper "Program Comprehension: Past, Present, and Future," presented at the 2016 IEEE 23rd International Conference on Software Analysis, Evolution, and Reengineering (SANER 2016), provides an authoritative survey of the field's development and identifies key open challenges.

The paper's characterisation of the field's history reinforces the framing of Chapter 2 of this thesis: program comprehension research has moved from purely cognitive and observational studies to increasingly empirical and quantitative work, enabled by the availability of large open-source code repositories and improved research methods (eye-tracking, fMRI, automated code analysis). Siegmund identifies as an open challenge the integration of cognitive models of comprehension with automated quality assessment — precisely the integration that this thesis attempts.

The specific observation that "the programmer needs to get more focus again in software-engineering research" — meaning that research on developer cognitive processes is underrepresented relative to research on tools and algorithms — motivates the inclusion of Study 3 (EESQA-DELMOA) in this thesis. Assessing developer experience is, in part, a way of bringing the programmer back into the quality assessment picture.

---

## L.3 Code Readability Metrics

### L.3.1 Pahal and Chillar (2017): A Review of Readability Metrics

"Code Readability: A Review of Metrics for Software Quality" by Ankit Pahal and Rajender S. Chillar, published in the *International Journal of Computer Trends and Technology* (Volume 46, Number 1, April 2017), provides a survey of code readability metrics from the perspective of software quality management.

The paper categorises readability metrics into three families:

1. **Structural metrics:** Cyclomatic complexity (McCabe, 1976), Halstead measures (1977), lines of code, nesting depth. These capture the organisational complexity of code.
2. **Visual metrics:** Whitespace ratio, alignment, line length. These capture the visual presentation of code.
3. **Lexical metrics:** Identifier length, number of unique identifiers, proportion of dictionary words. These capture the naming quality dimension.

The survey's finding that lexical metrics are the least developed of the three families — with fewer published metrics and less standardisation than structural or visual metrics — is consistent with the gap that IRAF-XADL addresses. The ten-parameter feature set in IRAF-XADL can be understood as a comprehensive set of lexical metrics, expanding from the two or three lexical features that prior work considered to ten features that cover semantic, structural, contextual, and cognitive dimensions.

---

## L.4 Machine Learning Tools for Naming Analysis

### L.4.1 Mi et al. (2018): Inception Architecture for Readability

"An Inception Architecture-Based Model for Improving Code Readability Classification" by Qing Mi, Jacky Keung, Xiao Yue, Samuel Mensah, and Mei Xin was presented at the 22nd International Conference on Evaluation and Assessment in Software Engineering (EASE 2018). This paper applies an inception network — a convolutional architecture with multiple parallel filter sizes — to code readability classification, achieving improvements over prior baselines.

The paper is directly cited in Paper 1 (IRAF-XADL) and represents the state of the art that IRAF-XADL surpasses. Mi et al.'s best accuracy on the Buse-Weimer dataset is approximately 87% — substantially below IRAF-XADL's 97.36% on the Kaggle dataset. While the datasets differ, the magnitude of the gap is indicative of the improvement that CodeBERT contextual embeddings and the ten readability parameters provide over convolutional approaches applied to raw code tokens.

### L.4.2 Learning Natural Coding Conventions

"Learning Natural Coding Conventions" by Miltiadis Allamanis, Earl T. Barr, Christian Bird, and Charles Sutton, presented at the ACM Symposium on the Foundations of Software Engineering (FSE 2014), introduced the concept of learning naming conventions from large code corpora using statistical language models. The paper's core contribution — the Naturalize tool — learns project-specific naming conventions from a codebase and suggests names that are more consistent with those conventions.

Naturalize's approach is complementary to IRAF-XADL in an important way. IRAF-XADL assesses identifier quality against a set of linguistically and cognitively grounded absolute criteria (MC, NC, OL, etc.). Naturalize assesses identifier quality against the project-specific relative criteria of the surrounding codebase. Both are valid and useful: IRAF-XADL catches globally poor names (single letters, non-English words), while Naturalize catches locally inconsistent names (using camelCase in a snake_case project).

The integration of both approaches — global quality criteria from IRAF-XADL and project-specific convention learning from Naturalize-like models — represents a practical roadmap for a comprehensive naming quality tool.

### L.4.3 How Developers Understand Code: Eye-Tracking Evidence

Several papers in the raw-material collection use eye-tracking to study how developers read code. Sharif and Maletic (2010), in their study comparing CamelCase and snake_case, found that the difference in reading time between the two conventions was small and depended on prior familiarity — but that the specific pattern of fixations (where developers' eyes paused) revealed how they were mentally segmenting identifiers.

More generally, eye-tracking studies (Siegmund et al., 2014; Hofmeister et al., 2017) show that identifier names are the first thing developers attend to when reading a new function: the function name determines whether they continue reading, and the parameter names determine whether they understand the function's interface before reading its body. This primacy of identifier processing provides the clearest justification for why identifier-level readability assessment — rather than just snippet-level assessment — is a valuable contribution.

---

## L.5 Summary of the Literature Addendum

The papers reviewed in this addendum collectively establish:

1. **The quantitative case for identifier naming quality** (Hofmeister et al., Schankin et al.): 19% faster bug detection and 14% faster semantic task completion are the strongest available effect-size estimates for the value of descriptive naming.

2. **The dominance of identifier features over structural features** (Posnett et al.): identifier-related features explain more readability variance than all structural features combined — the central empirical finding that motivates IRAF-XADL's design.

3. **The correlation between naming flaws and defect density** (Butler et al.): naming quality is not just a readability concern but a code correctness concern.

4. **The variability of naming choices and the existence of a naming consensus** (Feitelson et al.): most naming tasks have a "best" name that most developers converge on, validating the use of frequency-based features (LF, PRED) in IRAF-XADL.

5. **The gap that prior automated tools leave** (Mi et al., Allamanis et al., Buse and Weimer): the improvement from 80% to 97%+ accuracy represents the combined advance of deeper features, contextual embeddings, and expressive classifiers.

6. **The primacy of identifier processing in developer reading** (Sharif and Maletic, Siegmund et al.): eye-tracking evidence that developers attend to identifiers first confirms that identifier-level assessment is not a minor concern but the central quality signal that drives snippet-level comprehension.

Together with the twenty-year systematic literature review in Chapter 2, these primary source analyses provide the complete theoretical and empirical context within which the contributions of this thesis should be understood.

---

*End of Literature Addendum.*
