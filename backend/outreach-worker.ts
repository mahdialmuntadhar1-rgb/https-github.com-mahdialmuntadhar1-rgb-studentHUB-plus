type D1Value = string | number | boolean | null;
interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Queue<T> {
  send(message: T, options?: { delaySeconds?: number }): Promise<void>;
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}
interface MessageBatch<T> {
  messages: { body: T; ack(): void }[];
}

export interface Env {
  DB: D1Database;
  OUTREACH_QUEUE?: Queue<OutreachQueueMessage>;
  EMAIL_PROVIDER?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM_NAME?: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_REPLY_TO?: string;
  PUBLIC_APP_URL?: string;
  UNSUBSCRIBE_SECRET?: string;
  ADMIN_API_TOKEN?: string;
  ADMIN_TEST_EMAIL?: string;
  DRY_RUN?: string;
  ALLOW_REAL_EMAIL?: string;
  TEST_MODE?: string;
  BATCH_SIZE?: string;
  DELAY_SECONDS?: string;
  MAX_PER_DAY?: string;
}

type ContactStatus = 'active' | 'unsubscribed' | 'bounced' | 'invalid' | 'duplicate';
type RecipientStatus = 'pending' | 'queued' | 'sent' | 'failed' | 'bounced' | 'skipped' | 'unsubscribed';
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'failed';

interface OutreachQueueMessage {
  campaignId: string;
}

interface ContactRecord {
  id: string;
  institution_name?: string | null;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  department?: string | null;
  governorate?: string | null;
  institution_type?: string | null;
  language?: string | null;
  source?: string | null;
  status: ContactStatus;
  notes?: string | null;
}

interface TemplateRecord {
  id: string;
  name: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  language?: string | null;
}

interface CampaignRecord {
  id: string;
  name: string;
  template_id: string;
  status: CampaignStatus;
  segment_filter_json?: string | null;
}

interface EmailProvider {
  sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>): Promise<{ messageId?: string }>;
  validateConfig(): void;
  handleWebhook(payload: unknown): Promise<{ email?: string; messageId?: string; event?: string }>;
}

const PLACEHOLDERS = [
  'institution_name',
  'contact_name',
  'email',
  'department',
  'governorate',
  'institution_type',
  'language',
  'unsubscribe_url',
] as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    },
  });
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

function isTruthy(value?: string): boolean {
  return value === 'true' || value === '1' || value === 'yes';
}

function requireAdmin(request: Request, env: Env): Response | null {
  const configured = env.ADMIN_API_TOKEN;
  if (!configured) return json({ error: 'ADMIN_API_TOKEN is not configured.' }, 500);
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token && token === configured ? null : json({ error: 'Admin access required.' }, 403);
}

function normalizeEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

async function readJson<T>(request: Request): Promise<T> {
  return await request.json() as T;
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function makeUnsubscribeToken(env: Env, contactId: string, email: string): Promise<string> {
  const secret = env.UNSUBSCRIBE_SECRET || 'missing-secret';
  const payload = `${contactId}:${email}:${secret}`;
  return `${contactId}.${await sha256(payload)}`;
}

async function tokenHash(token: string): Promise<string> {
  return sha256(`unsubscribe:${token}`);
}

function escapeHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char));
}

function sanitizeTemplateHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function greetingFor(contact: ContactRecord): string {
  if (contact.contact_name) return `Dear ${contact.contact_name},`;
  if (contact.institution_name) return `Dear ${contact.institution_name} Team,`;
  return 'Dear University Team,';
}

function renderTemplate(template: string, contact: ContactRecord, unsubscribeUrl: string): string {
  const values: Record<string, string> = {
    institution_name: contact.institution_name || '',
    contact_name: contact.contact_name || '',
    email: contact.email,
    department: contact.department || '',
    governorate: contact.governorate || '',
    institution_type: contact.institution_type || '',
    language: contact.language || '',
    unsubscribe_url: unsubscribeUrl,
  };
  let output = template.replace(/\{\{greeting\}\}/g, greetingFor(contact));
  for (const key of PLACEHOLDERS) {
    output = output.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), values[key]);
  }
  return output;
}

