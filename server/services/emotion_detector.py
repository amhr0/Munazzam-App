#!/usr/bin/env python3
"""
Emotion Detector using DeepFace and MediaPipe
تحليل تعابير الوجه والمشاعر من الفيديو
"""

import sys
import json
import cv2
import numpy as np
from deepface import DeepFace
import mediapipe as mp

def analyze_video(video_path, sample_rate=1000):
    """
    Analyze video for emotions and attention
    
    Args:
        video_path: Path to video file
        sample_rate: Extract frame every N milliseconds
    
    Returns:
        List of emotion frames
    """
    frames_data = []
    
    try:
        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Cannot open video: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int((sample_rate / 1000) * fps)  # Frames to skip
        
        # Initialize MediaPipe Face Mesh for attention detection
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        frame_count = 0
        processed_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process only every Nth frame
            if frame_count % frame_interval == 0:
                timestamp = int((frame_count / fps) * 1000)  # milliseconds
                
                try:
                    # Analyze emotions with DeepFace
                    result = DeepFace.analyze(
                        frame,
                        actions=['emotion'],
                        enforce_detection=False,
                        silent=True
                    )
                    
                    # Extract emotion scores
                    if isinstance(result, list):
                        result = result[0]
                    
                    emotions = result.get('emotion', {})
                    dominant_emotion = result.get('dominant_emotion', 'neutral')
                    
                    # Analyze attention with MediaPipe
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    face_results = face_mesh.process(rgb_frame)
                    
                    attention_score = 50  # Default
                    eye_contact = False
                    head_pose = 'forward'
                    engagement = 50
                    confidence_score = 50
                    stress_score = 30
                    
                    if face_results.multi_face_landmarks:
                        landmarks = face_results.multi_face_landmarks[0]
                        
                        # Calculate attention metrics
                        attention_metrics = calculate_attention(landmarks, frame.shape)
                        attention_score = attention_metrics['attention_score']
                        eye_contact = attention_metrics['eye_contact']
                        head_pose = attention_metrics['head_pose']
                        
                        # Calculate engagement, confidence, stress from emotions
                        engagement = calculate_engagement(emotions)
                        confidence_score = calculate_confidence(emotions, attention_metrics)
                        stress_score = calculate_stress(emotions)
                    
                    frame_data = {
                        'timestamp': timestamp,
                        'emotions': {
                            'happy': round(emotions.get('happy', 0)),
                            'sad': round(emotions.get('sad', 0)),
                            'angry': round(emotions.get('angry', 0)),
                            'surprised': round(emotions.get('surprise', 0)),
                            'fearful': round(emotions.get('fear', 0)),
                            'disgusted': round(emotions.get('disgust', 0)),
                            'neutral': round(emotions.get('neutral', 0)),
                        },
                        'dominantEmotion': dominant_emotion,
                        'attentionScore': attention_score,
                        'eyeContact': eye_contact,
                        'headPose': head_pose,
                        'bodyLanguage': {
                            'posture': 'upright',
                            'gestures': []
                        },
                        'engagement': engagement,
                        'confidence': confidence_score,
                        'stress': stress_score,
                    }
                    
                    frames_data.append(frame_data)
                    processed_count += 1
                    
                except Exception as e:
                    # Skip frames that fail analysis
                    print(f"Warning: Failed to analyze frame {frame_count}: {str(e)}", file=sys.stderr)
                    pass
            
            frame_count += 1
        
        cap.release()
        face_mesh.close()
        
        print(f"Processed {processed_count} frames from {frame_count} total frames", file=sys.stderr)
        
        return frames_data
        
    except Exception as e:
        print(f"Error analyzing video: {str(e)}", file=sys.stderr)
        raise

def calculate_attention(landmarks, frame_shape):
    """Calculate attention metrics from face landmarks"""
    # Get eye landmarks
    left_eye = landmarks.landmark[33]  # Left eye center
    right_eye = landmarks.landmark[263]  # Right eye center
    nose_tip = landmarks.landmark[1]
    
    # Calculate head pose
    nose_x = nose_tip.x
    nose_y = nose_tip.y
    
    # Determine head pose based on nose position
    head_pose = 'forward'
    if nose_x < 0.4:
        head_pose = 'right'
    elif nose_x > 0.6:
        head_pose = 'left'
    
    if nose_y < 0.4:
        head_pose = 'up'
    elif nose_y > 0.6:
        head_pose = 'down'
    
    # Eye contact detection (simplified)
    eye_contact = 0.45 < nose_x < 0.55 and 0.45 < nose_y < 0.55
    
    # Attention score (0-100)
    attention_score = 100 if eye_contact else 60
    if head_pose != 'forward':
        attention_score -= 20
    
    return {
        'attention_score': max(0, min(100, attention_score)),
        'eye_contact': eye_contact,
        'head_pose': head_pose,
    }

def calculate_engagement(emotions):
    """Calculate engagement score from emotions"""
    # High engagement = happy + surprised, low = sad + neutral
    positive = emotions.get('happy', 0) + emotions.get('surprise', 0)
    negative = emotions.get('sad', 0) + emotions.get('neutral', 0) * 0.5
    
    engagement = positive - negative * 0.5
    return max(0, min(100, int(engagement)))

def calculate_confidence(emotions, attention_metrics):
    """Calculate confidence score"""
    # High confidence = happy + attention, low = fear + sad
    positive = emotions.get('happy', 0) * 0.6 + attention_metrics['attention_score'] * 0.4
    negative = (emotions.get('fear', 0) + emotions.get('sad', 0)) * 0.5
    
    confidence = positive - negative
    return max(0, min(100, int(confidence)))

def calculate_stress(emotions):
    """Calculate stress score"""
    # High stress = fear + anger + disgust
    stress = emotions.get('fear', 0) * 0.5 + emotions.get('angry', 0) * 0.3 + emotions.get('disgust', 0) * 0.2
    return max(0, min(100, int(stress)))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: emotion_detector.py <video_path> [sample_rate_ms]", file=sys.stderr)
        sys.exit(1)
    
    video_path = sys.argv[1]
    sample_rate = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
    
    try:
        frames = analyze_video(video_path, sample_rate)
        print(json.dumps(frames))
    except Exception as e:
        print(f"Fatal error: {str(e)}", file=sys.stderr)
        sys.exit(1)
