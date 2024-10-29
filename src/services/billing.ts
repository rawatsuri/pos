import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import type { Order } from '../store/order';
import type { Branch } from '../store/branch';

interface BillOptions {
  includeLogo?: boolean;
  includeQR?: boolean;
  language?: string;
  currency?: string;
  taxRate?: number;
  sendTo?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

export class BillingService {
  private static instance: BillingService;
  private readonly defaultOptions: Required<BillOptions> = {
    includeLogo: true,
    includeQR: true,
    language: 'en',
    currency: 'INR',
    taxRate: 18, // Default GST rate
    sendTo: {
      email: '',
      phone: '',
      whatsapp: ''
    }
  };

  private constructor() {}

  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  async generateBill(order: Order, branch: Branch, options: BillOptions = {}): Promise<Blob> {
    const opts = { ...this.defaultOptions, ...options };
    const doc = new jsPDF();

    // Add logo if requested
    if (opts.includeLogo) {
      // Add your logo here
      // doc.addImage(logoBase64, 'PNG', 10, 10, 50, 50);
    }

    // Add header information
    doc.setFontSize(20);
    doc.text(branch.name, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(branch.address, 105, 30, { align: 'center' });
    doc.text(branch.phone, 105, 35, { align: 'center' });

    // Add bill details
    doc.setFontSize(12);
    doc.text(`Bill No: ${order.id}`, 15, 50);
    doc.text(`Date: ${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}`, 15, 55);
    doc.text(`Table: ${order.tableNumber}`, 15, 60);

    // Add items table
    const tableData = order.items.map(item => [
      item.name,
      item.quantity.toString(),
      `${opts.currency} ${item.price.toFixed(2)}`,
      `${opts.currency} ${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (opts.taxRate / 100);
    const total = subtotal + tax;

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${opts.currency} ${subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Tax (${opts.taxRate}%): ${opts.currency} ${tax.toFixed(2)}`, 140, finalY + 5);
    doc.text(`Total: ${opts.currency} ${total.toFixed(2)}`, 140, finalY + 10);

    // Add QR code if requested
    if (opts.includeQR) {
      const qrData = JSON.stringify({
        orderId: order.id,
        total: total,
        date: order.createdAt,
        branch: branch.name
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      doc.addImage(qrCodeDataUrl, 'PNG', 15, finalY, 30, 30);
    }

    // Add footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    return doc.output('blob');
  }

  async sendBill(billBlob: Blob, options: BillOptions): Promise<void> {
    const { sendTo } = options;

    if (sendTo?.email) {
      await this.sendViaEmail(billBlob, sendTo.email);
    }

    if (sendTo?.whatsapp) {
      await this.sendViaWhatsApp(billBlob, sendTo.whatsapp);
    }

    if (sendTo?.phone) {
      await this.sendViaSMS(billBlob, sendTo.phone);
    }
  }

  private async sendViaEmail(billBlob: Blob, email: string): Promise<void> {
    // Implement email sending logic
    const formData = new FormData();
    formData.append('bill', billBlob, 'bill.pdf');
    formData.append('email', email);

    try {
      const response = await fetch('/api/bills/send-email', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending bill via email:', error);
      throw error;
    }
  }

  private async sendViaWhatsApp(billBlob: Blob, phone: string): Promise<void> {
    // Implement WhatsApp sending logic
    const formData = new FormData();
    formData.append('bill', billBlob, 'bill.pdf');
    formData.append('phone', phone);

    try {
      const response = await fetch('/api/bills/send-whatsapp', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('Error sending bill via WhatsApp:', error);
      throw error;
    }
  }

  private async sendViaSMS(billBlob: Blob, phone: string): Promise<void> {
    // Implement SMS sending logic
    // Note: SMS might only include a link to download the bill
    try {
      const response = await fetch('/api/bills/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending bill via SMS:', error);
      throw error;
    }
  }
}

export const billingService = BillingService.getInstance();