const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://ntayegtnngnnepspnakv.supabase.co', 'sb_publishable_CHeRW6bn0Y2ouIpKKtrs3Q_tYnRR6iy');
s.from('user_profiles').select('*').then(res => console.log(res.data.length, res.error)).catch(console.error);
