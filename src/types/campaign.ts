export interface Campaign 
{
  id?: number;
  creator: string;  
  title: string;
  description: string;
  goal: bigint;
  deadline: number;
  pledged: bigint;
  claimed: boolean;
}
