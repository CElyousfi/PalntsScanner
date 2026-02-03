# 📝 Farm Notes - AI-Assisted Markdown Documentation System

## Overview
A complete markdown-based note-taking system designed specifically for farm reporting and documentation. Features AI assistance, drag-and-drop media, charts, and full markdown support.

---

## ✨ Features

### 1. **Multi-File Management**
- Create unlimited notes
- Organize in folders (General, Farm Reports, Research)
- Pin important notes
- Full-text search across all notes
- Auto-save (localStorage)

### 2. **Rich Markdown Editor**
- Live preview mode (split-screen)
- Complete toolbar with all formatting options
- Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, etc.)
- Syntax highlighting
- Monospace font for clean editing

### 3. **Media Support**
- **Drag & Drop** - Drop images directly into editor
- **Paste Images** - Ctrl+V to paste from clipboard
- **File Upload** - Browse and select images
- Auto-embedding in markdown format

### 4. **Charts & Analytics**
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- JSON-based configuration
- Live rendering in preview

### 5. **AI Assistant**
- Context-aware suggestions
- Farm data integration
- Quick actions:
  - Generate growth summaries
  - Insert analytics charts
  - Create risk assessments
  - Generate weekly reports
- Chat interface
- One-click content insertion

### 6. **Import/Export**
- Export all notes as JSON
- Import notes from backup
- Portable data format

---

## 🚀 Quick Start

### Access Notes
```
Navigate to: /dashboard/notes
Or click the "Notes" icon in the dashboard sidebar
```

### Create Your First Note
1. Click the `[+ New]` button
2. Choose a folder
3. Start typing in markdown
4. Use toolbar for formatting

### Insert a Chart
```markdown
```chart
{
  "type": "line",
  "title": "Crop Health Trend",
  "data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "datasets": [{
      "label": "Health %",
      "data": [75, 80, 85, 90]
    }]
  }
}
```
```

### Use AI Assistant
1. Click the sparkle icon (bottom right)
2. Choose a quick action or type a request
3. Review AI-generated content
4. Click "Insert to note" to add it

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold text |
| `Ctrl/Cmd + I` | Italic text |
| `Ctrl/Cmd + K` | Insert link |
| `Ctrl/Cmd + Shift + P` | Toggle preview |

---

## 📊 Chart Types

### Line Chart
```json
{
  "type": "line",
  "title": "Growth Over Time",
  "data": {
    "labels": ["Day 1", "Day 2", "Day 3"],
    "datasets": [{
      "label": "Height (cm)",
      "data": [10, 15, 22]
    }]
  }
}
```

### Bar Chart
```json
{
  "type": "bar",
  "title": "Yield Comparison",
  "data": {
    "labels": ["Plot A", "Plot B", "Plot C"],
    "datasets": [{
      "label": "Yield (kg)",
      "data": [45, 52, 38]
    }]
  }
}
```

### Pie Chart
```json
{
  "type": "pie",
  "title": "Crop Distribution",
  "data": {
    "labels": ["Tomatoes", "Peppers", "Lettuce"],
    "datasets": [{
      "data": [40, 35, 25]
    }]
  }
}
```

---

## 🎯 Use Cases

### Daily Farm Logs
```markdown
# Daily Log - January 28, 2024

## Morning Tasks
- [x] Irrigation check
- [x] Pest inspection
- [x] Temperature: 22°C

## Observations
Plants looking healthy...
```

### Weekly Reports
```markdown
# Weekly Report - Week 4

## Summary
Excellent progress this week...

## Health Trend
[Insert chart showing daily health %]

## Next Week
- Monitor flowering
- Adjust nutrients
```

### Research Notes
```markdown
# Organic Pest Control Study

## Hypothesis
Ladybugs will reduce aphids by 70%...

## Results
[Chart comparing treatment groups]
```

---

## 🗂️ File Structure

```
/app/dashboard/notes/
  ├── page.tsx              # Main notes page
  └── layout.tsx            # Custom layout

/components/notes/
  ├── MarkdownEditor.tsx    # Editor with toolbar
  ├── NotesSidebar.tsx      # File browser
  ├── AIAssistant.tsx       # AI helper
  ├── ChartRenderer.tsx     # Graph components
  ├── ExportImport.tsx      # Backup features
  └── OnboardingTour.tsx    # First-time guide

/context/
  └── NotesContext.tsx      # State management

/lib/
  ├── notesStore.ts         # LocalStorage API
  └── sampleNotes.ts        # Demo content

/types/
  └── notes.ts              # TypeScript types
```

---

## 💾 Data Storage

### LocalStorage Keys
- `leafscan_farm_notes` - All notes
- `leafscan_note_folders` - Folder structure
- `notes_tour_completed` - Onboarding status

### Data Format
```typescript
interface FarmNote {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  tags: string[]
  folder?: string
  isPinned: boolean
  metadata: {
    wordCount: number
    lastEditedBy: string
  }
}
```

---

## 🤖 AI Integration

### Context Awareness
The AI assistant has access to:
- Current crop vitals
- Growth stage information
- Historical diagnoses
- Weather data
- Pest/disease history

### Example Prompts
- "Add a growth summary for my tomatoes"
- "Create a chart showing health trends"
- "Generate a risk assessment"
- "Write a weekly report template"

---

## 🎨 Markdown Support

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Formatting
```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Lists
```markdown
- Bullet item
- Another item

1. Numbered item
2. Another item

- [ ] Task item
- [x] Completed task
```

### Links & Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

### Blockquotes
```markdown
> This is a quote
```

---

## 🔧 Customization

### Add New Folders
```typescript
createFolder('Custom Folder', '#FF5733')
```

### Custom Chart Colors
Edit `/components/notes/ChartRenderer.tsx`:
```typescript
const colors = ['#6BBF59', '#3B82F6', '#8B5CF6']
```

---

## 🐛 Troubleshooting

### Notes Not Saving
- Check browser localStorage is enabled
- Clear cache and reload
- Export notes as backup

### Charts Not Rendering
- Verify JSON syntax is correct
- Check chart type is supported (line, bar, pie)
- Toggle preview mode

### AI Not Responding
- Ensure active note is selected
- Check farm data is loaded
- Refresh the page

---

## 📱 Mobile Support

The notes interface is fully responsive:
- Collapsible sidebar on mobile
- Touch-friendly toolbar
- Swipe gestures for navigation
- Mobile-optimized preview

---

## 🚀 Future Enhancements

- [ ] Real-time collaboration
- [ ] Cloud sync
- [ ] PDF export
- [ ] Voice dictation
- [ ] Template library
- [ ] Advanced search filters
- [ ] Version history
- [ ] Offline mode

---

## 📄 License

Part of the LeafScan AI project.
Built for sustainable agriculture and farm management.

---

## 🤝 Contributing

To add new features:
1. Create component in `/components/notes/`
2. Add to NotesContext if state needed
3. Update this README
4. Test thoroughly

---

**Happy Note-Taking! 📝🌱**
