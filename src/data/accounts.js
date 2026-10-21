// Built-in staff accounts. Only salted PBKDF2 password hashes are stored, never passwords.
// The super admin can change these passwords from My Account, and manage other users
// from Dashboard → Users.
export const BUILT_IN_ACCOUNTS = [
  {
    name: "Fahad Shah",
    username: "fahad shah",
    email: "fahadshah6622@gmail.com",
    role: "superadmin",
    passwordHash: "pbkdf2_sha256$600000$069d3201b89ea8bfb6420c66d67e8817$32484046a5bb003731f9b237e576736a45800410b434027e80d2b05938cf971b",
  },
  {
    name: "Admin",
    username: null,
    email: "kamisofts@gmail.com",
    role: "admin",
    passwordHash: "pbkdf2_sha256$600000$80ea488ad4826ac360b3ae37149a3628$60f3f5939d826759ae20dbce09f3d57401860717303e377f4aa2af63389c5d87",
  },
];

export const ROLE_LABELS = { superadmin: "Super Admin", admin: "Admin", customer: "Customer" };
