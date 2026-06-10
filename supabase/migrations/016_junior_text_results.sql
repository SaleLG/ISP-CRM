-- Junior sales text-only interaction results

ALTER TABLE call_logs DROP CONSTRAINT IF EXISTS call_logs_call_result_check;
ALTER TABLE call_logs ADD CONSTRAINT call_logs_call_result_check
  CHECK (call_result IN (
    'No Answer',
    'Left Voicemail',
    'Customer Answered',
    'No Text Reply',
    'Simple Reschedule',
    'Call Requested',
    'Reschedule by Phone',
    'Callback Requested',
    'Rescheduled',
    'New Account Created',
    'Not Interested',
    'Wrong Number',
    'Do Not Call',
    'ISP Complaint',
    'Price Approval Needed'
  ));
