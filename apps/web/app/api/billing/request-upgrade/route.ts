import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin emails to notify about upgrade requests
const ADMIN_EMAILS = [
  'jerome+upgrade-plan-request@callhenk.com',
  process.env.ADMIN_EMAIL || 'cyrus@callhenk.com', // Fallback if not set
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { planId, planName } = body;

    if (!planId || !planName) {
      return NextResponse.json(
        { error: 'Plan ID and name are required' },
        { status: 400 },
      );
    }

    // Get user's business context
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('business_id, businesses(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!teamMember) {
      return NextResponse.json(
        { error: 'No business context found' },
        { status: 400 },
      );
    }

    const businessName =
      (teamMember.businesses as { name: string } | null)?.name ||
      'Unknown Business';

    // Get current subscription
    const { data: subscription } = await supabase
      .from('business_subscriptions')
      .select('plan:billing_plans(display_name)')
      .eq('business_id', teamMember.business_id)
      .single();

    const currentPlanName =
      (subscription?.plan as { display_name: string } | null)?.display_name ||
      'Free';

    // Send email to admins
    const emailPromises = ADMIN_EMAILS.map((adminEmail) =>
      resend.emails.send({
        from: 'Henk <noreply@callhenk.com>',
        to: adminEmail,
        subject: `Plan Upgrade Request: ${businessName} → ${planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Plan Upgrade Request</h2>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Business:</td>
                  <td style="padding: 8px 0;">${businessName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Current Plan:</td>
                  <td style="padding: 8px 0;">${currentPlanName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Requested Plan:</td>
                  <td style="padding: 8px 0; color: #0066cc; font-weight: bold;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">User Email:</td>
                  <td style="padding: 8px 0;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Business ID:</td>
                  <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${teamMember.business_id}</td>
                </tr>
              </table>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #555;">Next Steps</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Review the upgrade request details</li>
                <li>Contact the user at <a href="mailto:${user.email}">${user.email}</a></li>
                <li>Process the plan upgrade in the database</li>
                <li>Send confirmation email to the user</li>
              </ol>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>This is an automated notification from Henk platform.</p>
              <p>Requested at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      }),
    );

    // Send confirmation email to user
    emailPromises.push(
      resend.emails.send({
        from: 'Henk <noreply@callhenk.com>',
        to: user.email || '',
        subject: `Plan Upgrade Request Received - ${planName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You for Your Upgrade Request!</h2>

            <p style="color: #666; line-height: 1.6;">
              We've received your request to upgrade to the <strong>${planName}</strong> plan.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">What Happens Next?</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Our team will review your request</li>
                <li>We'll reach out to you within 1 business day</li>
                <li>We'll discuss pricing and answer any questions</li>
                <li>Once confirmed, we'll activate your new plan</li>
              </ol>
            </div>

            <div style="margin: 20px 0;">
              <p style="color: #666; line-height: 1.6;">
                In the meantime, if you'd like to discuss this upgrade directly,
                feel free to <a href="https://calendly.com/jerome-callhenk/30min" style="color: #0066cc;">book a call with us</a>.
              </p>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
              <h4 style="margin-top: 0; color: #555;">Need Help?</h4>
              <p style="color: #666; margin-bottom: 10px;">
                Reply to this email or contact us at:
              </p>
              <p style="margin: 5px 0;">
                <a href="mailto:jerome@callhenk.com" style="color: #0066cc;">jerome@callhenk.com</a>
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; text-align: center;">
              <p>Thank you for choosing Henk!</p>
            </div>
          </div>
        `,
      }),
    );

    // Wait for all emails to send
    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: 'Upgrade request sent successfully',
    });
  } catch (error) {
    console.error('Error sending upgrade request:', error);
    return NextResponse.json(
      { error: 'Failed to send upgrade request' },
      { status: 500 },
    );
  }
}
