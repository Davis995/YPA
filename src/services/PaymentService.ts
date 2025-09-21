// Payment Gateway Integration Service
// This service handles payments for MTN Mobile Money, Airtel Money, and Cash

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber?: string;
  paymentMethod: 'cash' | 'mtn_momo' | 'airtel_money';
  orderId: string;
  customerName: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
}

class PaymentService {
  private readonly MTN_API_BASE = 'https://sandbox.momodeveloper.mtn.com'; // Use sandbox for testing
  private readonly AIRTEL_API_BASE = 'https://openapiuat.airtel.africa'; // Use UAT for testing
  
  // Mock API keys (in production, these should be in environment variables)
  private readonly MTN_API_KEY = import.meta.env.VITE_MTN_API_KEY || 'mock_mtn_key';
  private readonly MTN_API_SECRET = import.meta.env.VITE_MTN_API_SECRET || 'mock_mtn_secret';
  private readonly AIRTEL_CLIENT_ID = import.meta.env.VITE_AIRTEL_CLIENT_ID || 'mock_airtel_id';
  private readonly AIRTEL_CLIENT_SECRET = import.meta.env.VITE_AIRTEL_CLIENT_SECRET || 'mock_airtel_secret';

  /**
   * Process payment based on the selected method
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    console.log('Processing payment:', paymentRequest);

    switch (paymentRequest.paymentMethod) {
      case 'cash':
        return this.processCashPayment(paymentRequest);
      case 'mtn_momo':
        return this.processMTNMoMoPayment(paymentRequest);
      case 'airtel_money':
        return this.processAirtelMoneyPayment(paymentRequest);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  /**
   * Process cash payment (no actual payment processing needed)
   */
  private async processCashPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // Simulate processing delay
    await this.delay(1000);

