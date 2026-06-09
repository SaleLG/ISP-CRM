-- Remap legacy Recovery Team labels in historical data

UPDATE call_logs
SET team = 'Recycle Hold'
WHERE team = 'Recovery Team';

UPDATE customers
SET assigned_team = 'Recycle Hold'
WHERE assigned_team = 'Recovery Team';

UPDATE customers
SET workflow_stage = 'No Reply - Hold'
WHERE workflow_stage IN ('Recovery Needed', 'In Recovery');

UPDATE customers
SET transfer_status = 'Recycle in 30 Days'
WHERE transfer_status IN ('Move to Recovery Needed', 'Moved to Recovery');

UPDATE activities
SET old_value = 'Recycle Hold'
WHERE old_value = 'Recovery Team';

UPDATE activities
SET new_value = 'Recycle Hold'
WHERE new_value = 'Recovery Team';
