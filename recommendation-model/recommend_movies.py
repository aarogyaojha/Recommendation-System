import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from tensorflow.keras.models import load_model

# Load datasets
titles = pd.read_csv('titles.csv')  # Replace with your dataset path
credits = pd.read_csv('credits.csv')  # Replace with your dataset path

# Combine and preprocess datasets
movies = titles.merge(credits, on='id', how='inner')
movies = movies[['id', 'title', 'genres', 'production_countries', 'release_year']]

# Add mock data for 'mood', 'weather', 'environment'
movies['mood'] = np.random.choice(['happy', 'sad', 'exciting', 'romantic', 'scary'], len(movies))
movies['weather'] = np.random.choice(['sunny', 'rainy', 'snowy', 'cloudy'], len(movies))
movies['environment'] = np.random.choice(['home', 'theater', 'outdoor'], len(movies))
movies['origin'] = np.random.choice(['Hollywood', 'Bollywood'], len(movies))

# Encode categorical variables
label_encoders = {}
for col in ['genres', 'mood', 'weather', 'environment', 'origin']:
    le = LabelEncoder()
    movies[col] = le.fit_transform(movies[col])
    label_encoders[col] = le

# Load the trained model
model = load_model('movie_recommender_model.h5')
print("Model loaded!")

# Function to recommend movies using the model
def recommend_advanced(input_data):
    prediction = model.predict([
        np.array([input_data[0]]), 
        np.array([input_data[1]]), 
        np.array([input_data[2]]), 
        np.array([input_data[3]]), 
        np.array([input_data[4]])
    ])
    top_indices = np.argsort(prediction[0])[-5:][::-1]  # Get top 5 recommendations
    return movies.iloc[top_indices][['title', 'genres', 'mood', 'weather', 'environment', 'origin']]

# Example user preferences
preferences = {
    'genres': 'Comedy',
    'mood': 'Happy',
    'weather': 'Sunny',
    'environment': 'Outdoor',
    'origin': 'Bollywood'
}

# Encode user preferences
user_input = [
    label_encoders['genres'].transform([preferences['genres']])[0],
    label_encoders['mood'].transform([preferences['mood'].lower()])[0],
    label_encoders['weather'].transform([preferences['weather'].lower()])[0],
    label_encoders['environment'].transform([preferences['environment'].lower()])[0],
    label_encoders['origin'].transform([preferences['origin']])[0]
]

# Provide Recommendations
print("Recommendations:")
print(recommend_advanced(user_input))