    return {
      success: true,
      transactionId: `CASH_${Date.now()}`,
      message: 'Cash payment accepted. Please pay when your order arrives.',
      status: 'completed',
      paymentMethod: 'cash'
    };
  }

  /**
   * Process MTN Mobile Money payment
   */
  private async processMTNMoMoPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would:
      // 1. Get access token
      // 2. Make payment request
      // 3. Poll for payment status
      
      // For now, we'll simulate the process
      console.log('Processing MTN MoMo payment...');
      
      // Simulate API delay
      await this.delay(2000);
      
      // Mock payment processing with 90% success rate
      const isSuccessful = Math.random() > 0.1;
      
      if (isSuccessful) {
        return {
          success: true,
          transactionId: `MTN_${Date.now()}`,
          message: 'Payment successful via MTN Mobile Money',
          status: 'completed',
          paymentMethod: 'mtn_momo'
        };
      } else {
        return {
          success: false,
          message: 'Payment failed. Please check your MTN Mobile Money balance and try again.',
          status: 'failed',
          paymentMethod: 'mtn_momo'
        };
      }
    } catch (error) {
      console.error('MTN MoMo payment error:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        paymentMethod: 'mtn_momo'
      };
    }
  }

  /**
   * Process Airtel Money payment
   */
  private async processAirtelMoneyPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Processing Airtel Money payment...');
      
      // Simulate API delay
      await this.delay(2500);
      
      // Mock payment processing with 85% success rate
      const isSuccessful = Math.random() > 0.15;
      
      if (isSuccessful) {
        return {
          success: true,
          transactionId: `AIRTEL_${Date.now()}`,
          message: 'Payment successful via Airtel Money',
          status: 'completed',
          paymentMethod: 'airtel_money'
        };
      } else {
        return {
          success: false,
          message: 'Payment failed. Please check your Airtel Money balance and try again.',
          status: 'failed',
          paymentMethod: 'airtel_money'
        };
      }
    } catch (error) {
      console.error('Airtel Money payment error:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        paymentMethod: 'airtel_money'
      };
    }
  }

  /**
   * Real MTN MoMo integration (commented out - requires actual API credentials)
   */
  /*
  private async processMTNMoMoPaymentReal(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Step 1: Get access token
      const tokenResponse = await fetch(`${this.MTN_API_BASE}/collection/token/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.MTN_API_KEY}:${this.MTN_API_SECRET}`)}`,
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.MTN_API_KEY
        }
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Step 2: Request payment
      const paymentResponse = await fetch(`${this.MTN_API_BASE}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.MTN_API_KEY,
          'X-Reference-Id': paymentRequest.orderId,
          'X-Target-Environment': 'sandbox'
        },
        body: JSON.stringify({
          amount: paymentRequest.amount.toString(),
          currency: paymentRequest.currency,
          externalId: paymentRequest.orderId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: paymentRequest.phoneNumber
          },
          payerMessage: paymentRequest.description,
          payeeNote: `Payment for order ${paymentRequest.orderId}`
        })
      });

      if (paymentResponse.ok) {
        // Step 3: Poll for payment status
        return await this.pollMTNPaymentStatus(paymentRequest.orderId, accessToken);
      } else {
        throw new Error('Payment request failed');
      }
    } catch (error) {
      console.error('MTN MoMo payment error:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed',
        paymentMethod: 'mtn_momo'
      };
    }
  }

  private async pollMTNPaymentStatus(referenceId: string, accessToken: string): Promise<PaymentResponse> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`${this.MTN_API_BASE}/collection/v1_0/requesttopay/${referenceId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Ocp-Apim-Subscription-Key': this.MTN_API_KEY,
            'X-Target-Environment': 'sandbox'
          }
        });

        const statusData = await statusResponse.json();

        switch (statusData.status) {
          case 'SUCCESSFUL':
            return {
              success: true,
              transactionId: statusData.financialTransactionId,
              message: 'Payment successful via MTN Mobile Money',
              status: 'completed',
              paymentMethod: 'mtn_momo'
            };
          case 'FAILED':
            return {
              success: false,
              message: 'Payment failed. Please try again.',
              status: 'failed',
              paymentMethod: 'mtn_momo'
            };
          case 'PENDING':
            // Continue polling
            await this.delay(3000);
            attempts++;
            break;
          default:
            throw new Error(`Unknown status: ${statusData.status}`);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        attempts++;
        await this.delay(3000);
      }
    }

    return {
      success: false,
      message: 'Payment timeout. Please check your phone for payment prompt.',
      status: 'failed',
      paymentMethod: 'mtn_momo'
    };
  }
  */

  /**
   * Validate phone number format for mobile money
   */
  validatePhoneNumber(phoneNumber: string, country: string = 'UG'): boolean {
    // Uganda phone number validation
    if (country === 'UG') {
      // MTN: 077, 078, 076
      // Airtel: 075, 070, 074
      const ugandaPattern = /^(256)?(77|78|76|75|70|74)[0-9]{7}$/;
      return ugandaPattern.test(phoneNumber.replace(/\s+/g, ''));
    }
    
    return false;
  }

  /**
   * Get payment method from phone number
   */
  detectPaymentMethodFromPhone(phoneNumber: string): 'mtn_momo' | 'airtel_money' | null {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    // MTN prefixes
    if (/^(256)?(77|78|76)/.test(cleanPhone)) {
      return 'mtn_momo';
    }
    
    // Airtel prefixes
    if (/^(256)?(75|70|74)/.test(cleanPhone)) {
      return 'airtel_money';
    }
    
    return null;
  }

  /**
   * Format phone number for API calls
   */
  formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\s+/g, '');
    
    // Add country code if missing
    if (!cleaned.startsWith('256')) {
      if (cleaned.startsWith('0')) {
        cleaned = '256' + cleaned.substring(1);
      } else {
        cleaned = '256' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string, paymentMethod: string): Promise<PaymentResponse> {
    // Mock implementation - in real app, this would query the actual payment provider
    await this.delay(1000);
    
    return {
      success: true,
      transactionId,
      message: 'Payment completed successfully',
      status: 'completed',
      paymentMethod
    };
  }

  /**
   * Utility function to simulate async delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: 'cash',
        name: 'Cash on Delivery',
        description: 'Pay with cash when your order arrives'
      },
      {
        id: 'mtn_momo',
        name: 'MTN Mobile Money',
        description: 'Pay with MTN Mobile Money (077, 078, 076)'
      },
      {
        id: 'airtel_money',
        name: 'Airtel Money',
        description: 'Pay with Airtel Money (075, 070, 074)'
      }
    ];
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default PaymentService;
