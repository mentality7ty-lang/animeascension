import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NightSignalClient from './night-signal-client';
export default async function NightSignalPage(){const supabase=await createClient();const {data:claims}=await supabase.auth.getClaims();const userId=claims?.claims?.sub;if(!userId)redirect('/login');const {data:c}=await supabase.from('characters').select('name,power,strength,speed,endurance,focus,rank').eq('user_id',userId).maybeSingle();if(!c||!c.rank?.toLowerCase().includes('flash'))redirect('/village');return <NightSignalClient userId={userId} initialCharacter={c}/>}
