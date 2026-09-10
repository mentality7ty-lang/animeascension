import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import FirstSpiritClient from './first-spirit-client';

export default async function Page(){
  const db=await createClient();
  const {data:claims}=await db.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:character}=await db.from('characters').select('name,power,strength,speed,endurance,focus,rank,world').eq('user_id',userId).maybeSingle();
  if(!character||character.world!=='spirit'||!character.rank?.toLowerCase().includes('spirit sensed')) redirect('/world-four');
  return <FirstSpiritClient userId={userId} character={character}/>;
}
