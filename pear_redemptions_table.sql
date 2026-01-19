-- Create table to track PEAR token redemptions
CREATE TABLE IF NOT EXISTS pear_redemptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,                    -- e.g., 'pearadox_tshirt', 'usdc_redemption'
  item_name TEXT NOT NULL,                  -- Human-readable name, e.g., 'Pearadox T-Shirt'
  pear_amount INTEGER NOT NULL,             -- Amount of PEAR tokens redeemed
  size TEXT,                                -- For merchandise (S, M, L, XL, 2XL, 3XL), NULL for non-merch
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending', 'processing', 'shipped', 'completed', 'cancelled'
  shipping_address JSONB,                   -- For physical items: { name, street, city, state, zip, country }
  tracking_number TEXT,                     -- Shipping tracking number (if applicable)
  notes TEXT,                               -- Admin notes or special instructions
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pear_redemptions_user_id ON pear_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pear_redemptions_item_id ON pear_redemptions(item_id);
CREATE INDEX IF NOT EXISTS idx_pear_redemptions_status ON pear_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_pear_redemptions_redeemed_at ON pear_redemptions(redeemed_at DESC);

-- Enable Row Level Security
ALTER TABLE pear_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON pear_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own redemptions
CREATE POLICY "Users can insert their own redemptions"
  ON pear_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending redemptions (e.g., add shipping address)
CREATE POLICY "Users can update their own pending redemptions"
  ON pear_redemptions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pear_redemptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on updates
DROP TRIGGER IF EXISTS trigger_update_pear_redemptions_updated_at ON pear_redemptions;
CREATE TRIGGER trigger_update_pear_redemptions_updated_at
  BEFORE UPDATE ON pear_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_pear_redemptions_updated_at();

-- Add comments to the table
COMMENT ON TABLE pear_redemptions IS 'Tracks PEAR token redemptions for merchandise and other rewards';
COMMENT ON COLUMN pear_redemptions.user_id IS 'Reference to the user who made the redemption';
COMMENT ON COLUMN pear_redemptions.item_id IS 'Unique identifier for the redeemed item (e.g., pearadox_tshirt)';
COMMENT ON COLUMN pear_redemptions.item_name IS 'Human-readable name of the redeemed item';
COMMENT ON COLUMN pear_redemptions.pear_amount IS 'Number of PEAR tokens spent on this redemption';
COMMENT ON COLUMN pear_redemptions.size IS 'Size selection for merchandise items (NULL for non-merch)';
COMMENT ON COLUMN pear_redemptions.status IS 'Current status: pending, processing, shipped, completed, cancelled';
COMMENT ON COLUMN pear_redemptions.shipping_address IS 'JSON object containing shipping details for physical items';
COMMENT ON COLUMN pear_redemptions.tracking_number IS 'Shipping carrier tracking number';
COMMENT ON COLUMN pear_redemptions.notes IS 'Admin notes or special instructions';
COMMENT ON COLUMN pear_redemptions.redeemed_at IS 'Timestamp when the redemption was initiated';
COMMENT ON COLUMN pear_redemptions.updated_at IS 'Timestamp of the last update to this record';
