'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    weatherBlock: {
      insertWeather: () => ReturnType,
    }
  }
}

// Weather Block Component
const WeatherBlockComponent = ({ node, updateAttributes }: any) => {
  const weatherData = node.attrs.data ? JSON.parse(node.attrs.data) : null

  if (!weatherData) {
    return (
      <NodeViewWrapper className="weather-block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 my-4 bg-gray-50">
          <div className="text-center">
            <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium mb-2">Weather Block</p>
            <p className="text-sm text-gray-500 mb-6">Add current weather conditions</p>
            <button
              onClick={() => {
                const sampleData = JSON.stringify({
                  location: 'San Francisco, CA',
                  date: new Date().toISOString(),
                  temperature: 72,
                  humidity: 65,
                  condition: 'Partly Cloudy',
                  windSpeed: 12,
                  rainfall: 0,
                  forecast: [
                    { day: 'Mon', temp: 72, condition: 'sunny' },
                    { day: 'Tue', temp: 70, condition: 'cloudy' },
                    { day: 'Wed', temp: 68, condition: 'rainy' },
                    { day: 'Thu', temp: 71, condition: 'sunny' },
                    { day: 'Fri', temp: 73, condition: 'sunny' }
                  ]
                })
                updateAttributes({ data: sampleData })
              }}
              className="px-4 py-2 bg-apeel-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Weather Data
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <NodeViewWrapper className="weather-block">
      <div className="border border-gray-200 rounded-lg p-6 my-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {getWeatherIcon(weatherData.condition)}
              Weather Conditions
            </h3>
            <p className="text-sm text-gray-600">
              {weatherData.location} • {new Date(weatherData.date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => updateAttributes({ data: null })}
            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Remove
          </button>
        </div>

        {/* Current Conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-600">Temperature</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weatherData.temperature}°F</p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">Humidity</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weatherData.humidity}%</p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">Wind</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weatherData.windSpeed} mph</p>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Rainfall</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{weatherData.rainfall}&quot;</p>
          </div>
        </div>

        {/* 5-Day Forecast */}
        {weatherData.forecast && weatherData.forecast.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">5-Day Forecast</h4>
            <div className="flex gap-2 overflow-x-auto">
              {weatherData.forecast.map((day: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-3 min-w-[80px] text-center shadow-sm">
                  <p className="text-xs font-medium text-gray-600 mb-2">{day.day}</p>
                  {getWeatherIcon(day.condition)}
                  <p className="text-lg font-bold text-gray-800 mt-2">{day.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

// TipTap Extension
export const WeatherBlock = Node.create({
  name: 'weatherBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="weather-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'weather-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(WeatherBlockComponent)
  },

  addCommands() {
    return {
      insertWeather:
        () =>
          ({ commands }: any) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                data: null,
              },
            })
          },
    }
  },
})
