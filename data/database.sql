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
    message_delete TEXT DEFAULT 'None',
    max_blogs INTEGER DEFAULT 15,
    blog_parent TEXT DEFAULT 'None',
    blogs_count INTEGER DEFAULT 0,
    week_message_delete TEXT DEFAULT 'Воскресенье'
);