# 🎯 Surgical-Precision Leaf Analysis Implementation Plan

## 📋 Current vs. Target State

### **Current Implementation:**
- ✅ Gemini AI text-based analysis
- ✅ General disease detection
- ❌ No precise pixel-level highlighting
- ❌ No clickable regions
- ❌ No visual overlays on original image

### **Target Implementation:**
- ✅ Original image preserved (no cropping/filtering)
- ✅ Surgical-precision segmentation masks
- ✅ Clickable highlighted regions
- ✅ Color-coded by issue type
- ✅ Confidence-based opacity
- ✅ Popup tooltips with details

---

## 🏗️ Architecture Overview

### **Two-Stage Pipeline:**

```
Stage 1: Coarse Classification (Gemini AI)
├─ Quick disease detection
├─ Confidence threshold check (>70%)
└─ If low confidence → return clean image

Stage 2: Precise Segmentation (Computer Vision)
├─ Pixel-level probability map
├─ High threshold (0.75-0.85)
├─ Morphological cleanup
├─ Connected component analysis
└─ Generate clickable regions
```

---

## 🔧 Technical Implementation

### **Option 1: Client-Side CV (Lightweight)**
**Best for:** Fast iteration, no server costs

**Stack:**
- TensorFlow.js or ONNX.js
- Pre-trained lightweight models (MobileNet, FastSAM)
- Canvas API for overlays
- React for UI

**Pros:**
- No backend processing
- Instant results
- Works offline

**Cons:**
- Limited model size
- Browser performance varies
- Requires model conversion

### **Option 2: Server-Side CV (Precise)**
**Best for:** Production quality, accuracy

**Stack:**
- Python FastAPI backend
- PyTorch/TensorFlow with U-Net or DeepLabv3
- OpenCV for post-processing
- NumPy for mask operations

**Pros:**
- Full model capabilities
- Better accuracy
- Consistent performance

**Cons:**
- Server costs
- Latency
- Requires deployment

### **Option 3: Hybrid (Recommended)**
**Best for:** Balance of speed and accuracy

**Stack:**
- Gemini AI for initial classification
- Lightweight segmentation model (client or server)
- Canvas overlay rendering
- Interactive regions

**Pros:**
- Leverages existing Gemini integration
- Adds precision where needed
- Flexible deployment

---

## 📦 Required Components

### **1. Segmentation Model**
```python
# Lightweight U-Net or DeepLabv3-Mobile
# Input: 512x512 RGB image
# Output: HxW probability map (0-1 per pixel)
# Classes: healthy, disease, pest, nutrient_deficiency
```

### **2. Post-Processing Pipeline**
```python
def surgical_precision_mask(prob_map, threshold=0.8):
    # High threshold for precision
    binary_mask = prob_map > threshold
    
    # Morphological cleanup
    binary_mask = remove_small_objects(binary_mask, min_size=100)
    binary_mask = binary_closing(binary_mask, disk(3))
    
    # Edge sharpening
    binary_mask = sharpen_edges(binary_mask)
    
    return binary_mask
```

### **3. Region Extraction**
```python
def extract_clickable_regions(mask, original_image):
    # Find connected components
    labeled_mask = label(mask)
    regions = []
    
    for region_id in range(1, labeled_mask.max() + 1):
        region_mask = labeled_mask == region_id
        
        # Skip tiny regions (< 0.5% of image)
        if region_mask.sum() < 0.005 * mask.size:
            continue
        
        # Extract region properties
        props = regionprops(region_mask)[0]
        
        regions.append({
            'id': region_id,
            'bbox': props.bbox,
            'centroid': props.centroid,
            'area': props.area,
            'confidence': prob_map[region_mask].mean(),
            'contour': find_contours(region_mask)[0].tolist()
        })
    
    return regions
```

### **4. Overlay Generation**
```python
def create_overlay(original_image, mask, color_map):
    overlay = original_image.copy()
    
    for class_id, color in color_map.items():
        class_mask = mask == class_id
        
        # Confidence-weighted opacity
        confidence = prob_map[class_mask].mean()
        alpha = 0.3 * confidence
        
        # Blend
        overlay[class_mask] = (
            original_image[class_mask] * (1 - alpha) +
            color * alpha
        )
    
    return overlay
```

### **5. Frontend Interactive Canvas**
```typescript
interface ClickableRegion {
  id: number
  coords: [number, number][]
  class: string
  confidence: number
  severity: 'low' | 'medium' | 'high'
  description: string
  treatment: string
}

function InteractiveLeafImage({
  imageUrl,
  regions
}: {
  imageUrl: string
  regions: ClickableRegion[]
}) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  
  const handleClick = (x: number, y: number) => {
    // Find clicked region using point-in-polygon
    const clicked = regions.find(r => 
      isPointInPolygon([x, y], r.coords)
    )
    setSelectedRegion(clicked?.id || null)
  }
  
  return (
    <div className="relative">
      <img src={imageUrl} onClick={handleClick} />
      {selectedRegion && (
        <RegionPopup region={regions.find(r => r.id === selectedRegion)} />
      )}
    </div>
  )
}
```

