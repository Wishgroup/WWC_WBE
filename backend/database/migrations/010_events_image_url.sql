-- Optional cover image URL for events (displayed on public Events page)
ALTER TABLE events ADD COLUMN image_url VARCHAR(500) NULL AFTER location;
