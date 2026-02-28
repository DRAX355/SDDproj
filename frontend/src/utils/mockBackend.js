// ==========================================
// 1. INDEXED-DB & IN-MEMORY CACHE
// Solves the 5MB LocalStorage limit while keeping React synchronous!
// ==========================================

const imageCache = {}; // Holds images in memory for instant synchronous access

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DermaDetectImagesDB", 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
};

// Pre-load all images into memory on startup so the UI doesn't have to wait
const preloadCache = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction("images", "readonly");
    const req = tx.objectStore("images").getAll();
    req.onsuccess = () => {
      if (req.result) {
        req.result.forEach(row => {
          imageCache[row.id] = row.data;
        });
      }
    };
  } catch(e) { console.error("Cache pre-load error:", e); }
};
preloadCache();

export const localImageDB = {
  saveImage: async (id, base64Data) => {
    try {
      imageCache[id.toString()] = base64Data; // Sync instantly to cache for immediate rendering
      const db = await initDB();
      return new Promise((resolve) => {
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").put({ id: id.toString(), data: base64Data });
        tx.oncomplete = () => resolve(true);
      });
    } catch(e) { console.error("IndexedDB Save Error:", e); }
  },
  getImage: (id) => {
    return imageCache[id.toString()] || null;
  }
};

// ==========================================
// 2. TEXT DATABASE & AUTH (LocalStorage)
// ==========================================

const MAIN_ADMIN = {
  uid: 'super_admin_001',
  name: 'Main Administrator',
  email: 'super@admin.com',
  password: 'admin', // In a real app, never store passwords like this!
  role: 'main_admin'
};

// Helper to Log Actions (Audit Trail)
const logAction = (action, actor, details) => {
  const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    action, 
    actorName: actor?.name || 'Unknown',
    actorRole: actor?.role || 'system',
    details 
  };
  logs.unshift(newLog);
  localStorage.setItem('system_logs', JSON.stringify(logs));
};

export const mockAuth = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === MAIN_ADMIN.email && password === MAIN_ADMIN.password) {
      localStorage.setItem('currentUser', JSON.stringify(MAIN_ADMIN));
      return MAIN_ADMIN;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid email or password');
  },

  register: async (details) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (details.role === 'admin' || details.role === 'main_admin') {
      throw new Error('Admin accounts cannot be created publicly.');
    }

    if (users.find(u => u.email === details.email)) {
      throw new Error('User already exists with this email address');
    }
    
    const newUser = { 
      uid: Date.now().toString(), 
      ...details,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    logAction('New Registration', newUser, `${details.role === 'student' ? 'Student' : 'Patient'} joined the platform`);
    return newUser;
  },

  createSubAdmin: (adminDetails, creator) => {
    if (creator.role !== 'main_admin') throw new Error("Unauthorized");
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === adminDetails.email)) throw new Error('Email exists');

    const newAdmin = {
      uid: `admin_${Date.now()}`,
      ...adminDetails,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    users.push(newAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    logAction('Staff Created', creator, `Created sub-admin: ${newAdmin.name}`);
    return newAdmin;
  },

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
  getSystemLogs: (requestor) => {
    if (requestor?.role !== 'main_admin') return [];
    return JSON.parse(localStorage.getItem('system_logs') || '[]');
  },

  // --- REPORTS WITH AUTO IMAGE STRIPPING ---
  addReport: async (userId, report) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 1. Clone the report so we don't accidentally mutate the React state
    const reportToSave = { ...report };

    // 2. Intercept the massive Base64 Image string
    if (reportToSave.imageUrl) {
        // Save the heavy image to the unrestricted IndexedDB
        await localImageDB.saveImage(reportToSave.id, reportToSave.imageUrl);
        reportToSave.imageId = reportToSave.id; // Keep a lightweight pointer
        delete reportToSave.imageUrl; // DELETING THIS PREVENTS LOCAL STORAGE CRASHES!
    }

    // 3. Save the now-lightweight text report to Local Storage
    const key = `reports_${userId}`;
    const reports = JSON.parse(localStorage.getItem(key) || '[]');
    reports.unshift(reportToSave);
    localStorage.setItem(key, JSON.stringify(reports));
    
    // Log this medical action
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.uid === userId);
    if (user) {
        logAction('AI Scan', user, `Diagnosis: ${reportToSave.diagnosis} (${reportToSave.confidence}%)`);
    }
  },

  getUserReports: (userId) => {
    const reports = JSON.parse(localStorage.getItem(`reports_${userId}`) || '[]');
    
    // Instantly stitch the images back together from our RAM cache
    return reports.map(r => {
        if (r.imageId && imageCache[r.imageId]) {
            r.imageUrl = imageCache[r.imageId];
        }
        return r;
    });
  },
  
  // --- USERS ---
  
  // Gets both Patients and Students for the Admin Dashboard
  getAllUsers: () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.role === 'patient' || u.role === 'student');
  },

  // Kept specifically for the Student Dashboard filtering logic
  getAllPatients: () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.role === 'patient');
  },

  // Gets Sub-Admins for the Admin Dashboard Staff tab
  getAllAdmins: () => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.role === 'admin');
  }
};