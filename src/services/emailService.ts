import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_u25vulc',
  templateId: 'template_k3jvli8',
  publicKey: '4S229zBwfW7pedtoD'
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

export interface StockNotificationEmailData {
  email: string;
  to_name: string;
  product_name: string;
  product_image: string;
  product_price: number;
  product_url: string;
  company_name: string;
  unsubscribe_url: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send stock availability notification email
 */
export const sendStockAvailabilityEmail = async (
  emailData: StockNotificationEmailData
): Promise<EmailResult> => {
  try {
    const templateParams = {
      email: emailData.email,
      to_name: emailData.to_name,
      product_name: emailData.product_name,
      product_image: emailData.product_image,
      product_price: emailData.product_price,
      product_url: emailData.product_url,
      company_name: emailData.company_name,
      unsubscribe_url: emailData.unsubscribe_url,
      // Additional template variables
      current_year: new Date().getFullYear(),
      notification_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    
    return {
      success: true,
      messageId: response.text
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Send bulk stock availability notifications
 */
export const sendBulkStockNotifications = async (
  notifications: StockNotificationEmailData[]
): Promise<{ success: number; failed: number; errors: string[] }> => {
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // Process emails in batches to avoid rate limiting
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < notifications.length; i += batchSize) {
    batches.push(notifications.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async (notification) => {
      const result = await sendStockAvailabilityEmail(notification);
      
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        errors.push(`Failed to send to ${notification.to_email}: ${result.error}`);
      }
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    await Promise.all(promises);
    
    // Add delay between batches
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    errors
  };
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<EmailResult> => {
  const testData: StockNotificationEmailData = {
    email: 'test@example.com',
    to_name: 'Test User',
    product_name: 'Test Product',
    product_image: 'https://via.placeholder.com/300x300',
    product_price: 29.99,
    product_url: 'https://example.com/product/test',
    company_name: 'Best Brightness',
    unsubscribe_url: 'https://example.com/unsubscribe'
  };

  return await sendStockAvailabilityEmail(testData);
};
