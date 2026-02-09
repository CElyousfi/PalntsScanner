export interface TutorialStep {
    title: string
    description: string
    position?: 'center' | 'left' | 'right' | 'top' | 'bottom'
}

export const TUTORIALS: Record<string, TutorialStep[]> = {
    'dashboard': [
        {
            title: "Welcome to LeafScan AI! 🌿",
            description: "Your intelligent companion for plant health. This dashboard is your command center.",
            position: 'center'
        },
        {
            title: "Tools & Actions",
            description: "Quickly access key features here: Start a New Scan, view History, check the Threat Map, and more.",
            position: 'left'
        },
        {
            title: "Recent Activity",
            description: "Your latest scans appear here. Tap any item to jump back into the details.",
            position: 'right'
        },
        {
            title: "Morning Brief",
            description: "Scroll down to see your Daily Weather Forecast and AI Coaching tips tailored to your farm.",
            position: 'bottom'
        }
    ],
    'scan': [
        {
            title: "Start a Diagnosis 🔍",
            description: "This is the heart of LeafScan. Here you can analyze leaves or produce for diseases and defects.",
            position: 'center'
        },
        {
            title: "Select Mode",
            description: "Choose between 'Crop Doctor' for leaves/plants or 'Produce QC' for fruits/vegetables.",
            position: 'top'
        },
        {
            title: "Upload or Capture",
            description: "Take a photo directly or upload an existing image. Our AI analyzes it instantly.",
            position: 'center'
        }
    ],
    'history': [
        {
            title: "Scan History 📜",
            description: "All your past diagnostics are saved here. You can filter by date, health status, or crop type.",
            position: 'center'
        },
        {
            title: "Detailed Reports",
            description: "Click on any record to view the full AI analysis, treatment recommendations, and downloadable reports.",
            position: 'center'
        }
    ],
    'map': [
        {
            title: "Threat Map 🗺️",
            description: "Visualize disease outbreaks in your area. This helps you stay ahead of spreading pathogens.",
            position: 'center'
        },
        {
            title: "Layers & Alerts",
            description: "Toggle different data layers to see weather patterns, humidity, and confirmed reports.",
            position: 'left'
        }
    ],
    'explore': [
        {
            title: "Explore Knowledge 💡",
            description: "Access a library of agricultural knowledge, identifying pests, diseases, and best practices.",
            position: 'center'
        }
    ],
    'notes': [
        {
            title: 'Welcome to Farm Notes! 📝',
            description: 'Create detailed farm reports with AI assistance, charts, and images.',
            position: 'center'
        },
        {
            title: 'Organization',
            description: 'Create new notes and organize them with tags specifically for your farm records.',
            position: 'left'
        },
        {
            title: 'AI Assistant',
            description: 'Use the AI sidebar to generate summaries or get writing assistance for your observations.',
            position: 'right'
        }
    ]
}
