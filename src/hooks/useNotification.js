import { useState, useCallback } from 'react'
import React from 'react'
import Notification from '../components/admin/Notification'

export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'info', duration = 5000) => {
    setNotification({ message, type, duration })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const NotificationComponent = notification ? React.createElement(Notification, {
    message: notification.message,
    type: notification.type,
    duration: notification.duration,
    onClose: hideNotification
  }) : null

  return {
    showNotification,
    hideNotification,
    NotificationComponent,
    success: (message, duration) => showNotification(message, 'success', duration),
    error: (message, duration) => showNotification(message, 'error', duration),
    warning: (message, duration) => showNotification(message, 'warning', duration),
    info: (message, duration) => showNotification(message, 'info', duration),
  }
}

