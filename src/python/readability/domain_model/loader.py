import fasttext

class DomainModel:
    def __init__(self, model_path):
        self.model = fasttext.load_model(model_path)

    def get_similarity_score(self, identifier):
        neighbors = self.model.get_nearest_neighbors(identifier)
        if not neighbors:
            return 0.0
        return max(score for score, _ in neighbors if isinstance(score, float))
