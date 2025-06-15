import sys
import os
import torch
import torchaudio

# Add current directory to path
sys.path.insert(0, '.')

try:
    from custom_interface import CustomEncoderWav2vec2Classifier
    print("✓ Successfully imported CustomEncoderWav2vec2Classifier")
except ImportError as e:
    print(f"✗ Failed to import: {e}")
    sys.exit(1)

def debug_predict(audio_file):
    """Debug prediction to see exact return types"""
    try:
        print(f"Debugging prediction with: {audio_file}")
        
        if not os.path.exists(audio_file):
            print(f"✗ Audio file not found: {audio_file}")
            return
        
        # Initialize classifier
        print("Initializing classifier...")
        classifier = CustomEncoderWav2vec2Classifier.from_hparams(
            source=".",
            hparams_file="hyperparams.yaml"
        )
        print("✓ Classifier initialized")
        
        # Make prediction and debug each return value
        print("Making prediction...")
        result = classifier.classify_file(audio_file)
        
        print(f"\nDEBUG: Raw result type: {type(result)}")
        print(f"DEBUG: Raw result length: {len(result) if hasattr(result, '__len__') else 'N/A'}")
        print(f"DEBUG: Raw result: {result}")
        
        # Unpack the result
        out_prob, score, index, text_lab = result
        
        print(f"\nDEBUG: Individual components:")
        print(f"  out_prob type: {type(out_prob)}, shape: {out_prob.shape if hasattr(out_prob, 'shape') else 'N/A'}")
        print(f"  score type: {type(score)}, value: {score}")
        print(f"  index type: {type(index)}, value: {index}")
        print(f"  text_lab type: {type(text_lab)}, value: {text_lab}")
        
        # Handle different types safely
        print(f"\nProcessing results...")
        
        # Handle score
        if torch.is_tensor(score):
            if score.numel() == 1:
                score_val = score.item()
            else:
                print(f"  Score tensor has multiple elements: {score}")
                score_val = score[0].item() if len(score) > 0 else 0.0
        else:
            score_val = float(score) if isinstance(score, (int, float)) else score
        
        # Handle index
        if torch.is_tensor(index):
            if index.numel() == 1:
                index_val = index.item()
            else:
                print(f"  Index tensor has multiple elements: {index}")
                index_val = index[0].item() if len(index) > 0 else 0
        else:
            index_val = int(index) if isinstance(index, (int, float)) else index
        
        # Handle text_lab
        if isinstance(text_lab, list):
            text_lab_val = text_lab[0] if len(text_lab) > 0 else "unknown"
            print(f"  text_lab is a list: {text_lab}, using first element: {text_lab_val}")
        else:
            text_lab_val = str(text_lab)
        
        # Handle probabilities
        if torch.is_tensor(out_prob):
            probs = out_prob.squeeze().cpu().numpy()
        else:
            probs = out_prob
        
        print(f"\nProcessed values:")
        print(f"  Score: {score_val}")
        print(f"  Index: {index_val}")
        print(f"  Text label: {text_lab_val}")
        print(f"  Probabilities shape: {probs.shape if hasattr(probs, 'shape') else type(probs)}")
        
        # Emotion mapping
        emotions = {0: 'Neutral', 1: 'Anger', 2: 'Happiness', 3: 'Sadness'}
        emotion_codes = ['neu', 'ang', 'hap', 'sad']
        
        print(f"\n" + "="*50)
        print("FINAL RESULTS")
        print("="*50)
        print(f"Audio file: {audio_file}")
        print(f"Predicted emotion: {emotions.get(index_val, 'Unknown')} ({text_lab_val})")
        print(f"Confidence: {score_val:.4f}")
        print(f"Class index: {index_val}")
        
        # Show probabilities if available
        if hasattr(probs, '__len__') and len(probs) >= 4:
            print(f"\nAll probabilities:")
            for i, (code, name) in enumerate(zip(emotion_codes, emotions.values())):
                prob_val = probs[i] if i < len(probs) else 0.0
                print(f"  {name:10} ({code}): {prob_val:.4f}")
        
    except Exception as e:
        print(f"✗ Error during prediction: {e}")
        import traceback
        traceback.print_exc()

def simple_test():
    """Very simple test just to see if model loads"""
    try:
        print("Simple model loading test...")
        classifier = CustomEncoderWav2vec2Classifier.from_hparams(
            source=".",
            hparams_file="hyperparams.yaml"
        )
        print("✓ Model loaded successfully")
        return classifier
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("Debug Emotion Recognition")
    print("="*30)
    
    # First test model loading
    classifier = simple_test()
    if classifier is None:
        return
    
    # Test prediction
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        debug_predict(audio_file)
    else:
        # Try with any available example file
        example_files = ['anger.wav', 'hap.wav', 'neutral.wav', 'sad.wav']
        for audio_file in example_files:
            if os.path.exists(audio_file):
                debug_predict(audio_file)
                break
        else:
            print("No audio files found to test with")
            print(f"Usage: python {sys.argv[0]} <audio_file>")

if __name__ == "__main__":
    main()