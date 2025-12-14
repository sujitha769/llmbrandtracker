import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send auto-scan notification email
export const sendAutoScanEmail = async (userEmail, scanData) => {
  try {
    const {
      brand,
      site,
      autoKeyword,
      websiteVisibilityScore,
      shareOfRecommendation,
      topCompetitor,
      avgBrandPosition,
      keywordsData,
    } = scanData;

    // Get keyword details with questions
    const kwData = keywordsData?.[0] || {};
    const enrichedQuestions = kwData.enrichedQuestions || [];
    const brandMentioned = kwData.mentionRate ? kwData.mentionRate.split("/")[0] !== "0" : false;

    // Get score badge
    let scoreBadge = { color: "#ef4444", text: "Needs Work" };
    if (websiteVisibilityScore >= 80) scoreBadge = { color: "#10b981", text: "Excellent" };
    else if (websiteVisibilityScore >= 60) scoreBadge = { color: "#3b82f6", text: "Good" };
    else if (websiteVisibilityScore >= 40) scoreBadge = { color: "#f59e0b", text: "Fair" };

    // Generate questions HTML
    const questionsHTML = enrichedQuestions.map((q, idx) => {
      const isBrandMentioned = q.brandMentioned;
      const brandPosition = q.brandPosition;
      const topComp = q.competitorPositions?.[0];

      return `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom: 12px;">
                  <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600; line-height: 1.5;">
                    ${idx + 1}. ${q.question}
                  </p>
                </td>
              </tr>
              <tr>
                <td>
                  ${isBrandMentioned ? `
                    <div style="display: inline-block; background-color: #d1fae5; border: 1px solid #86efac; padding: 8px 14px; border-radius: 8px; margin-right: 10px;">
                      <span style="color: #15803d; font-size: 13px; font-weight: 600;">✅ ${brand} Mentioned</span>
                      <span style="color: #15803d; font-size: 13px; font-weight: 700; margin-left: 8px;">Rank #${brandPosition}</span>
                    </div>
                  ` : `
                    <div style="display: inline-block; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 8px 14px; border-radius: 8px; margin-right: 10px;">
                      <span style="color: #dc2626; font-size: 13px; font-weight: 600;">❌ Not Mentioned</span>
                    </div>
                    ${topComp ? `
                      <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; padding: 8px 14px; border-radius: 8px;">
                        <span style="color: #92400e; font-size: 13px; font-weight: 600;">🥇 Top: ${topComp.name}</span>
                        <span style="color: #92400e; font-size: 13px; font-weight: 700; margin-left: 8px;">#${topComp.position}</span>
                      </div>
                    ` : ''}
                  `}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🤖 Auto-Scan Complete!</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Your automated GPT visibility analysis is ready</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Analyzed Keyword -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Analyzed Keyword</p>
                    <h2 style="margin: 0; color: #1f2937; font-size: 22px; font-weight: 700;">${autoKeyword}</h2>
                  </td>
                </tr>
              </table>

              <!-- Key Metrics -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 700;">📊 Key Metrics</h3>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 20px; background-color: #f9fafb; border-radius: 12px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Visibility Score</p>
                          <div>
                            <span style="font-size: 32px; font-weight: 700; color: #1f2937;">${websiteVisibilityScore}</span>
                            <span style="background-color: ${scoreBadge.color}20; color: ${scoreBadge.color}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 10px;">${scoreBadge.text}</span>
                          </div>
                        </td>
                        <td width="10"></td>
                        <td width="50%" style="padding: 20px; background-color: #f9fafb; border-radius: 12px; vertical-align: top;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Share of Recommendation</p>
                          <span style="font-size: 32px; font-weight: 700; color: #1f2937;">${shareOfRecommendation}%</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Brand Status -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: ${brandMentioned ? '#f0fdf4' : '#fef2f2'}; border-radius: 12px; border: 2px solid ${brandMentioned ? '#86efac' : '#fecaca'};">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">Overall Brand Status</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${brandMentioned ? '#15803d' : '#dc2626'};">
                      ${brandMentioned ? `✅ ${brand} was mentioned` : `❌ ${brand} was not mentioned`}
                    </p>
                    ${avgBrandPosition ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Average Position: <strong>#${avgBrandPosition}</strong></p>` : ''}
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Mentioned in: <strong>${kwData.mentionRate || "0/10"}</strong> questions</p>
                  </td>
                </tr>
              </table>

              <!-- Competitor Info -->
              ${topCompetitor !== "None" ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-radius: 12px; border: 2px solid #fde68a;">
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 600;">⚔️ Top Competitor Overall</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #92400e;">${topCompetitor}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Question-by-Question Analysis -->
              ${enrichedQuestions.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 700;">🔍 Question-by-Question Analysis</h3>
                  </td>
                </tr>
                <tr>
                  <td style="border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${questionsHTML}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Website Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9fafb; border-radius: 12px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 600;">📍 Analysis Details</p>
                    <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Brand:</strong> ${brand}</p>
                    <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Website:</strong> <a href="${site}" style="color: #3b82f6; text-decoration: none;">${site}</a></p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="http://localhost:5173/analytics-history" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                      View Full Report →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">Automated by GPT SEO Tracker</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Scan completed at ${new Date().toLocaleString()}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"GPT SEO Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🤖 Auto-Scan Complete: "${autoKeyword}" - Score: ${websiteVisibilityScore} ${brandMentioned ? '✅' : '❌'}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return false;
  }
};