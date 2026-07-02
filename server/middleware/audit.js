const AuditLog = require('../models/AuditLog');

const auditLog = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send to capture response
  res.send = function(data) {
    try {
      // ✅ Log only if user is authenticated and method is not GET
      if (req.user && req.method !== 'GET') {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Determine entity type from route
        let entity = 'OTHER';
        if (req.baseUrl.includes('/clients')) entity = 'CLIENT';
        else if (req.baseUrl.includes('/registrations')) entity = 'REGISTRATION';
        else if (req.baseUrl.includes('/contracts')) entity = 'CONTRACT';
        else if (req.baseUrl.includes('/users')) entity = 'USER';

        // Determine action from method
        let action = 'VIEW';
        if (req.method === 'POST') action = 'CREATE';
        else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        else if (req.method === 'DELETE') action = 'DELETE';

        // Get entity name
        let entityName = 'N/A';
        if (parsedData?.name) entityName = parsedData.name;
        else if (parsedData?.email) entityName = parsedData.email;
        else if (req.body?.name) entityName = req.body.name;
        else if (req.body?.email) entityName = req.body.email;

        const logEntry = {
          user: {
            id: req.user.id,
            name: req.user.name || req.user.email,
            email: req.user.email,
            role: req.user.role || 'user'
          },
          action,
          entity,
          entityId: parsedData?._id || req.params?.id || null,
          entityName: typeof entityName === 'string' ? entityName.substring(0, 100) : 'N/A',
          changes: req.method === 'PUT' || req.method === 'PATCH' ? req.body : {},
          ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown'
        };

        // ✅ Save log asynchronously
        AuditLog.create(logEntry)
          .then(() => console.log('✅ Audit log saved:', logEntry.action, logEntry.entity, 'by', logEntry.user.name))
          .catch(err => console.error('❌ Audit log error:', err));
      }
    } catch (error) {
      console.error('❌ Audit log error:', error);
    }
    
    // Call original send
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = auditLog;