export interface ExamNotificationData {
  examName: string;
  examCode: string;
  batchCode: string;
  startTime: string;
  endTime: string;
  unsubscribeUrl: string;
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
}

export function getExamNotificationTemplate(
  data: ExamNotificationData,
): string {
  const formattedStartTime = formatDateTime(data.startTime);
  const formattedEndTime = formatDateTime(data.endTime);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Examina - Exam Notification</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
        <tr>
          <td align="center" style="padding: 20px;">
            
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%;">
              
              <tr>
                <td style="background-color: #1a1a1a; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0; border: 1px solid #2a2a2a;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td>
                              <img src="https://examina.live/imgs/logo.png" alt="Examina Logo" style="width: 120px; height: auto; display: block;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 15px;">
                        <div style="display: inline-block; padding: 8px 16px; background-color: rgba(0, 206, 209, 0.1); border-radius: 20px; border: 1px solid rgba(0, 206, 209, 0.2);">
                          <span style="color: #00CED1; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">🎓 Exam Notification</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">${data.examName}</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="background-color: #1a1a1a; padding: 40px 30px; border-left: 1px solid #2a2a2a; border-right: 1px solid #2a2a2a;">
                  
                  <!-- Exam Code Section -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                    <tr>
                      <td style="background-color: #262626; padding: 20px; border-radius: 12px; border: 1px solid #333333;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td width="50" style="vertical-align: top; padding-right: 15px;">
                              <div style="width: 40px; height: 40px; background-color: rgba(0, 206, 209, 0.15); border-radius: 10px; text-align: center; line-height: 40px;">
                                <span style="font-size: 18px; color: #00CED1;">📝</span>
                              </div>
                            </td>
                            <td style="vertical-align: top;">
                              <div style="color: #9ca3af; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Exam Code</div>
                              <div style="color: #ffffff; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; background-color: #333333; padding: 8px 12px; border-radius: 6px; display: inline-block; border: 1px solid #444444;">${data.examCode}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Schedule Section -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                    <tr>
                      <td>
                        <h3 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                          ⏰ Schedule
                        </h3>
                      </td>
                    </tr>
                  </table>
                  
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td width="48%" style="vertical-align: top; padding-right: 2%;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 12px; padding: 20px; border: 1px solid #333333;">
                          <tr>
                            <td>
                              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div style="width: 32px; height: 32px; background-color: rgba(34, 197, 94, 0.15); border-radius: 8px; text-align: center; line-height: 32px; margin-right: 10px;">
                                  <span style="font-size: 16px;">🚀</span>
                                </div>
                                <div style="color: #22c55e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Start Time</div>
                              </div>
                              <div style="color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4; word-break: break-word;">${formattedStartTime}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                      
                      <!-- End Time -->
                      <td width="48%" style="vertical-align: top; padding-left: 2%;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #262626; border-radius: 12px; padding: 20px; border: 1px solid #333333;">
                          <tr>
                            <td>
                              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div style="width: 32px; height: 32px; background-color: rgba(239, 68, 68, 0.15); border-radius: 8px; text-align: center; line-height: 32px; margin-right: 10px;">
                                  <span style="font-size: 16px;">🏁</span>
                                </div>
                                <div style="color: #ef4444; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">End Time</div>
                              </div>
                              <div style="color: #ffffff; font-size: 14px; font-weight: 600; line-height: 1.4; word-break: break-word;">${formattedEndTime}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Important Notice -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                    <tr>
                      <td style="background: linear-gradient(135deg, rgba(0, 206, 209, 0.1) 0%, rgba(0, 206, 209, 0.05) 100%); padding: 25px; border-radius: 12px; text-align: center; border: 1px solid rgba(0, 206, 209, 0.2);">
                        <div style="margin-bottom: 15px;">
                          <span style="font-size: 32px;">⚡</span>
                        </div>
                        <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">Please join 15 minutes early</p>
                        <p style="color: #9ca3af; font-size: 14px; margin: 0;">Good luck with your exam! 🍀</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="background-color: #00CED1; padding: 14px 28px; border-radius: 8px; text-align: center;">
                              <a href="#" style="color: #000000; text-decoration: none; font-weight: 700; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; display: inline-block;">📅 Add to Calendar</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1a1a1a; text-align: center; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #2a2a2a; border-top: none;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="border-top: 1px solid #333333; padding-top: 25px;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                          If you no longer wish to receive these notifications, 
                          <a href="${data.unsubscribeUrl}" style="color: #00CED1; text-decoration: none; font-weight: 600;">unsubscribe here</a>
                        </p>
                        <p style="color: #6b7280; font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
                          This is an automated message from Examina. Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      
    </body>
    </html>
  `;
}

export function getExamNotificationPlainText(
  data: ExamNotificationData,
): string {
  const formattedStartTime = formatDateTime(data.startTime);
  const formattedEndTime = formatDateTime(data.endTime);

  return `
EXAMINA - EXAM NOTIFICATION
==========================

🎓 ${data.examName}

📝 EXAM DETAILS
---------------
Exam Code: ${data.examCode}

⏰ SCHEDULE
-----------
🚀 Start Time: ${formattedStartTime}
🏁 End Time: ${formattedEndTime}

⚡ IMPORTANT REMINDER
--------------------
Please join 15 minutes early.
Good luck with your exam! 🍀

---
If you no longer wish to receive these notifications, unsubscribe here: ${data.unsubscribeUrl}

This is an automated message from Examina. Please do not reply to this email.
  `.trim();
}
