export interface Campaign 
{
  id?: number;
  creator: string;  
  title: string;
  description: string;
  goal: string;
  deadline: number;
  pledged: string;
  claimed: boolean;
}
