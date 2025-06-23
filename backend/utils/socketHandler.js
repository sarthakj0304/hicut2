const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active connections
const activeConnections = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive || user.isBanned) {
      return next(new Error('Invalid user'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

const socketHandler = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Store connection
    activeConnections.set(socket.userId, socket);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle location updates
    socket.on('location_update', async (data) => {
      try {
        const { lat, lng, address } = data;
        
        // Update user location in database
        await User.findByIdAndUpdate(socket.userId, {
          'location.current': {
            lat,
            lng,
            timestamp: new Date()
          },
          ...(address && { 'location.address': address })
        });

        // Broadcast location to relevant users (drivers/riders in area)
        socket.broadcast.emit('user_location_update', {
          userId: socket.userId,
          location: { lat, lng },
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle ride requests (for drivers)
    socket.on('ride_request', (data) => {
      const { driverId, rideDetails } = data;
      
      // Send ride request to specific driver
      const driverSocket = activeConnections.get(driverId);
      if (driverSocket) {
        driverSocket.emit('new_ride_request', {
          riderId: socket.userId,
          rideDetails,
          timestamp: new Date()
        });
      }
    });

    // Handle ride acceptance
    socket.on('ride_accept', (data) => {
      const { riderId, rideId } = data;
      
      // Notify rider that ride was accepted
      const riderSocket = activeConnections.get(riderId);
      if (riderSocket) {
        riderSocket.emit('ride_accepted', {
          driverId: socket.userId,
          rideId,
          timestamp: new Date()
        });
      }
    });

    // Handle ride rejection
    socket.on('ride_reject', (data) => {
      const { riderId, rideId, reason } = data;
      
      // Notify rider that ride was rejected
      const riderSocket = activeConnections.get(riderId);
      if (riderSocket) {
        riderSocket.emit('ride_rejected', {
          driverId: socket.userId,
          rideId,
          reason,
          timestamp: new Date()
        });
      }
    });

    // Handle ride status updates
    socket.on('ride_status_update', (data) => {
      const { rideId, status, targetUserId } = data;
      
      // Send status update to the other participant
      const targetSocket = activeConnections.get(targetUserId);
      if (targetSocket) {
        targetSocket.emit('ride_status_changed', {
          rideId,
          status,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Handle chat messages
    socket.on('send_message', (data) => {
      const { rideId, message, recipientId } = data;
      
      // Send message to recipient
      const recipientSocket = activeConnections.get(recipientId);
      if (recipientSocket) {
        recipientSocket.emit('new_message', {
          rideId,
          message,
          senderId: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      const { rideId, location, type } = data;
      
      // Broadcast emergency to all connected admins/support
      socket.broadcast.emit('emergency_alert', {
        userId: socket.userId,
        rideId,
        location,
        type,
        timestamp: new Date()
      });
      
      console.log(`EMERGENCY ALERT from user ${socket.userId}:`, data);
    });

    // Handle driver availability toggle
    socket.on('toggle_availability', async (data) => {
      try {
        const { available } = data;
        
        // Update driver availability in database
        await User.findByIdAndUpdate(socket.userId, {
          'driverStatus.available': available,
          'driverStatus.lastUpdate': new Date()
        });

        // Broadcast availability change to nearby riders
        socket.broadcast.emit('driver_availability_changed', {
          driverId: socket.userId,
          available,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Availability toggle error:', error);
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Update last seen timestamp
      User.findByIdAndUpdate(socket.userId, {
        lastSeen: new Date()
      }).catch(console.error);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Utility function to send notification to specific user
  const sendToUser = (userId, event, data) => {
    const userSocket = activeConnections.get(userId);
    if (userSocket) {
      userSocket.emit(event, data);
      return true;
    }
    return false;
  };

  // Utility function to broadcast to all users in a geographic area
  const broadcastToArea = (lat, lng, radius, event, data) => {
    // This would typically use a geospatial query
    // For now, broadcast to all connected users
    io.emit(event, { ...data, area: { lat, lng, radius } });
  };

  // Export utility functions for use in other parts of the app
  io.sendToUser = sendToUser;
  io.broadcastToArea = broadcastToArea;
  io.getActiveConnections = () => activeConnections;
};

module.exports = socketHandler;