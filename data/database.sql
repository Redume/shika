CREATE TABLE person(
    user_id TEXT,
    guild_id TEXT,
    channel_id TEXT DEFAULT 'None',
    blog BOOLEAN DEFAULT FALSE,
    messages INTEGER DEFAULT 0
);

CREATE TABLE guild(
    guild_id TEXT,
    prefix TEXT DEFAULT 's.',
    blog_parent TEXT DEFAULT 'None',
    blog_count INTEGER DEFAULT 0,
    message_delete TEXT DEFAULT 'None',
    max_blogs INTEGER DEFAULT 15
);