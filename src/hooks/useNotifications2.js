import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { solicitudesService } from '../services/solicitudesService';

export const useNotifications = (userId, userType) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCheckRef = useRef(new Date().toISOString());
  const shownNotificationsRef = useRef(new Set());

  const checkForChanges = async () => {
    console.log('🔔 Verificando notificaciones...');
    console.log('👤 Usuario ID:', userId);
    console.log('🏷️ Tipo de usuario:', userType);

    if (!userId || !userType) {
      console.log('❌ No hay userId o userType, saltando verificación');
      return;
    }

    try {
      const response = await solicitudesService.checkForChanges(
        userId, 
        userType, 
        lastCheckRef.current
      );

      console.log('📨 Respuesta del servidor:', response);

      // 🔍 LOGS DETALLADOS PARA DEBUG
      let changes = [];
      
      if (userType === 'SECRETARIA') {
        changes = response?.new_solicitudes || [];
        console.log('🏢 SECRETARIA - new_solicitudes:', response?.new_solicitudes);
        console.log('🏢 SECRETARIA - changes extraídos:', changes);
        console.log('🏢 SECRETARIA - length:', changes.length);
      } else if (userType === 'ESTUDIANTE') {
        changes = response?.changes || response || [];
        console.log('🎓 ESTUDIANTE - changes:', response?.changes);
        console.log('🎓 ESTUDIANTE - response completo:', response);
        console.log('🎓 ESTUDIANTE - changes extraídos:', changes);
      }

      console.log('📋 Cambios finales a procesar:', changes);
      console.log('📊 Cantidad de cambios:', changes.length);

      if (changes && Array.isArray(changes) && changes.length > 0) {
        console.log('✅ Hay cambios para procesar');
        
        // 🔍 LOG DE CADA CAMBIO
        changes.forEach((change, index) => {
          console.log(`📄 Cambio ${index + 1}:`, change);
          console.log(`📄 ID del cambio ${index + 1}:`, change.id || change.solicitud_id);
        });

        // Filtrar solo notificaciones que NO hemos mostrado
        const newNotifications = changes.filter(change => {
          const notifId = change.id || change.solicitud_id;
          const isShown = shownNotificationsRef.current.has(notifId);
          console.log(`🔍 Cambio ID ${notifId} - Ya mostrado: ${isShown}`);
          return !isShown;
        });

        console.log('✨ Notificaciones nuevas (no mostradas):', newNotifications.length);
        console.log('✨ Detalle de notificaciones nuevas:', newNotifications);

        if (newNotifications.length > 0) {
          // Marcar como mostradas
          newNotifications.forEach(notification => {
            const notifId = notification.id || notification.solicitud_id;
            shownNotificationsRef.current.add(notifId);
            console.log('✅ Marcando como mostrada:', notifId);
          });

          // Agregar a la lista de notificaciones
          setNotifications(prev => [...newNotifications, ...prev]);
          setUnreadCount(prev => prev + newNotifications.length);

          // Mostrar toast SOLO para nuevas notificaciones
          newNotifications.forEach(change => {
            const message = userType === 'SECRETARIA' 
              ? `Nueva solicitud de ${change.estudiante_nombre || change.alumno_nombre || 'un estudiante'}`
              : `Tu solicitud fue ${change.estado?.toLowerCase() || 'actualizada'}`;

            console.log('🍞 Mostrando toast:', message);
            toast.success(message, {
              duration: 5000,
              position: 'top-right',
              id: `notification-${change.id || change.solicitud_id}`
            });
          });
        } else {
          console.log('🔄 No hay notificaciones nuevas para mostrar (todas ya fueron mostradas)');
        }

        lastCheckRef.current = new Date().toISOString();
      } else {
        console.log('📭 No hay cambios válidos');
        console.log('📭 changes es array?', Array.isArray(changes));
        console.log('📭 changes length:', changes?.length);
      }
    } catch (error) {
      console.error('🚨 Error checking for changes:', error);
    }
  };

  const markAsRead = (notificationIds = null) => {
    if (notificationIds) {
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id || notif.solicitud_id) 
            ? { ...notif, read: true }
            : notif
        )
      );
    } else {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const clearOldNotifications = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    setNotifications(prev => 
      prev.filter(notif => new Date(notif.fecha_solicitud) > oneDayAgo)
    );
  };

  useEffect(() => {
    if (!userId || !userType) return;

    checkForChanges();
    const interval = setInterval(checkForChanges, 30000);
    const cleanupInterval = setInterval(clearOldNotifications, 3600000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [userId, userType]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearOldNotifications
  };
};