import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces from app password
      }
    });
  }

  /**
   * Send daily report with generated ideas
   */
  async sendDailyReport(reportData) {
    const { date, ideas, searchUsedToday, remainingSearches, trendKeywords, collabSuggestion, monetizationAngle } = reportData;

    const emailBody = this.formatEmailBody(reportData);
    const subject = `🚀 Daily Viral Ideas - ${new Date(date).toLocaleDateString('en-IN')}`;

    try {
      const info = await this.transporter.sendMail({
        from: `"Viral Student Agent 🎯" <${process.env.GMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        html: emailBody,
        attachments: [
          {
            filename: `viral-ideas-${date}.txt`,
            content: this.formatReadableText(reportData),
            contentType: 'text/plain; charset=utf-8'
          },
          {
            filename: `ideas-${date}.json`,
            content: JSON.stringify(reportData, null, 2),
            contentType: 'application/json'
          }
        ]
      });

      console.log('✅ Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }
  }

  /**
   * Format email body with HTML styling
   */
  formatEmailBody(data) {
    const { date, ideas, searchUsedToday, remainingSearches, trendKeywords } = data;

    let ideasHtml = ideas.map((idea, index) => `
      <div style="background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #4CAF50;">
        <h3 style="color: #2c3e50; margin-top: 0;">💡 Idea ${index + 1}: ${idea.format}</h3>
        
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong style="color: #e74c3c;">🎯 Hook:</strong>
          <p style="font-size: 16px; color: #34495e; margin: 5px 0;">${idea.hook}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong style="color: #3498db;">📝 Script (30-45 sec):</strong>
          <p style="font-size: 14px; color: #555; margin: 5px 0; line-height: 1.6;">${idea.script}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong style="color: #9b59b6;">📸 Caption:</strong>
          <p style="font-size: 14px; color: #555; margin: 5px 0;">${idea.caption}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong style="color: #16a085;">#️⃣ Hashtags:</strong>
          <p style="font-size: 13px; color: #3498db; margin: 5px 0;">${idea.hashtags.join(' ')}</p>
        </div>

        <div style="display: flex; gap: 20px; margin: 10px 0;">
          <div style="flex: 1; background: white; padding: 10px; border-radius: 5px;">
            <strong>🎬 Format:</strong> ${idea.format}
          </div>
          <div style="flex: 1; background: white; padding: 10px; border-radius: 5px;">
            <strong>💥 Trigger:</strong> ${idea.emotionalTrigger}
          </div>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <strong style="color: #e67e22;">👉 CTA:</strong> ${idea.cta}
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #ffc107;">
          <strong style="color: #856404;">🔥 Why This Will Go Viral:</strong>
          <p style="margin: 5px 0; color: #856404;">${idea.viralReasoning}</p>
        </div>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
  </style>
</head>
<body style="background: #ecf0f1; padding: 20px;">
  <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <h1 style="color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 15px;">
      🎯 Daily Viral Reel Ideas
    </h1>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <h2 style="margin-top: 0;">📊 Today's Summary</h2>
      <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>🔍 Search Used:</strong> ${searchUsedToday ? 'Yes ✅' : 'No (Reused trends) ♻️'}</p>
      <p><strong>💳 Remaining Searches:</strong> ${remainingSearches}/100</p>
      <p><strong>🎯 Trend Keywords:</strong> ${trendKeywords.join(', ')}</p>
    </div>

    <h2 style="color: #2c3e50; margin-top: 30px;">🚀 Today's 5 Viral Ideas</h2>
    ${ideasHtml}

    ${data.collabSuggestion ? `
    <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
      <h3 style="color: #2e7d32; margin-top: 0;">🤝 Collaboration Suggestion</h3>
      <p style="color: #1b5e20; font-size: 15px;">${data.collabSuggestion}</p>
    </div>
    ` : ''}

    ${data.monetizationAngle ? `
    <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff9800;">
      <h3 style="color: #e65100; margin-top: 0;">💰 Monetization Angle</h3>
      <p style="color: #bf360c; font-size: 15px;">${data.monetizationAngle}</p>
    </div>
    ` : ''}

    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 30px; text-align: center;">
      <p style="color: #666; margin: 0;">
        <strong>⏰ Best Posting Time:</strong> ${data.bestPostingTime || '7:00 PM - 9:00 PM IST'}
      </p>
      <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
        Generated by Viral Student AI Agent 🤖
      </p>
    </div>

  </div>
</body>
</html>
    `;
  }

  /**
   * Format data as readable text file for phones
   */
  formatReadableText(data) {
    const { date, ideas, searchUsedToday, remainingSearches, trendKeywords } = data;

    let text = `🎯 VIRAL STUDENT REEL IDEAS\n`;
    text += `📅 Date: ${new Date(date).toLocaleDateString('en-IN')}\n`;
    text += `🔍 Search Used: ${searchUsedToday ? 'Yes' : 'No (Reused)'}\n`;
    text += `💳 Remaining Searches: ${remainingSearches}/100\n`;
    text += `🎯 Keywords: ${trendKeywords.join(', ')}\n`;
    text += `\n${'='.repeat(60)}\n\n`;

    ideas.forEach((idea, index) => {
      text += `💡 IDEA ${index + 1}: ${idea.format}\n`;
      text += `${'─'.repeat(60)}\n\n`;

      text += `🎯 HOOK:\n${idea.hook}\n\n`;

      text += `📝 SCRIPT (30-45 sec):\n${idea.script}\n\n`;

      text += `📸 CAPTION:\n${idea.caption}\n\n`;

      text += `#️⃣ HASHTAGS:\n${idea.hashtags.join(' ')}\n\n`;

      text += `🎬 FORMAT: ${idea.format}\n`;
      text += `💥 EMOTIONAL TRIGGER: ${idea.emotionalTrigger}\n\n`;

      text += `👉 CTA: ${idea.cta}\n\n`;

      text += `🔥 WHY THIS WILL GO VIRAL:\n${idea.viralReasoning}\n`;

      text += `\n${'='.repeat(60)}\n\n`;
    });

    if (data.collabSuggestion) {
      text += `🤝 COLLABORATION SUGGESTION:\n${data.collabSuggestion}\n\n`;
    }

    if (data.monetizationAngle) {
      text += `💰 MONETIZATION ANGLE:\n${data.monetizationAngle}\n\n`;
    }

    text += `⏰ BEST POSTING TIME: ${data.bestPostingTime || '7:00 PM - 9:00 PM IST'}\n\n`;
    text += `Generated by Viral Student AI Agent 🤖\n`;

    return text;
  }
}

export default new EmailService();
