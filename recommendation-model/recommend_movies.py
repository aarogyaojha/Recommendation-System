import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Dense, Embedding, Flatten, Dropout, Concatenate, Input
from tensorflow.keras.callbacks import EarlyStopping
import tensorflow as tf

# Load datasets
titles = pd.read_csv('../datsets/titles.csv')
credits = pd.read_csv('../datsets/credits.csv')

# Preprocess datasets
# Parse 'genres' and 'production_countries'
for column in ['genres', 'production_countries']:
    titles[column] = titles[column].apply(lambda x: eval(x) if pd.notna(x) else [])
    titles[column] = titles[column].apply(lambda x: ','.join(x))

# Fill missing values for 'age_certification'
titles['age_certification'] = titles['age_certification'].fillna('Unknown')

# Initialize LabelEncoders
label_encoders = {}
for col in ['type', 'genres', 'production_countries', 'age_certification']:
    le = LabelEncoder()
    titles[col] = le.fit_transform(titles[col])
    label_encoders[col] = le

# Normalize 'runtime'
scaler = StandardScaler()
titles['runtime'] = scaler.fit_transform(titles[['runtime']])

# Select relevant columns
movies = titles[['type', 'genres', 'production_countries', 'runtime', 'age_certification', 'title']]

# Load the trained model
model = load_model('movie_recommender_model.h5')
print("Model loaded!")

# Function to recommend movies using the model with decoded output
def recommend_advanced(input_data):
    prediction = model.predict([
        np.array([input_data[0]]), 
        np.array([input_data[1]]), 
        np.array([input_data[2]]), 
        np.array([input_data[3]]), 
        np.array([input_data[4]])
    ])
    top_indices = np.argsort(prediction[0])[-5:][::-1]  # Get top 5 recommendations

    # Retrieve the top movies
    recommendations = movies.iloc[top_indices].copy()

    # Decode categorical columns
    for col in ['type', 'genres', 'production_countries', 'age_certification']:
        recommendations[col] = label_encoders[col].inverse_transform(recommendations[col])

    return recommendations[['title', 'type', 'genres', 'production_countries', 'runtime', 'age_certification']]

# Function to encode user preferences with checks for unseen labels
# Function to encode user preferences with proper handling for runtime
def encode_user_input(preferences, label_encoders, scaler):
    user_input = []
    for col, value in preferences.items():
        if col == 'runtime':
            # Scale runtime value
            scaled_value = scaler.transform([[value]])[0][0]
            user_input.append(scaled_value)
        else:
            try:
                user_input.append(label_encoders[col].transform([value])[0])
            except ValueError:
                print(f"Warning: '{value}' is an unseen label for {col}. Defaulting to the first label.")
                user_input.append(0)  # Default to the first label if unseen
    return user_input


# Example user preferences
preferences = {
    'type': 'SHOW',
    'genres': 'thriller',
    'production_countries': 'IN',
    'runtime': 120,
    'age_certification': 'PG-13'
}

# Encode user preferences
user_input = encode_user_input(preferences, label_encoders, scaler)

# Provide Recommendations
print("Recommendations:")
print(recommend_advanced(user_input))
