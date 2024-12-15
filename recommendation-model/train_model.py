import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, Flatten, Dropout
from tensorflow.keras.callbacks import EarlyStopping

# Load datasets
titles = pd.read_csv('titles.csv')  # Replace with your dataset path
credits = pd.read_csv('credits.csv')  # Replace with your dataset path

# Combine and preprocess datasets
movies = titles.merge(credits, on='id', how='inner')
movies = movies[['id', 'title', 'genres', 'production_countries', 'release_year']]

# Add mock data for 'mood', 'weather', 'environment'
np.random.seed(42)
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

# Prepare inputs and scale numerical data
scaler = StandardScaler()
movies_scaled = scaler.fit_transform(movies[['genres', 'mood', 'weather', 'environment', 'origin']])

# Advanced Recommender Model
embedding_dim = 50
num_movies = len(movies)

# Input layers
genres_input = tf.keras.Input(shape=(1,), name='genres')
mood_input = tf.keras.Input(shape=(1,), name='mood')
weather_input = tf.keras.Input(shape=(1,), name='weather')
environment_input = tf.keras.Input(shape=(1,), name='environment')
origin_input = tf.keras.Input(shape=(1,), name='origin')

# Embedding layers
genres_embedding = Embedding(input_dim=len(label_encoders['genres'].classes_), output_dim=embedding_dim)(genres_input)
mood_embedding = Embedding(input_dim=len(label_encoders['mood'].classes_), output_dim=embedding_dim)(mood_input)
weather_embedding = Embedding(input_dim=len(label_encoders['weather'].classes_), output_dim=embedding_dim)(weather_input)
environment_embedding = Embedding(input_dim=len(label_encoders['environment'].classes_), output_dim=embedding_dim)(environment_input)
origin_embedding = Embedding(input_dim=len(label_encoders['origin'].classes_), output_dim=embedding_dim)(origin_input)

# Combine embeddings
combined = tf.keras.layers.Concatenate()([
    Flatten()(genres_embedding),
    Flatten()(mood_embedding),
    Flatten()(weather_embedding),
    Flatten()(environment_embedding),
    Flatten()(origin_embedding),
])

# Dense layers
x = Dense(128, activation='relu')(combined)
x = Dropout(0.2)(x)
x = Dense(64, activation='relu')(x)
x = Dropout(0.2)(x)
output = Dense(num_movies, activation='softmax')(x)

# Compile model
model = tf.keras.Model(inputs=[genres_input, mood_input, weather_input, environment_input, origin_input], outputs=output)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Prepare data for training
X = [
    movies['genres'].values,
    movies['mood'].values,
    movies['weather'].values,
    movies['environment'].values,
    movies['origin'].values
]
Y = movies.index.values

# Train the model
early_stopping = EarlyStopping(monitor='val_loss', patience=5)
model.fit(X, Y, epochs=30, batch_size=32, validation_split=0.2, callbacks=[early_stopping])

# Save the trained model
model.save('movie_recommender_model.h5')
print("Model training complete and saved!")
