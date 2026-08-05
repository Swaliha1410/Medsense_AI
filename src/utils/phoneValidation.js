/**
 * Phone validation utilities using a simple regex pattern
 * For more advanced validation, consider using a library like libphonenumber-js
 */

export const PHONE_PATTERNS = {
  US: /^(\+?1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  INDIA: /^(\+?91)?[-.\s]?([6-9][0-9]{9})$/,
  UK: /^(\+?44)?[-.\s]?(\d{10,11})$/,
  GLOBAL: /^(\+?[1-9]\d{1,14})$/,  // E.164 format
}

export const COUNTRY_CODES = {
  '+1': { name: 'United States', code: 'US' },
  '+91': { name: 'India', code: 'IN' },
  '+44': { name: 'United Kingdom', code: 'UK' },
  '+81': { name: 'Japan', code: 'JP' },
  '+33': { name: 'France', code: 'FR' },
  '+49': { name: 'Germany', code: 'DE' },
  '+39': { name: 'Italy', code: 'IT' },
  '+34': { name: 'Spain', code: 'ES' },
  '+61': { name: 'Australia', code: 'AU' },
  '+64': { name: 'New Zealand', code: 'NZ' },
  '+86': { name: 'China', code: 'CN' },
  '+82': { name: 'South Korea', code: 'KR' },
  '+65': { name: 'Singapore', code: 'SG' },
  '+60': { name: 'Malaysia', code: 'MY' },
  '+62': { name: 'Indonesia', code: 'ID' },
  '+66': { name: 'Thailand', code: 'TH' },
  '+84': { name: 'Vietnam', code: 'VN' },
  '+1': { name: 'Canada', code: 'CA' },
  '+55': { name: 'Brazil', code: 'BR' },
  '+52': { name: 'Mexico', code: 'MX' },
}

/**
 * Extract country from phone number
 */
export const detectCountryFromPhone = (phone) => {
  if (!phone) return null

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-().]/g, '')

  // Check for country code prefix
  for (const [code, info] of Object.entries(COUNTRY_CODES)) {
    if (cleaned.startsWith(code)) {
      return info.name
    }
  }

  // Default patterns
  if (PHONE_PATTERNS.GLOBAL.test(cleaned)) {
    return 'International'
  }

  return null
}

/**
 * Validate phone number format
 */
export const validatePhoneFormat = (phone) => {
  if (!phone) return { valid: true, message: '' }  // Optional field

  const cleaned = phone.replace(/[\s\-().]/g, '')

  // Check E.164 format
  if (PHONE_PATTERNS.GLOBAL.test(phone)) {
    return { valid: true, message: '' }
  }

  // Check common patterns
  if (PHONE_PATTERNS.US.test(phone) || PHONE_PATTERNS.INDIA.test(phone) || PHONE_PATTERNS.UK.test(phone)) {
    return { valid: true, message: '' }
  }

  // Basic length check (most valid numbers are 10-15 digits)
  const digitCount = cleaned.replace(/\D/g, '').length
  if (digitCount < 10 || digitCount > 15) {
    return { valid: false, message: 'Phone number must be between 10-15 digits' }
  }

  return { valid: true, message: '' }
}
