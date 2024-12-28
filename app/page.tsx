'use client'

import { useState, useCallback } from "react"
import Image from "next/image"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Sparkles, Upload, AlertTriangle } from 'lucide-react'

export default function Home() {
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }, [])

  const identifyImage = useCallback(async (additionalPrompt: string = "") => {
    if (!image) return

    setLoading(true)
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    try {
      const result = await model.generateContent([ 
        `Give a Skin Health Analysis and Based on the analysis,
         the app should offer tailored skincare product recommendations
         and provide a personalized skincare plan. 
         Warnings/Alerts: If any serious skin issues are detected.
          ${additionalPrompt}`,
      ])
      const response = await result.response
      const text = response
        .text()
        .trim()
        .replace(/\`\`\`/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/-\s*/g, "")
        .replace(/\n\s*\n/g, "\n")

      setResult(text)
    } catch (error) {
      console.error("Error identifying image:", error)
      setResult(error instanceof Error ? `Error identifying image: ${error.message}` : "An unknown error occurred while identifying the image.")
    } finally {
      setLoading(false)
    }
  }, [image])

 


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkinCare AI
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-12 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
            Analyze Your Skin
          </h2>
          <p className="text-center text-gray-600 mb-8">Upload a clear selfie for personalized skincare recommendations</p>
          
          <div className="mb-8">
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload a selfie
            </label>
            <div className="relative">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-purple-400 focus:outline-none"
              >
                <span className="flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-gray-600" />
                  <span className="font-medium text-gray-600">
                    {image ? image.name : "Drop your image here or click to browse"}
                  </span>
                </span>
              </label>
            </div>
          </div>
          
          {image && (
            <div className="mb-8 flex justify-center">
              <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 transform hover:scale-105">
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Uploaded image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={() => identifyImage()}
            disabled={!image || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Skin
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </section>

        {result && (
          <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Skin Analysis Results</h3>
            <div className="space-y-4">
              {result.split("\n").map((line, index) => {
                const isWarning = line.toLowerCase().includes("warning") || line.toLowerCase().includes("alert")
                return (
                  <p key={index} className={`flex items-start ${isWarning ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                    {isWarning && <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />}
                    <span>{line}</span>
                  </p>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

