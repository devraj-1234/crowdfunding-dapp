export interface Campaign 
{
  id?: string;
  creator: string;  
  title: string;
  description: string;
  goal: string;
  deadline: number;
  pledged: string;
  claimed: boolean;
}
