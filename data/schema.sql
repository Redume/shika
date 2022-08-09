CREATE TABLE person(
    user_id TEXT,
    guild_id TEXT,
    channel_id TEXT DEFAULT 'None',
    blog BOOLEAN DEFAULT False,
    messages INTEGER DEFAULT 0
);

CREATE TABLE guild(
    guild_id TEXT,
    all_messages INTEGER DEFAULT 0,
    max_blog INTEGER DEFAULT 0,
    blogs_count INTEGER DEFAULT 0,
    parent_id TEXT DEFAULT 'None'
);