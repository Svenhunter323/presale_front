# ProgressBar Component Customization - Complete

## Overview
Enhanced the ProgressBar component to be fully customizable with gradient colors and updated all components to use it.

---

## ✅ ProgressBar Component Enhancements

### **New Features:**

1. **Gradient Color Presets:**
   ```javascript
   const GRADIENT_PRESETS = {
     primary: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
     green: 'linear-gradient(90deg, #10b981, #34d399)',
     blue: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
     red: 'linear-gradient(90deg, #ef4444, #f87171)',
     purple: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
     teal: 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
   }
   ```

2. **Flexible Props:**
   - `soldWave` / `capWave` - For token-based progress
   - `value` / `max` - For percentage-based progress
   - `gradient` - Preset name or custom gradient string
   - `showStats` - Show/hide sold/remaining stats
   - `showLabel` - Show/hide percentage label
   - `showCap` - Show/hide total cap text
   - `height` - Custom height class (default: 'h-6')
   - `animationDuration` - Animation speed (default: 1.5s)

3. **Auto-Detection:**
   - Automatically detects which props are provided
   - Supports both token amounts and percentages
   - Smart label and stats display

---

## ✅ Updated Components

### 1. **Main ProgressBar** (`src/components/ProgressBar.jsx`)
**Usage in Home page:**
```jsx
<ProgressBar 
  soldWave={saleData.soldWave}
  capWave={saleData.capWave}
  gradient="primary"  // Multi-color gradient
  showStats={true}
  showLabel={true}
  showCap={true}
/>
```
**Features:**
- ✨ Multi-color gradient (blue → purple → pink)
- ✨ Shows sold/remaining stats
- ✨ Shows total cap
- ✨ 6px height for main visibility

---

### 2. **StageBadge** (`src/components/StageBadge.jsx`)
**Updated to:**
```jsx
<ProgressBar 
  soldWave={currentStage.soldInStage}
  capWave={currentStage.capWave}
  gradient="green"
  showStats={false}
  showCap={false}
  height="h-3"
/>
```
**Features:**
- ✨ Green gradient for stage progress
- ✨ Compact 3px height
- ✨ No stats (shown separately above/below)
- ✨ Stage-specific sold/cap values

---

### 3. **SoftCapProgress** (`src/components/SoftCapProgress.jsx`)
**Updated to:**
```jsx
<ProgressBar 
  value={percentage}
  max={100}
  gradient={gradientColors[statusInfo.color]}
  showStats={false}
  showCap={false}
  showLabel={true}
  height="h-6"
/>
```
**Dynamic Gradients:**
- 🟢 Green: Soft cap reached
- 🔵 Blue: In progress
- 🔴 Red: Failed/refunds
- ⚫ Gray: Not started

**Features:**
- ✨ Context-aware colors based on sale status
- ✨ Custom gradient per status
- ✨ Stats shown separately in grid layout
- ✨ 6px height for visibility

---

### 4. **Admin OverviewSection** (`src/components/admin/OverviewSection.jsx`)
**Updated to:**
```jsx
<ProgressBar 
  value={softCapProgress}
  max={100}
  showLabel={false}
  gradient="green"
  height="h-3"
/>
```
**Features:**
- ✨ Green gradient for soft cap
- ✨ Compact 3px height for admin panel
- ✨ No label (shown above)
- ✨ Percentage-based progress

---

## 🎨 Gradient Color Guide

### **When to Use Each Gradient:**

| Gradient | Use Case | Colors |
|----------|----------|--------|
| `primary` | Main sale progress | Blue → Purple → Pink |
| `green` | Success states, stage progress, soft cap | Green → Light Green |
| `blue` | Active/in-progress states | Blue → Light Blue |
| `red` | Failed/refund states | Red → Light Red |
| `purple` | Special features | Purple → Light Purple |
| `teal` | Alternative accent | Teal → Cyan |

### **Custom Gradients:**
You can also pass a custom gradient string:
```jsx
<ProgressBar 
  gradient="linear-gradient(90deg, #ff0000, #00ff00, #0000ff)"
  ...
/>
```

---

## 📊 Usage Examples

### Example 1: Token Sale Progress
```jsx
<ProgressBar 
  soldWave={199265666700000000000000n}
  capWave={300000000000000000000000n}
  gradient="primary"
  showStats={true}
  showLabel={true}
  showCap={true}
/>
```

### Example 2: Percentage Progress (Admin)
```jsx
<ProgressBar 
  value={45.42}
  max={100}
  gradient="green"
  showLabel={false}
  height="h-3"
/>
```

### Example 3: Stage Progress
```jsx
<ProgressBar 
  soldWave={stageData.sold}
  capWave={stageData.cap}
  gradient="green"
  showStats={false}
  showCap={false}
  height="h-3"
/>
```

### Example 4: Context-Aware Colors
```jsx
<ProgressBar 
  value={percentage}
  gradient={status === 'success' ? 'green' : status === 'failed' ? 'red' : 'blue'}
  showLabel={true}
/>
```

---

## 🎯 Component Features

### **All Progress Bars Now Have:**
- ✨ Smooth width animation (0 → percentage)
- ✨ Continuous shine sweep effect (2s infinite)
- ✨ Secondary gradient animation layer
- ✨ Backdrop blur glassmorphism
- ✨ Responsive to color themes
- ✨ Customizable heights
- ✨ Optional stats and labels

---

## 📁 Files Modified

1. **src/components/ProgressBar.jsx** - Enhanced with customization options
2. **src/components/StageBadge.jsx** - Updated to use ProgressBar
3. **src/components/SoftCapProgress.jsx** - Updated to use ProgressBar with dynamic colors
4. **src/components/admin/OverviewSection.jsx** - Updated to use ProgressBar
5. **src/components/ui/ProgressBar.jsx** - Already had shine animation

---

## 🔧 Technical Details

### **Animation Specs:**
- Width animation: 0 → percentage (1.5s ease-out default)
- Shine sweep: Horizontal sweep (2s infinite linear)
- Gradient shift: Background position animation (3s infinite)

### **Styling:**
- Background: `bg-gray-800/50` with backdrop blur
- Border: `border-gray-700/50` for subtle depth
- Height options: h-3, h-6 (or custom)
- Gradient: Dynamic via style prop

### **Performance:**
- GPU-accelerated transforms
- CSS animations for smooth 60fps
- Memoized gradient calculations
- No layout shifts

---

## ✅ Benefits

1. **Code Reusability** - Single component used everywhere
2. **Consistency** - Same animations and styling
3. **Flexibility** - Easy to customize per use case
4. **Maintainability** - Update once, applies everywhere
5. **Performance** - Optimized animations
6. **Accessibility** - Semantic HTML structure

---

## 🚀 All Progress Bars Summary

| Location | Gradient | Height | Shows Stats | Shows Label |
|----------|----------|--------|-------------|-------------|
| Home - Main Progress | Primary (multi) | 6px | ✅ Yes | ✅ Yes |
| StageBadge | Green | 3px | ❌ No | ✅ Yes |
| SoftCapProgress | Dynamic | 6px | ❌ No | ✅ Yes |
| Admin Overview | Green | 3px | ❌ No | ❌ No |
| UI Component | Teal/Cyan/Indigo | 3px | ❌ No | ✅ Yes |

---

## 📝 Migration Notes

**Before:**
- Each component had inline motion.div code
- Duplicate animation logic
- Hard to maintain consistency

**After:**
- All use single ProgressBar component
- Centralized animation logic
- Easy customization via props
- Consistent look and feel

---

**All progress bars unified and enhanced! 🎉**
