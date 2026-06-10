CREATE TABLE IF NOT EXISTS outreach_contacts (
  id TEXT PRIMARY KEY,
  institution_name TEXT,
  contact_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department TEXT,
  governorate TEXT,
  institution_type TEXT,
  language TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'invalid', 'duplicate')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outreach_contacts_status ON outreach_contacts(status);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_governorate ON outreach_contacts(governorate);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_type ON outreach_contacts(institution_type);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_language ON outreach_contacts(language);

CREATE TABLE IF NOT EXISTS outreach_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  language TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'paused', 'completed', 'failed')),
  segment_filter_json TEXT,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  unsubscribed_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (template_id) REFERENCES outreach_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status ON outreach_campaigns(status);

CREATE TABLE IF NOT EXISTS outreach_campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  email TEXT NOT NULL,
  personalized_subject TEXT NOT NULL,
  personalized_html TEXT NOT NULL,
  personalized_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'bounced', 'skipped', 'unsubscribed')),
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
  FOREIGN KEY (contact_id) REFERENCES outreach_contacts(id),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_outreach_recipients_campaign ON outreach_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_recipients_status ON outreach_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_outreach_recipients_email ON outreach_campaign_recipients(email);

CREATE TABLE IF NOT EXISTS outreach_unsubscribes (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  contact_id TEXT,
  reason TEXT,
  token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES outreach_contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_outreach_unsubscribes_email ON outreach_unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_outreach_unsubscribes_token ON outreach_unsubscribes(token_hash);
