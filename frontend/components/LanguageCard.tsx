'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Users, Star, Play, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

interface Language {
  id: string
  name: string
  code: string
  flag: string
  description: string
}

interface LanguageCardProps {
  language: Language
}

export function LanguageCard({ language }: LanguageCardProps) {
  const { isAuthenticated } = useAuth()
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
      return
    }

    setIsEnrolling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/languages/${language.id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Success - could show a toast notification here
        console.log('Successfully enrolled in', language.name)
      } else {
        const error = await response.json()
        console.error('Enrollment failed:', error.error)
      }
    } catch (error) {
      console.error('Enrollment error:', error)
    } finally {
      setIsEnrolling(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="lesson-card group"
    >
      {/* Language Flag and Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{language.flag}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
              {language.name}
            </h3>
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              {language.code}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6 line-clamp-2">
        {language.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-primary-600">25+</div>
          <div className="text-xs text-gray-500">Lessons</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-secondary-600">500+</div>
          <div className="text-xs text-gray-500">Exercises</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-success-600">10K+</div>
          <div className="text-xs text-gray-500">Learners</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {isAuthenticated ? (
          <>
            <Button
              onClick={handleEnroll}
              loading={isEnrolling}
              className="flex-1"
              size="sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            <Link href={`/languages/${language.id}`}>
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/register" className="flex-1">
              <Button className="w-full" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link href={`/languages/${language.id}`}>
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Progress Indicator (if enrolled) */}
      {isAuthenticated && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>0%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
        </div>
      )}

      {/* Popularity Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Popular
        </div>
      </div>
    </motion.div>
  )
}
