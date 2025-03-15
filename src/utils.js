// Function to generate unique IDs based on timestamp with class prefix
export const generateUniqueId = (className = '') => {
  // Get current timestamp
  const timestamp = Date.now();
  // Convert to string and take last 8 digits
  // If timestamp is less than 8 digits, pad with zeros
  const numericId = timestamp.toString().slice(-8).padStart(8, '0');
  
  // Generate a 3-character prefix from the className
  let prefix = '';
  if (className && className.length > 0) {
    // Take first 3 chars, or pad if shorter
    prefix = className.substring(0, 3).toLowerCase().padEnd(3, 'x');
  }
  
  // Return prefixed ID in format: xxx-12345678
  return prefix ? `${prefix}-${numericId}` : numericId;
}; 