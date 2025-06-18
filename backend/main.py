from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from custom_interface import CustomEncoderWav2vec2Classifier
import shutil
import uuid
import os
import torch

app = FastAPI()

classifier = CustomEncoderWav2vec2Classifier.from_hparams(
    source=".",
    hparams_file="hyperparams.yaml"
)

emotions = {0: 'Neutral', 1: 'Anger', 2: 'Happiness', 3: 'Sadness'}

emotion_codes = ['neu', 'ang', 'hap', 'sad']

@app.post("/analyze-emotion/")
async def analyze_emotion(file: UploadFile = File(...)):
    # Save the uploaded file temporarily
    try:
        temp_filename = f"temp_{uuid.uuid4()}.wav"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")
    
    try:
        # Predict
        out_prob, score, index, text_lab = classifier.classify_file(temp_filename)

        # Process outputs
        score_val = score.item() if torch.is_tensor(score) else float(score)
        index_val = index.item() if torch.is_tensor(index) else int(index)
        text_lab_val = text_lab[0] if isinstance(text_lab, list) and text_lab else str(text_lab)
        probs = out_prob.squeeze().tolist() if torch.is_tensor(out_prob) else out_prob

        # Create response
        result = {
            "emotion": emotions.get(index_val, "Unknown"),
            "label": text_lab_val,
            "confidence": round(score_val, 4),
            "index": index_val,
            "probabilities": {
                emotions[i]: round(probs[i], 4) if i < len(probs) else 0.0
                for i in range(len(emotions))
            }
        }

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
