import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
  showCloseButton?: boolean
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
    border: 'border-emerald-400',
    icon: 'text-emerald-100',
    text: 'text-emerald-50',
    shadow: 'shadow-emerald-500/25',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
    border: 'border-red-400',
    icon: 'text-red-100',
    text: 'text-red-50',
    shadow: 'shadow-red-500/25',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    border: 'border-amber-400',
    icon: 'text-amber-100',
    text: 'text-amber-50',
    shadow: 'shadow-amber-500/25',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    border: 'border-blue-400',
    icon: 'text-blue-100',
    text: 'text-blue-50',
    shadow: 'shadow-blue-500/25',
  },
}

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  showCloseButton = true,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const IconComponent = icons[type]
  const colorScheme = colors[type]

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    if (duration > 0) {
      const dismissTimer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => {
        clearTimeout(timer)
        clearTimeout(dismissTimer)
      }
    }
    
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-sm w-full
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div
        className={`
          ${colorScheme.bg} ${colorScheme.border}
          border-2 rounded-2xl shadow-2xl backdrop-blur-sm
          p-5 relative overflow-hidden
          ${colorScheme.shadow}
        `}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
        
        {/* Content */}
        <div className="relative flex items-start space-x-4">
          <div className={`flex-shrink-0 p-2 rounded-xl bg-white/20 backdrop-blur-sm ${colorScheme.icon}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${colorScheme.text} mb-1 tracking-wide`}>
              {title}
            </h4>
            <p className={`text-sm ${colorScheme.text} opacity-95 leading-relaxed`}>
              {message}
            </p>
          </div>
          
          {showCloseButton && (
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 ${colorScheme.text} hover:bg-white/20
                rounded-full p-1.5 transition-all duration-200
                hover:scale-110 active:scale-95
              `}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-white/60 transition-all duration-300 ease-linear rounded-b-2xl"
              style={{
                width: isLeaving ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full"></div>
      </div>
    </div>
  )
}

// Notification Container
interface NotificationContainerProps {
  notifications: NotificationProps[]
  onClose: (id: string) => void
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-4">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = {
      ...notification,
      id,
      onClose: removeNotification,
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  }
} 