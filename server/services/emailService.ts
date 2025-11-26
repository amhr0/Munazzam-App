import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

/**
 * Email Service - خدمة إرسال البريد الإلكتروني
 * 
 * يستخدم Gmail SMTP لإرسال رسائل استعادة كلمة المرور
 */

// إنشاء transporter باستخدام Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // البريد الإلكتروني للمرسل
    pass: process.env.GMAIL_APP_PASSWORD, // App Password من Google
  },
});

/**
 * إرسال رسالة إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.VITE_FRONTEND_URL || 'https://munazzam.sas-nex.com'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"منظم - Munazzam" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'إعادة تعيين كلمة المرور - منظم',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .message {
              color: #666;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .warning {
              background: #fff3cd;
              border-right: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .link {
              color: #667eea;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 منظم - Munazzam</h1>
            </div>
            <div class="content">
              <div class="greeting">
                مرحباً ${userName || 'عزيزي المستخدم'} 👋
              </div>
              <div class="message">
                <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منظم.</p>
                <p>للمتابعة، يرجى النقر على الزر أدناه:</p>
              </div>
              
              <center>
                <a href="${resetUrl}" class="button">
                  إعادة تعيين كلمة المرور
                </a>
              </center>
              
              <div class="warning">
                <strong>⚠️ تنبيه أمني:</strong>
                <ul>
                  <li>هذا الرابط صالح لمدة ساعة واحدة فقط</li>
                  <li>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة</li>
                  <li>لا تشارك هذا الرابط مع أي شخص</li>
                </ul>
              </div>
              
              <div class="message">
                <p>أو يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
                <p class="link">${resetUrl}</p>
              </div>
            </div>
            <div class="footer">
              <p>هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
              <p>© ${new Date().getFullYear()} منظم - Munazzam. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send password reset email:', error);
    return false;
  }
}

/**
 * اختبار اتصال SMTP
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[EmailService] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EmailService] SMTP connection failed:', error);
    return false;
  }
}
