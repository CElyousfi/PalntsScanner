# 🚀 QUICK START - Notebook Editor

## ⚡ Get Started in 2 Minutes!

---

## Step 1: Open Notes Page
```
http://localhost:3000/dashboard/notes
```

---

## Step 2: Create or Select Note
- Click existing note, OR
- Click "New Note" button

---

## Step 3: Add Your First Cell

### **Click the + button between cells**

Choose **Markdown** for text:
```markdown
# My First Farm Report

## Today's Tasks
- ✓ Checked irrigation
- ✓ Inspected crops
- ✓ Recorded data
```

Press **Shift+Enter** to render!

---

## Step 4: Add a Chart

### **Click + again, choose Chart**

Paste this:
```json
{
  "type": "line",
  "title": "Weekly Health Trend",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "datasets": [{
      "label": "Health %",
      "data": [75, 80, 82, 85, 88],
      "borderColor": "#6BBF59"
    }]
  }
}
```

Press **Shift+Enter** to see the chart!

---

## Step 5: Add More Content

### **Click + for another Markdown cell:**
```markdown
## Observations
Plants are thriving! Growth rate increased by 15% this week.

## Next Steps
- Monitor soil moisture
- Prepare for harvest
```

Press **Shift+Enter**!

---

## 🎉 Done!

You now have a beautiful notebook with:
- ✅ Formatted headers
- ✅ Task lists
- ✅ Interactive chart
- ✅ Clean paragraphs

---

## ⌨️ Quick Shortcuts

| Shortcut | Action |
|----------|--------|
| **Shift+Enter** | Run cell |
| **Ctrl+↑** | Previous cell |
| **Ctrl+↓** | Next cell |
| **Delete** | Delete cell |
| **Click +** | Add cell |

---

## 📊 Chart Templates

### Line Chart:
```json
{
  "type": "line",
  "title": "Your Title",
  "data": {
    "labels": ["A", "B", "C"],
    "datasets": [{
      "label": "Series 1",
      "data": [10, 20, 30],
      "borderColor": "#6BBF59"
    }]
  }
}
```

### Bar Chart:
```json
{
  "type": "bar",
  "title": "Your Title",
  "data": {
    "labels": ["A", "B", "C"],
    "datasets": [{
      "label": "Series 1",
      "data": [10, 20, 30],
      "backgroundColor": "#6BBF59"
    }]
  }
}
```

---

## 💡 Tips

1. **Edit any cell:** Click it, then click Edit button
2. **Reorder cells:** Use ↑ ↓ buttons in toolbar
3. **Delete cells:** Select cell, click trash icon
4. **Auto-save:** Everything saves automatically!

---

**🎊 That's it! You're ready to create amazing farm reports!** ✨
