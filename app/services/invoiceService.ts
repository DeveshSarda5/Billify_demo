/**
 * PDF Invoice generation and sharing service
 * Uses expo-print (already installed) and expo-sharing (if available)
 */

import * as Print from 'expo-print';
import { Alert } from 'react-native';

// Try to import expo-sharing, but make it optional
let Sharing: any = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.warn('expo-sharing not installed. PDF sharing will be limited.');
}

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceData {
  billDate: string;
  storeName: string;
  items: InvoiceItem[];
  total: number;
  billId?: string;
  userName?: string;
  userPhone?: string;
}

/**
 * Generate HTML for invoice PDF
 */
const generateInvoiceHTML = (data: InvoiceData): string => {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="text-align: left; padding: 8px;">${item.name}</td>
      <td style="text-align: center; padding: 8px;">${item.quantity}</td>
      <td style="text-align: right; padding: 8px;">₹${item.price}</td>
      <td style="text-align: right; padding: 8px;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const grandTotal = subtotal + tax;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #4caf50;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo-section h1 {
            color: #4caf50;
            margin: 0 0 8px 0;
            font-size: 28px;
          }
          .logo-section p {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
          }
          .invoice-info {
            text-align: right;
          }
          .invoice-info p {
            margin: 4px 0;
            font-size: 12px;
            color: #4b5563;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
            padding: 16px;
            background-color: #f3f4f6;
            border-radius: 6px;
          }
          .info-section h3 {
            font-size: 12px;
            color: #6b7280;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .info-section p {
            margin: 4px 0;
            font-size: 12px;
            color: #1f2937;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          table thead {
            background-color: #f3f4f6;
          }
          table th {
            font-weight: 600;
            font-size: 12px;
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          table td {
            font-size: 12px;
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 8px;
          }
          .summary {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-top: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            width: 200px;
            font-size: 12px;
            margin: 4px 0;
          }
          .summary-row .label {
            color: #6b7280;
          }
          .summary-row .value {
            font-weight: 600;
            color: #1f2937;
          }
          .total-row {
            border-top: 2px solid #4caf50;
            padding-top: 8px;
            margin-top: 12px;
            font-size: 14px;
            font-weight: bold;
            color: #4caf50;
          }
          .footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <h1>Billify</h1>
              <p>Easy Shopping, Smart Checkout</p>
            </div>
            <div class="invoice-info">
              <p><strong>Store:</strong> ${data.storeName}</p>
              <p><strong>Date:</strong> ${data.billDate}</p>
              ${data.billId ? `<p><strong>Bill ID:</strong> ${data.billId}</p>` : ''}
            </div>
          </div>

          <div class="info-section">
            <div>
              <h3>Bill To</h3>
              <p>${data.userName || 'Customer'}</p>
              <p>${data.userPhone || 'N/A'}</p>
            </div>
            <div>
              <h3>Payment Status</h3>
              <p>✓ Completed</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span class="label">Subtotal:</span>
              <span class="value">₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="label">Tax (5%):</span>
              <span class="value">₹${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span style="color: #4caf50;">Grand Total:</span>
              <span style="color: #4caf50;">₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Billify - Making shopping smarter</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate and save PDF invoice
 */
export const generateInvoicePDF = async (data: InvoiceData): Promise<string | null> => {
  try {
    const html = generateInvoiceHTML(data);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate invoice PDF');
    return null;
  }
};

/**
 * Download PDF invoice
 */
export const downloadInvoicePDF = async (data: InvoiceData): Promise<void> => {
  try {
    const pdfUri = await generateInvoicePDF(data);
    if (!pdfUri) return;

    if (!Sharing) {
      Alert.alert('Info', 'PDF generated. Sharing feature not available.');
      return;
    }

    // Save the PDF
    // On native, we can share it
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Invoice - ${data.storeName}`,
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    Alert.alert('Error', 'Failed to download invoice');
  }
};

/**
 * Share PDF invoice
 */
export const shareInvoicePDF = async (data: InvoiceData): Promise<void> => {
  try {
    const pdfUri = await generateInvoicePDF(data);
    if (!pdfUri) return;

    if (!Sharing) {
      Alert.alert('Info', 'Sharing feature not available. Please install expo-sharing.');
      return;
    }

    // Share the PDF
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share Invoice - ${data.storeName}`,
      UTI: 'com.adobe.pdf',
    });

    Alert.alert('Success', 'Invoice shared successfully');
  } catch (error) {
    console.error('Error sharing invoice:', error);
    Alert.alert('Error', 'Failed to share invoice');
  }
};