---

## 🎨 Color Coding Scheme

```typescript
const COLOR_MAP = {
  disease_fungal: 'rgba(220, 38, 38, 0.4)',    // Red
  disease_bacterial: 'rgba(239, 68, 68, 0.4)', // Light red
  disease_viral: 'rgba(185, 28, 28, 0.4)',     // Dark red
  pest_damage: 'rgba(251, 146, 60, 0.4)',      // Orange
  nutrient_deficiency: 'rgba(250, 204, 21, 0.4)', // Yellow
  water_stress: 'rgba(59, 130, 246, 0.4)',     // Blue
  healthy: 'rgba(34, 197, 94, 0.2)'            // Green (very faint)
}
```

---

## 🚀 Implementation Steps

### **Phase 1: Basic Segmentation (Week 1)**
- [ ] Set up Python CV backend (FastAPI)
- [ ] Integrate lightweight segmentation model
- [ ] Implement basic overlay generation
- [ ] Test with sample images

### **Phase 2: Precision Tuning (Week 2)**
- [ ] Implement high-threshold filtering
- [ ] Add morphological post-processing
- [ ] Tune confidence thresholds
- [ ] Add multi-class support

### **Phase 3: Interactive Frontend (Week 3)**
- [ ] Create interactive canvas component
- [ ] Implement click detection
- [ ] Add region popups
- [ ] Style and polish UI

### **Phase 4: Integration (Week 4)**
- [ ] Connect to existing scan flow
- [ ] Combine with Gemini analysis
- [ ] Add Supabase storage for masks
- [ ] Performance optimization

---

## 📊 Model Options

### **Recommended Models:**

1. **FastSAM** (Segment Anything - Fast)
   - Size: ~40MB
   - Speed: ~100ms on GPU
   - Accuracy: Very high
   - Use: Server-side

2. **MobileNetV3 + DeepLabv3**
   - Size: ~15MB
   - Speed: ~50ms on GPU
   - Accuracy: Good
   - Use: Server or client

3. **U-Net Mobile**
   - Size: ~5MB
   - Speed: ~30ms
   - Accuracy: Moderate
   - Use: Client-side (TensorFlow.js)

---

## 🔍 Precision Techniques

### **1. High Threshold Strategy**
```python
# Instead of default 0.5, use 0.75-0.85
threshold = 0.8
mask = prob_map > threshold
# Result: Fewer but more confident highlights
```

### **2. Ensemble Voting**
```python
# Run 2-3 models, only highlight if ≥2 agree
model1_mask = model1(image) > 0.7
model2_mask = model2(image) > 0.7
model3_mask = model3(image) > 0.7

final_mask = (model1_mask + model2_mask + model3_mask) >= 2
```

### **3. Area Filtering**
```python
# Ignore regions < 0.5% of leaf area
min_area = 0.005 * image.shape[0] * image.shape[1]
mask = remove_small_objects(mask, min_size=min_area)
```

### **4. Confidence-Weighted Opacity**
```python
# Very confident = strong color, borderline = faint
for pixel in mask:
    confidence = prob_map[pixel]
    alpha = 0.3 * confidence  # 0.3 max opacity
    color = base_color * alpha
```

---

## 💾 Data Flow

```
1. User uploads image
   ↓
2. Gemini AI: Quick classification
   ↓
3. If confidence > 70%:
   ↓
4. Segmentation model: Pixel-level mask
   ↓
5. Post-processing: Cleanup + regions
   ↓
6. Overlay generation: Color-coded
   ↓
7. Frontend: Interactive canvas
   ↓
8. User clicks region → Popup details
   ↓
9. Save to Supabase: Image + mask + regions
```

---

## 🎯 Success Metrics

- **Precision:** >90% (highlighted pixels are truly affected)
- **Recall:** >80% (most affected areas highlighted)
- **False Positive Rate:** <5%
- **Processing Time:** <3 seconds
- **User Satisfaction:** Highlights feel "surgical"

---

## 📝 Next Steps

### **Immediate (Choose One):**

**Option A: Quick Prototype (Client-Side)**
- Use TensorFlow.js with pre-trained model
- Implement basic overlay
- Test with sample images
- Fast iteration

**Option B: Production Quality (Server-Side)**
- Set up Python FastAPI backend
- Train/fine-tune segmentation model
- Implement full pipeline
- Higher accuracy

**Option C: Hybrid Approach (Recommended)**
- Keep Gemini for classification
- Add lightweight segmentation
- Progressive enhancement
- Best of both worlds

---

## 🤔 Questions to Answer

1. **Deployment:** Client-side or server-side CV?
2. **Model:** Pre-trained or custom-trained?
3. **Speed vs. Accuracy:** Real-time or high-precision?
4. **Integration:** Replace Gemini or complement it?
5. **Storage:** Save masks to Supabase?

---

**Ready to implement?** Let me know which option you prefer and I'll start building! 🚀
