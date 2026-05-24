const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://ntayegtnngnnepspnakv.supabase.co', 'sb_publishable_CHeRW6bn0Y2ouIpKKtrs3Q_tYnRR6iy');
s.from('user_profiles').select('*, city:cities!region_city_id(name)').limit(1).then(console.log).catch(console.error);