function withComplianceFooter(html: string, text: string, unsubscribeUrl: string, env: Env) {
  const org = escapeHtml(env.EMAIL_FROM_NAME || 'Jamiaati');
  const replyTo = escapeHtml(env.EMAIL_REPLY_TO || env.EMAIL_FROM_ADDRESS || '');
  return {
    html: `${html}<hr><p style="font-size:12px;color:#64748b">Sent by ${org}. Reply to ${replyTo}. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>.</p>`,
    text: `${text}\n\n--\nSent by ${env.EMAIL_FROM_NAME || 'Jamiaati'}. Reply to ${env.EMAIL_REPLY_TO || env.EMAIL_FROM_ADDRESS || ''}.\nUnsubscribe: ${unsubscribeUrl}`,
  };
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])));
}

function segmentWhere(filters: Record<string, string | undefined> = {}) {
  const clauses = ["status = 'active'"];
  const params: string[] = [];
  for (const field of ['governorate', 'institution_type', 'language'] as const) {
    if (filters[field]) {
      clauses.push(`${field} = ?`);
      params.push(String(filters[field]));
    }
  }
  return { sql: clauses.join(' AND '), params };
}

function getProvider(env: Env): EmailProvider {
  const provider = (env.EMAIL_PROVIDER || 'resend').toLowerCase();
  if (provider === 'sendgrid') return new SendGridProvider(env);
  if (provider === 'brevo') return new BrevoProvider(env);
  if (provider === 'mailgun') return new MailgunProvider(env);
  if (provider === 'ses') return new SesPlaceholderProvider(env);
  return new ResendProvider(env);
}

abstract class JsonApiProvider implements EmailProvider {
  constructor(protected env: Env) {}
  validateConfig(): void {
    if (!this.env.EMAIL_API_KEY || !this.env.EMAIL_FROM_ADDRESS) {
      throw new Error('EMAIL_API_KEY and EMAIL_FROM_ADDRESS are required.');
    }
  }
  abstract sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>): Promise<{ messageId?: string }>;
  async handleWebhook(payload: any) {
    return {
      email: payload?.email || payload?.recipient || payload?.data?.email,
      messageId: payload?.message_id || payload?.sg_message_id || payload?.data?.id,
      event: payload?.event || payload?.type,
    };
  }
  protected from() {
    const name = this.env.EMAIL_FROM_NAME || 'Jamiaati';
    return `${name} <${this.env.EMAIL_FROM_ADDRESS}>`;
  }
}

class ResendProvider extends JsonApiProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from(), to, subject, html, text, reply_to: this.env.EMAIL_REPLY_TO, tags: Object.entries(metadata).map(([name, value]) => ({ name, value })) }),
    });
    const body: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.message || 'Resend send failed');
    return { messageId: body.id };
  }
}

class SendGridProvider extends JsonApiProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }], custom_args: metadata }],
        from: { email: this.env.EMAIL_FROM_ADDRESS, name: this.env.EMAIL_FROM_NAME || 'Jamiaati' },
        reply_to: this.env.EMAIL_REPLY_TO ? { email: this.env.EMAIL_REPLY_TO } : undefined,
        subject,
        content: [{ type: 'text/plain', value: text }, { type: 'text/html', value: html }],
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    return { messageId: response.headers.get('x-message-id') || undefined };
  }
}

class BrevoProvider extends JsonApiProvider {
  async sendEmail(to: string, subject: string, html: string, text: string, metadata: Record<string, string>) {
    this.validateConfig();
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': this.env.EMAIL_API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { email: this.env.EMAIL_FROM_ADDRESS, name: this.env.EMAIL_FROM_NAME || 'Jamiaati' },
        to: [{ email: to }],
        replyTo: this.env.EMAIL_REPLY_TO ? { email: this.env.EMAIL_REPLY_TO } : undefined,
        subject,
        htmlContent: html,
        textContent: text,
        tags: Object.values(metadata),
      }),
    });
    const body: any = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.message || 'Brevo send failed');
    return { messageId: body.messageId };
  }
}

