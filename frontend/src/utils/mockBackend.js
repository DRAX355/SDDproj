// A robust "Local Storage" database with Super Admin & Logging capabilities

const MAIN_ADMIN = {
  uid: 'super_admin_001',
  name: 'Main Administrator',
  email: 'super@admin.com',
  password: 'admin', // In a real app, never store passwords like this!
  role: 'main_admin'
};

const INITIAL_DOCTORS = [
  { id: 1, name: "Dr. Sarah Johnson", spec: "Dermatologist", exp: "12 years", loc: "City Skin Clinic", avail: true },
  { id: 2, name: "Dr. Michael Chen", spec: "Oncologist", exp: "18 years", loc: "General Hospital", avail: false },
  { id: 3, name: "Dr. Emily Davis", spec: "Dermatopathologist", exp: "8 years", loc: "Westside Medical", avail: true },
];

// Helper to Log Actions (Audit Trail)
const logAction = (action, actor, details) => {
  const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    action, // e.g., "Added Doctor"
    actorName: actor?.name || 'Unknown',
    actorRole: actor?.role || 'system',
    details // e.g., "Dr. Smith added"
  };
  logs.unshift(newLog);
  localStorage.setItem('system_logs', JSON.stringify(logs));
};

export const mockAuth = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 1. Check Hardcoded Main Admin
    if (email === MAIN_ADMIN.email && password === MAIN_ADMIN.password) {
      localStorage.setItem('currentUser', JSON.stringify(MAIN_ADMIN));
      return MAIN_ADMIN;
    }

    // 2. Check Database Users (Patients & Sub-Admins)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid email or password');
  },

  // Registration (Patients Only via UI, Admins via Internal)
  register: async (details) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (details.role === 'admin' || details.role === 'main_admin') {
      throw new Error('Admin accounts cannot be created publicly.');
    }

    if (users.find(u => u.email === details.email)) {
      throw new Error('User already exists');
    }
    
    const newUser = { 
      uid: Date.now().toString(), 
      ...details,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    logAction('New Registration', newUser, 'Patient joined the platform');
    return newUser;
  },

  // Internal: Main Admin creates Sub-Admin
  createSubAdmin: (adminDetails, creator) => {
    if (creator.role !== 'main_admin') throw new Error("Unauthorized");
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === adminDetails.email)) throw new Error('Email exists');

    const newAdmin = {
      uid: `admin_${Date.now()}`,
      ...adminDetails,
      role: 'admin', // Sub-admin role
      createdAt: new Date().toISOString()
    };

    users.push(newAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    logAction('Staff Created', creator, `Created sub-admin: ${newAdmin.name}`);
    return newAdmin;
  },

  // Internal: Main Admin deletes Sub-Admin
  deleteSubAdmin: (uid, creator) => {
    if (creator.role !== 'main_admin') throw new Error("Unauthorized");
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const target = users.find(u => u.uid === uid);
    users = users.filter(u => u.uid !== uid);
    localStorage.setItem('users', JSON.stringify(users));
    
    if (target) {
        logAction('Staff Deleted', creator, `Removed sub-admin: ${target.name}`);
    }
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const mockDB = {
  // --- LOGS ---
  getSystemLogs: (requestor) => {
    // Only Main Admin can see full system logs
    if (requestor?.role !== 'main_admin') return [];
    return JSON.parse(localStorage.getItem('system_logs') || '[]');
  },

  // --- REPORTS ---
  addReport: async (userId, report) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const key = `reports_${userId}`;
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    reports.unshift(report);
    localStorage.setItem(key, JSON.stringify(reports));
    
    // Log this medical action
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.uid === userId);
    if (user) {
        logAction('AI Scan', user, `Diagnosis: ${report.diagnosis} (${report.confidence}%)`);
    }
  },

  getUserReports: (userId) => {
    return JSON.parse(localStorage.getItem(`reports_${userId}`) || '[]');
  },

  // --- DOCTORS ---
  getDoctors: () => {
    const docs = localStorage.getItem('doctors');
    if (!docs) {
        localStorage.setItem('doctors', JSON.stringify(INITIAL_DOCTORS));
        return INITIAL_DOCTORS;
    }
    return JSON.parse(docs);
  },

  addDoctor: (doctor, actor) => {
    const docs = JSON.parse(localStorage.getItem('doctors') || JSON.stringify(INITIAL_DOCTORS));
    const newDoc = { ...doctor, id: Date.now(), avail: true };
    docs.push(newDoc);
    localStorage.setItem('doctors', JSON.stringify(docs));
    logAction('Doctor Added', actor, `Added Dr. ${doctor.name}`);
    return docs;
  },

  removeDoctor: (id, actor) => {
    let docs = JSON.parse(localStorage.getItem('doctors') || '[]');
    const target = docs.find(d => d.id === id);
    docs = docs.filter(d => d.id !== id);
    localStorage.setItem('doctors', JSON.stringify(docs));
    if (target) logAction('Doctor Removed', actor, `Removed Dr. ${target.name}`);
    return docs;
  },

  // --- APPOINTMENTS ---
  getAppointments: () => {
    return JSON.parse(localStorage.getItem('all_appointments') || '[]');
  },

  bookAppointment: (appointment) => {
    const apps = JSON.parse(localStorage.getItem('all_appointments') || '[]');
    const newApp = { ...appointment, id: Date.now(), status: 'Pending' };
    apps.unshift(newApp);
    localStorage.setItem('all_appointments', JSON.stringify(apps));
    
    // Log implicit action (Patient booking)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const patient = users.find(u => u.uid === appointment.patientId);
    if (patient) {
        logAction('Appointment Booked', patient, `Booked with ${appointment.doctorName} on ${appointment.date}`);
    }
    return newApp;
  },

  updateAppointmentStatus: (id, status, actor) => {
    const apps = JSON.parse(localStorage.getItem('all_appointments') || '[]');
    const updatedApps = apps.map(app => {
        if (app.id === id) {
            logAction('Appointment Update', actor, `Changed status to ${status} for ${app.patientName}`);
            return { ...app, status };
        }
        return app;
    });
    localStorage.setItem('all_appointments', JSON.stringify(updatedApps));
    return updatedApps;
  },
  
  // --- USERS ---
  getAllPatients: () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.role === 'patient');
  },

  getAllAdmins: () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.role === 'admin');
  }
};