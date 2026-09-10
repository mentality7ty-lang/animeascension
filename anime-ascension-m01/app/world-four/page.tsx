import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import WorldFourClient from './world-four-client';

export default async function Page(){
  const db=await createClient();
  const {data:claims}=await db.auth.getClaims();
  const userId=claims?.claims?.sub;
  if(!userId) redirect('/login');
  const {data:character}=await db.from('characters').select('name,power,strength,speed,endurance,focus,rank,world').eq('user_id',userId).maybeSingle();
  if(!character||!character.rank?.toLowerCase().includes('custodian cleared')) redirect('/life-frontier');
  return <WorldFourClient userId={userId} character={character}/>;
}
