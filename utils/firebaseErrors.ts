export const mapFirebaseError = (error: any): string => {
  const code = error?.code || "";
  
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "Incorrect email or password.";
    case 'auth/email-already-in-use':
      return "An account with this email already exists.";
    case 'auth/invalid-email':
      return "The email address is improperly formatted.";
    case 'auth/weak-password':
      return "The password is too weak. Please use a stronger password.";
    case 'auth/network-request-failed':
      return "Please check your internet connection.";
    case 'auth/too-many-requests':
      return "Too many failed login attempts. Please wait a few minutes and try again.";
    case 'auth/user-disabled':
      return "This account has been disabled by an administrator.";
    case 'auth/operation-not-allowed':
      return "This authentication method is currently disabled.";
    case 'auth/popup-closed-by-user':
      return "The login popup was closed before completing.";
    default:
      return error?.message || "An unexpected authentication error occurred. Please try again.";
  }
};
