type Client = {
  id: string;
  name: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
};

type Business = {
  name: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function reminderSubject(client: Client) {
  const firstName = client.name.split(" ")[0];
  return `${firstName}, your ${client.service} appointment is coming up`;
}

export function reminderHtml(client: Client, business: Business) {
  const firstName = client.name.split(" ")[0];
  const rescheduleUrl = `${APP_URL}/reschedule/${client.id}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1C1C1A;">
      <p>Hi ${firstName},</p>
      <p>
        This is a reminder about your <strong>${client.service}</strong> appointment
        at <strong>${business.name}</strong> on
        <strong>${client.appointment_date}</strong> at <strong>${client.appointment_time}</strong>.
      </p>
      <p>Need a different time? You can pick a new one below — no need to call.</p>
      <p style="margin: 24px 0;">
        <a href="${rescheduleUrl}"
           style="background:#B5562B; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; display:inline-block;">
          Reschedule my appointment
        </a>
      </p>
      <p style="color:#666; font-size:13px;">See you soon,<br/>${business.name}</p>
    </div>
  `;
}
