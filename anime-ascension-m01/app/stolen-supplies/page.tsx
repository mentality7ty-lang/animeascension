import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StolenSuppliesClient from './stolen-supplies-client';

export default async function StolenSuppliesPage(){
 const supabase=await createClient();
 const {data:claimsData}=await supabase.auth.getClaims();
 const userId=claimsData?.claims?.sub;
 if(!userId)redirect('/login');
 const {data:character}=await supabase.from('characters').select('name,power,speed,focus,rank').eq('user_id',userId).maybeSingle();
 if(!character||!character.rank?.toLowerCase().includes('adept'))redirect('/');
 return <StolenSuppliesClient userId={userId} initialCharacter={character}/>;
}
