'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function MissionLauncher(){
 const pathname=usePathname();
 const [ready,setReady]=useState(false);
 useEffect(()=>{if(pathname!=='/')return;const db=createClient();void (async()=>{const {data:{user}}=await db.auth.getUser();if(!user)return;const {data}=await db.from('characters').select('rank').eq('user_id',user.id).maybeSingle();setReady(data?.rank?.toLowerCase().includes('adept')??false)})()},[pathname]);
 if(pathname!=='/'||!ready)return null;
 return <Link className="field-mission-launcher" href="/village"><span>NEW AREA UNLOCKED</span><strong>NINJA VILLAGE · ENTER THE GATES</strong><small>Mentor · mission board · technique path →</small></Link>
}
