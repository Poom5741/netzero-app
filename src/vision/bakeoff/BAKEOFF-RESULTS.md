# Vision Model Bake-Off Results

**Date**: 2026-08-27  
**Dataset**: 169 pipe photos (81 flooded, 68 dry, 20 invalid)  
**D17 Safety Bar**: ≤2% bad-slip rate, ≥70% accuracy

## Winner

**CLIP ViT-L/14 with 10 examples per class (few-shot)**
- **Accuracy**: 92.31% ✓
- **Bad-slip rate**: 0.00% ✓
- **Inference time**: ~0.5s per image on CPU
- **Model size**: ~890MB

## All Models Tested

| Model | Accuracy | Bad-slip | D17 Pass | Notes |
|-------|----------|----------|----------|-------|
| **CLIP ViT-L/14 (10 examples)** | 92.31% | 0.00% | ✅ | Winner |
| CLIP ViT-L/14 (5 examples) | 80.77% | 33.33% | ❌ | High bad-slip |
| CLIP ViT-B/32 (5 examples) | 65.38% | 0.00% | ❌ | Low accuracy |
| ResNet-50 (anomaly detection) | 62.79% | 45.00% | ❌ | Poor invalid detection |
| ResNet-50 (focal loss) | 77% | 66.67% | ❌ | Overfitting |
| EfficientNet-B3 | 65% | 33.33% | ❌ | Small dataset |
| MobileNetV2 | 65% | 33.33% | ❌ | Fast but inaccurate |
| Two-stage (ResNet-34) | 63% | 0%* | ❌ | Flawed test |
| Anomaly detection | 60-63% | 45-80% | ❌ | Threshold tuning failed |

*Two-stage had 0 invalid photos in test set

## Key Findings

1. **CLIP few-shot outperforms transfer learning** - With only 169 images, fine-tuning CNNs leads to overfitting. CLIP's pre-trained embeddings generalize better.

2. **More examples help** - Increasing from 5 to 10 examples per class improved accuracy from 80.77% to 92.31% and eliminated bad-slip.

3. **Invalid detection is hard** - Most models struggle with the "invalid" class (photos without clear pipes). CLIP's semantic understanding handles this better than pixel-based approaches.

4. **Threshold tuning doesn't help** - Confidence thresholds can't fix fundamental misclassifications. The model needs to learn the right features.

## Implementation Notes

- **Model**: OpenAI CLIP ViT-L/14
- **Approach**: Few-shot classification using example images
- **Encoding**: Median of 10 example embeddings per class
- **Similarity**: Cosine similarity between image and class embeddings
- **Dependencies**: `clip` (OpenAI), `torch`, `torchvision`

## Files

- Results: `src/vision/bakeoff/*-results.json`
- Training scripts: `src/vision/bakeoff/train-*.py`
- Winner script: `src/vision/bakeoff/train-clip-more-examples.py`

## Next Steps

See [Integration Ticket #111](https://github.com/Poom5741/netzero-app/issues/111) for production deployment.