class MailgunProvider extends JsonApiProvider {
  async sendEmail(): Promise<{ messageId?: string }> {
    throw new Error('Mailgun requires MAILGUN_DOMAIN support before production use.');
  }
}

class SesPlaceholderProvider extends JsonApiProvider {
  async sendEmail(): Promise<{ messageId?: string }> {
    throw new Error('Amazon SES SigV4 signing is intentionally not stubbed; add a signed SES adapter before production use.');
  }
}

async function importContacts(request: Request, env: Env) {
  const size = Number(request.headers.get('content-length') || 0);
  if (size > 1024 * 1024) return json({ error: 'CSV is too large. Limit is 1 MB.' }, 413);
  const text = await request.text();
  const rows = parseCsv(text);
  if (!rows.length || !('email' in rows[0])) return json({ error: 'CSV must include an email column.' }, 400);
  const summary = { totalRows: rows.length, imported: 0, updated: 0, duplicates: 0, invalidEmails: 0 };
  const allowed = ['institution_name', 'contact_name', 'phone', 'department', 'governorate', 'institution_type', 'language', 'source', 'notes'];

  for (const row of rows) {
    const email = normalizeEmail(row.email);
    if (!validEmail(email)) {
      summary.invalidEmails += 1;
      continue;
    }
    const existing = await env.DB.prepare('SELECT * FROM outreach_contacts WHERE email = ?').bind(email).first<ContactRecord>();
    if (existing) {
      summary.duplicates += 1;
      const next: Record<string, string> = {};
      for (const field of allowed) {
        if (!existing[field as keyof ContactRecord] && row[field]) next[field] = row[field].trim();
      }
      if (Object.keys(next).length) {
        const sets = Object.keys(next).map((field) => `${field} = ?`).join(', ');
        await env.DB.prepare(`UPDATE outreach_contacts SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .bind(...Object.values(next), existing.id)
          .run();
        summary.updated += 1;
      }
      continue;
    }
    await env.DB.prepare(`
      INSERT INTO outreach_contacts (id, email, institution_name, contact_name, phone, department, governorate, institution_type, language, source, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(id('contact'), email, ...allowed.map((field) => row[field]?.trim() || null)).run();
    summary.imported += 1;
  }
  return json(summary);
}

async function listContacts(request: Request, env: Env) {
  const url = new URL(request.url);
  const search = `%${url.searchParams.get('search') || ''}%`;
  const status = url.searchParams.get('status') || undefined;
  const governorate = url.searchParams.get('governorate') || undefined;
  const type = url.searchParams.get('institution_type') || undefined;
  const language = url.searchParams.get('language') || undefined;
  const clauses = ['(email LIKE ? OR institution_name LIKE ? OR contact_name LIKE ?)'];
  const params: string[] = [search, search, search];
  for (const [field, value] of Object.entries({ status, governorate, institution_type: type, language })) {
    if (value) {
      clauses.push(`${field} = ?`);
      params.push(value);
    }
  }
  const rows = await env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT 500`).bind(...params).all();
  return json(rows.results || []);
}

async function patchContact(request: Request, env: Env, contactId: string) {
  const body = await readJson<Record<string, string>>(request);
  const allowed = ['institution_name', 'contact_name', 'phone', 'department', 'governorate', 'institution_type', 'language', 'source', 'status', 'notes'];
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (!Object.keys(patch).length) return json({ error: 'No valid fields.' }, 400);
  const sets = Object.keys(patch).map((field) => `${field} = ?`).join(', ');
  await env.DB.prepare(`UPDATE outreach_contacts SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...Object.values(patch), contactId).run();
  return json({ success: true });
}

async function createTemplate(request: Request, env: Env) {
  const body = await readJson<any>(request);
  if (!body.name || !body.subject_template || !body.html_template || !body.text_template) return json({ error: 'Template name, subject, HTML, and text are required.' }, 400);
  await env.DB.prepare(`
    INSERT INTO outreach_templates (id, name, subject_template, html_template, text_template, language, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id('template'), body.name, body.subject_template, sanitizeTemplateHtml(body.html_template), body.text_template, body.language || null, body.created_by || 'admin').run();
  return json({ success: true });
}

async function listTemplates(env: Env) {
  const rows = await env.DB.prepare('SELECT * FROM outreach_templates ORDER BY created_at DESC').all();
  return json(rows.results || []);
}

async function patchTemplate(request: Request, env: Env, templateId: string) {
  const body = await readJson<any>(request);
  const allowed = ['name', 'subject_template', 'html_template', 'text_template', 'language'];
  const patch = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (patch.html_template) patch.html_template = sanitizeTemplateHtml(String(patch.html_template));
  if (!Object.keys(patch).length) return json({ error: 'No valid fields.' }, 400);
  const sets = Object.keys(patch).map((field) => `${field} = ?`).join(', ');
  const values = Object.values(patch).map((value) => value == null ? null : String(value));
  await env.DB.prepare(`UPDATE outreach_templates SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(...values, templateId).run();
  return json({ success: true });
}

async function createCampaign(request: Request, env: Env) {
  const body = await readJson<any>(request);
  if (!body.name || !body.template_id) return json({ error: 'Campaign name and template_id are required.' }, 400);
  const campaignId = id('campaign');
  const filters = body.segment_filter_json || {};
  const where = segmentWhere(filters);
  const count = await env.DB.prepare(`SELECT COUNT(*) as count FROM outreach_contacts WHERE ${where.sql}`).bind(...where.params).first<{ count: number }>();
  await env.DB.prepare(`
    INSERT INTO outreach_campaigns (id, name, template_id, segment_filter_json, total_recipients)
    VALUES (?, ?, ?, ?, ?)
  `).bind(campaignId, body.name, body.template_id, JSON.stringify(filters), count?.count || 0).run();
  return json({ id: campaignId, success: true });
}

async function listCampaigns(env: Env) {
  const rows = await env.DB.prepare('SELECT * FROM outreach_campaigns ORDER BY created_at DESC LIMIT 100').all();
  return json(rows.results || []);
}

async function campaignDetail(env: Env, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first();
  if (!campaign) return json({ error: 'Campaign not found.' }, 404);
  const recipients = await env.DB.prepare('SELECT * FROM outreach_campaign_recipients WHERE campaign_id = ? ORDER BY created_at DESC LIMIT 1000').bind(campaignId).all();
  return json({ campaign, recipients: recipients.results || [] });
}

async function previewCampaign(env: Env, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first<CampaignRecord>();
  if (!campaign) return json({ error: 'Campaign not found.' }, 404);
  const template = await env.DB.prepare('SELECT * FROM outreach_templates WHERE id = ?').bind(campaign.template_id).first<TemplateRecord>();
  if (!template) return json({ error: 'Template not found.' }, 404);
  const filters = JSON.parse(campaign.segment_filter_json || '{}');
  const where = segmentWhere(filters);
  const contacts = await env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${where.sql} LIMIT 10`).bind(...where.params).all<ContactRecord>();
  const samples = await Promise.all((contacts.results || []).map(async (contact) => personalize(env, template, contact)));
  return json({ placeholders: PLACEHOLDERS, samples });
}

async function personalize(env: Env, template: TemplateRecord, contact: ContactRecord) {
  const token = await makeUnsubscribeToken(env, contact.id, contact.email);
  const unsubscribeUrl = `${env.PUBLIC_APP_URL || ''}/api/outreach/unsubscribe?token=${encodeURIComponent(token)}`;
  const subject = renderTemplate(template.subject_template, contact, unsubscribeUrl);
  const html = renderTemplate(template.html_template, contact, unsubscribeUrl);
  const text = renderTemplate(template.text_template, contact, unsubscribeUrl);
  const withFooter = withComplianceFooter(html, text, unsubscribeUrl, env);
  return { contact, subject, html: withFooter.html, text: withFooter.text };
}

async function ensureRecipients(env: Env, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first<CampaignRecord>();
  if (!campaign) throw new Error('Campaign not found.');
  const template = await env.DB.prepare('SELECT * FROM outreach_templates WHERE id = ?').bind(campaign.template_id).first<TemplateRecord>();
  if (!template) throw new Error('Template not found.');
  const filters = JSON.parse(campaign.segment_filter_json || '{}');
  const where = segmentWhere(filters);
  const contacts = await env.DB.prepare(`SELECT * FROM outreach_contacts WHERE ${where.sql}`).bind(...where.params).all<ContactRecord>();
  let total = 0;
  for (const contact of contacts.results || []) {
    if (contact.status !== 'active' || !validEmail(contact.email)) continue;
    const rendered = await personalize(env, template, contact);
    await env.DB.prepare(`
      INSERT OR IGNORE INTO outreach_campaign_recipients (id, campaign_id, contact_id, email, personalized_subject, personalized_html, personalized_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id('recipient'), campaignId, contact.id, contact.email, rendered.subject, rendered.html, rendered.text).run();
    total += 1;
  }
  await env.DB.prepare('UPDATE outreach_campaigns SET total_recipients = ? WHERE id = ?').bind(total, campaignId).run();
}

async function enqueueCampaign(env: Env, ctx: ExecutionContext, campaignId: string) {
  await ensureRecipients(env, campaignId);
  await env.DB.prepare("UPDATE outreach_campaigns SET status = 'sending', started_at = COALESCE(started_at, CURRENT_TIMESTAMP) WHERE id = ?").bind(campaignId).run();
  if (env.OUTREACH_QUEUE) {
    await env.OUTREACH_QUEUE.send({ campaignId }, { delaySeconds: Number(env.DELAY_SECONDS || 30) });
  } else {
    ctx.waitUntil(processCampaignBatch(env, campaignId));
  }
  return json({ success: true });
}

async function sendTestEmail(env: Env, campaignId: string) {
  const testEmail = env.ADMIN_TEST_EMAIL;
  if (!testEmail || !validEmail(testEmail)) return json({ error: 'ADMIN_TEST_EMAIL is required for test sends.' }, 400);
  const preview = await previewCampaign(env, campaignId);
  const body: any = await preview.json();
  const sample = body.samples?.[0];
  if (!sample) return json({ error: 'No eligible sample recipient.' }, 400);
  if ((env.DRY_RUN !== 'false' || env.ALLOW_REAL_EMAIL !== 'true')) return json({ success: true, dryRun: true, to: testEmail, subject: sample.subject });
  const provider = getProvider(env);
  const result = await provider.sendEmail(testEmail, `[TEST] ${sample.subject}`, sample.html, sample.text, { campaignId, test: 'true' });
  return json({ success: true, providerMessageId: result.messageId });
}

async function processCampaignBatch(env: Env, campaignId: string) {
  const campaign = await env.DB.prepare('SELECT * FROM outreach_campaigns WHERE id = ?').bind(campaignId).first<CampaignRecord>();
  if (!campaign || campaign.status !== 'sending') return;
  const maxPerDay = Number(env.MAX_PER_DAY || 500);
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = await env.DB.prepare("SELECT COUNT(*) as count FROM outreach_campaign_recipients WHERE status = 'sent' AND sent_at >= ?").bind(`${today}T00:00:00.000Z`).first<{ count: number }>();
  if ((sentToday?.count || 0) >= maxPerDay) return;
  const batchSize = Math.min(Number(env.BATCH_SIZE || 25), maxPerDay - (sentToday?.count || 0));
  const recipients = await env.DB.prepare(`
    SELECT * FROM outreach_campaign_recipients
    WHERE campaign_id = ? AND status IN ('pending', 'queued', 'failed')
    ORDER BY created_at ASC
    LIMIT ?
  `).bind(campaignId, batchSize).all<any>();
  if (!recipients.results?.length) {
    await refreshCampaignCounts(env, campaignId);
    await env.DB.prepare("UPDATE outreach_campaigns SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(campaignId).run();
    return;
  }
  const provider = getProvider(env);
  for (const recipient of recipients.results) {
    const contact = await env.DB.prepare('SELECT * FROM outreach_contacts WHERE id = ?').bind(recipient.contact_id).first<ContactRecord>();
    if (!contact || contact.status !== 'active') {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(contact?.status === 'unsubscribed' ? 'unsubscribed' : 'skipped', recipient.id).run();
      continue;
    }
    const to = isTruthy(env.TEST_MODE) ? env.ADMIN_TEST_EMAIL : recipient.email;
    if (!to || !validEmail(to)) {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'failed', error_message = 'Invalid recipient or ADMIN_TEST_EMAIL', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(recipient.id).run();
      continue;
    }
    try {
      if ((env.DRY_RUN !== 'false' || env.ALLOW_REAL_EMAIL !== 'true')) {
        await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'sent', provider_message_id = 'dry-run', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(recipient.id).run();
      } else {
        const result = await provider.sendEmail(to, recipient.personalized_subject, recipient.personalized_html, recipient.personalized_text, { campaignId, recipientId: recipient.id, contactId: recipient.contact_id });
        await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'sent', provider_message_id = ?, sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(result.messageId || null, recipient.id).run();
      }
    } catch (error: any) {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(String(error?.message || error), recipient.id).run();
    }
  }
  await refreshCampaignCounts(env, campaignId);
  if (env.OUTREACH_QUEUE) await env.OUTREACH_QUEUE.send({ campaignId }, { delaySeconds: Number(env.DELAY_SECONDS || 30) });
}

async function refreshCampaignCounts(env: Env, campaignId: string) {
  const rows = await env.DB.prepare('SELECT status, COUNT(*) as count FROM outreach_campaign_recipients WHERE campaign_id = ? GROUP BY status').bind(campaignId).all<any>();
  const counts = Object.fromEntries((rows.results || []).map((row) => [row.status, row.count]));
  await env.DB.prepare(`
    UPDATE outreach_campaigns SET sent_count = ?, failed_count = ?, bounced_count = ?, unsubscribed_count = ? WHERE id = ?
  `).bind(counts.sent || 0, counts.failed || 0, counts.bounced || 0, counts.unsubscribed || 0, campaignId).run();
}

async function unsubscribe(request: Request, env: Env) {
  const token = new URL(request.url).searchParams.get('token') || '';
  const [contactId, digest] = token.split('.');
  if (!contactId || !digest) return new Response('Invalid unsubscribe token.', { status: 400 });
  const contact = await env.DB.prepare('SELECT * FROM outreach_contacts WHERE id = ?').bind(contactId).first<ContactRecord>();
  if (!contact) return new Response('Contact not found.', { status: 404 });
  const expected = await makeUnsubscribeToken(env, contact.id, contact.email);
  if (expected !== token) return new Response('Invalid unsubscribe token.', { status: 400 });
  await env.DB.prepare("UPDATE outreach_contacts SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(contact.id).run();
  await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP WHERE contact_id = ? AND status IN ('pending', 'queued', 'failed')").bind(contact.id).run();
  await env.DB.prepare('INSERT INTO outreach_unsubscribes (id, email, contact_id, reason, token_hash) VALUES (?, ?, ?, ?, ?)')
    .bind(id('unsubscribe'), contact.email, contact.id, 'self-service', await tokenHash(token)).run();
  return new Response('<h1>You are unsubscribed</h1><p>You will not receive future outreach emails from this system.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleWebhook(request: Request, env: Env) {
  const provider = getProvider(env);
  const event = await provider.handleWebhook(await request.json().catch(() => ({})));
  if (event.messageId) {
    if (event.event && /bounce/i.test(event.event)) {
      await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'bounced', updated_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?").bind(event.messageId).run();
      if (event.email) await env.DB.prepare("UPDATE outreach_contacts SET status = 'bounced', updated_at = CURRENT_TIMESTAMP WHERE email = ?").bind(normalizeEmail(event.email)).run();
    } else if (event.event && /open/i.test(event.event)) {
      await env.DB.prepare('UPDATE outreach_campaign_recipients SET opened_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?').bind(event.messageId).run();
    } else if (event.event && /click/i.test(event.event)) {
      await env.DB.prepare('UPDATE outreach_campaign_recipients SET clicked_at = CURRENT_TIMESTAMP WHERE provider_message_id = ?').bind(event.messageId).run();
    }
  }
  return json({ success: true });
}

async function exportCsv(env: Env, campaignId?: string) {
  const rows = campaignId
    ? await env.DB.prepare('SELECT * FROM outreach_campaign_recipients WHERE campaign_id = ? ORDER BY created_at DESC').bind(campaignId).all<any>()
    : await env.DB.prepare('SELECT * FROM outreach_contacts ORDER BY created_at DESC').all<any>();
  const data = rows.results || [];
  const headers = Object.keys(data[0] || { id: '', email: '', status: '' });
  const csv = [headers.join(','), ...data.map((row) => headers.map((header) => `"${String(row[header] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="outreach-export.csv"' } });
}

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method === 'OPTIONS') return json({ ok: true });
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === '/api/outreach/unsubscribe') return unsubscribe(request, env);
  if (path === '/api/outreach/webhooks/email-provider' && request.method === 'POST') return handleWebhook(request, env);
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  if (path === '/api/outreach/contacts/import' && request.method === 'POST') return importContacts(request, env);
  if (path === '/api/outreach/contacts' && request.method === 'GET') return listContacts(request, env);
  if (path === '/api/outreach/contacts/export' && request.method === 'GET') return exportCsv(env);
  let match = path.match(/^\/api\/outreach\/contacts\/([^/]+)$/);
  if (match && request.method === 'PATCH') return patchContact(request, env, match[1]);

  if (path === '/api/outreach/templates' && request.method === 'POST') return createTemplate(request, env);
  if (path === '/api/outreach/templates' && request.method === 'GET') return listTemplates(env);
  match = path.match(/^\/api\/outreach\/templates\/([^/]+)$/);
  if (match && request.method === 'PATCH') return patchTemplate(request, env, match[1]);

  if (path === '/api/outreach/campaigns' && request.method === 'POST') return createCampaign(request, env);
  if (path === '/api/outreach/campaigns' && request.method === 'GET') return listCampaigns(env);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)$/);
  if (match && request.method === 'GET') return campaignDetail(env, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/preview$/);
  if (match && request.method === 'POST') return previewCampaign(env, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/send-test$/);
  if (match && request.method === 'POST') return sendTestEmail(env, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/start$/);
  if (match && request.method === 'POST') return enqueueCampaign(env, ctx, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/pause$/);
  if (match && request.method === 'POST') {
    await env.DB.prepare("UPDATE outreach_campaigns SET status = 'paused' WHERE id = ?").bind(match[1]).run();
    return json({ success: true });
  }
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/resume$/);
  if (match && request.method === 'POST') return enqueueCampaign(env, ctx, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/retry-failed$/);
  if (match && request.method === 'POST') {
    await env.DB.prepare("UPDATE outreach_campaign_recipients SET status = 'pending', error_message = NULL WHERE campaign_id = ? AND status = 'failed'").bind(match[1]).run();
    return enqueueCampaign(env, ctx, match[1]);
  }
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/export$/);
  if (match && request.method === 'GET') return exportCsv(env, match[1]);
  match = path.match(/^\/api\/outreach\/campaigns\/([^/]+)\/stop$/);
  if (match && request.method === 'POST') {
    await env.DB.prepare("UPDATE outreach_campaigns SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(match[1]).run();
    return json({ success: true });
  }

  if (path === '/api/outreach/dashboard' && request.method === 'GET') {
    const contacts = await env.DB.prepare('SELECT status, COUNT(*) as count FROM outreach_contacts GROUP BY status').all<any>();
    const campaigns = await env.DB.prepare('SELECT * FROM outreach_campaigns ORDER BY created_at DESC LIMIT 10').all();
    return json({ contacts: contacts.results || [], recentCampaigns: campaigns.results || [] });
  }
  return json({ error: 'Not found.' }, 404);
}

export default {
  fetch: route,
  async queue(batch: MessageBatch<OutreachQueueMessage>, env: Env) {
    for (const message of batch.messages) {
      await processCampaignBatch(env, message.body.campaignId);
      message.ack();
    }
  },
};

