// Simple user management service using localStorage
const USERS_KEY = 'kpl_auction_users';
const CURRENT_USER_KEY = 'kpl_auction_current_user';

// Admin credentials
const ADMIN_EMAIL = 'kplauction123@gmail.com';
const ADMIN_PASSWORD = 'kplauction@123';

// Default regular user credentials
const USER_EMAIL = 'kpl@gmail.com';
const USER_PASSWORD = 'kpl@123';

class UserService {
  constructor() {
    this.initializeDefaults();
  }

  // Initialize default admin and a sample user account
  initializeDefaults() {
    const users = this.getUsers();

    const adminExists = users.find(user => user.email === ADMIN_EMAIL);
    if (!adminExists) {
      const adminUser = {
        id: 'admin-001',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        name: 'Admin',
        createdAt: new Date().toISOString()
      };
      users.push(adminUser);
    }

    const sampleUserExists = users.find(user => user.email === USER_EMAIL);
    if (!sampleUserExists) {
      const sampleUser = {
        id: 'user-001',
        email: USER_EMAIL,
        password: USER_PASSWORD,
        role: 'user',
        name: 'User',
        createdAt: new Date().toISOString(),
      };
      users.push(sampleUser);
    }

    this.saveUsers(users);
  }

  // Get all users from localStorage
  getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Register new user
  registerUser(email, password, name) {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate password
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      role: 'user',
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  // Login user
  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Store current user
    const userToStore = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    return userToStore;
  }

  // Get current logged in user
  getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Logout user
  logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // Check if user is admin
  isAdmin(user = null) {
    const currentUser = user || this.getCurrentUser();
    return currentUser && currentUser.role === 'admin';
  }

  // Check if user is regular user
  isUser(user = null) {
    const currentUser = user || this.getCurrentUser();
    return currentUser && currentUser.role === 'user';
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get all registered users (admin only)
  getAllUsers() {
    const currentUser = this.getCurrentUser();
    if (!this.isAdmin(currentUser)) {
      throw new Error('Access denied: Admin privileges required');
    }
    return this.getUsers().map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt
    }));
  }
}

export default new UserService();