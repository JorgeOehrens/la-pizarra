ALTER TABLE team_charges
  ADD COLUMN IF NOT EXISTS series_id uuid,
  ADD COLUMN IF NOT EXISTS installment_number integer,
  ADD COLUMN IF NOT EXISTS total_installments integer,
  ADD COLUMN IF NOT EXISTS match_id uuid REFERENCES matches(id);

CREATE INDEX IF NOT EXISTS idx_team_charges_series_id ON team_charges(series_id);
CREATE INDEX IF NOT EXISTS idx_team_charges_match_id ON team_charges(match_id);
