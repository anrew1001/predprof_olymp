import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Load Data.npz
print("Loading Data.npz...")
data = np.load('Data.npz', allow_pickle=True)
valid_x = data['valid_x']
valid_y = data['valid_y']

print(f"Loaded valid_x: {valid_x.shape}, valid_y: {valid_y.shape}")

# Recover labels by extracting the string part
print("Recovering labels...")
recovered_labels = np.array([str(label)[32:] for label in valid_y])

print(f"Unique recovered labels: {np.unique(recovered_labels)}")

# Use LabelEncoder to convert to integers
le = LabelEncoder()
encoded_labels = le.fit_transform(recovered_labels)

print(f"Encoded labels: {np.unique(encoded_labels)}")
print(f"Label mapping: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# Save as test_sample.npz
print("Saving test_sample.npz...")
np.savez('test_sample.npz', test_x=valid_x, test_y=encoded_labels)

print("✓ test_sample.npz created successfully")
print(f"  test_x shape: {valid_x.shape}")
print(f"  test_y shape: {encoded_labels.shape}")
print(f"  Total samples: {len(encoded_labels)}")
