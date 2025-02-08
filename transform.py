import pandas as pd
import numpy as np
from sklearn.manifold import MDS, TSNE
import umap.umap_ as umap

similarity_matrix = pd.read_csv("similarity_matrix.csv", header=None).values

mds = MDS(n_components=2, dissimilarity="precomputed", random_state=42)
mds_coordinates = mds.fit_transform(1 - similarity_matrix)

tsne = TSNE(n_components=2, perplexity=15, random_state=42)
tsne_coordinates = tsne.fit_transform(1 - similarity_matrix)

reducer = umap.UMAP(random_state=42, metric="precomputed")
umap_coordinates = reducer.fit_transform(1 - similarity_matrix)

np.savetxt("mds_coordinates.csv", mds_coordinates, delimiter=",")
np.savetxt("tsne_coordinates.csv", tsne_coordinates, delimiter=",")
np.savetxt("umap_coordinates.csv", umap_coordinates, delimiter=",")
